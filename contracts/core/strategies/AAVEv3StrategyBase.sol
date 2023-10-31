// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC3156FlashBorrower} from "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import {IERC3156FlashLender} from "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IQuoterV2} from "../../interfaces/uniswap/v3/IQuoterV2.sol";
import {
    ETH_USD_ORACLE, 
    WETH_CONTRACT, 
    PERCENTAGE_PRECISION, 
    WSTETH_ETH_ORACLE, 
    AAVE_V3, 
    FLASH_LENDER, 
    ST_ETH_CONTRACT, 
    WST_ETH_CONTRACT
} from "../Constants.sol";
import {Rebase, RebaseLibrary} from "../../libraries/BoringRebase.sol";
import {IWETH} from "../../interfaces/tokens/IWETH.sol";
import {IOracle} from "../../interfaces/core/IOracle.sol";
import {IWStETH} from "../../interfaces/lido/IWStETH.sol";
import {IPoolV3, DataTypes} from "../../interfaces/aave/v3/IPoolV3.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import {IStrategy} from "../../interfaces/core/IStrategy.sol";
import {UseLeverage} from "../hooks/UseLeverage.sol";
import {UseOracle} from "../hooks/UseOracle.sol";
import {UseUniQuoter} from "../hooks/UseUniQuoter.sol";
import {UseSettings} from "../hooks/UseSettings.sol";
import {UseWETH} from "../hooks/UseWETH.sol";
import {UseStETH} from "../hooks/UseStETH.sol";
import {UseFlashLender} from "../hooks/UseFlashLender.sol";
import {UseWstETH} from "../hooks/UseWstETH.sol";
import {UseAAVEv3} from "../hooks/UseAAVEv3.sol";
import {UseServiceRegistry} from "../hooks/UseServiceRegistry.sol";
import {UseSwapper} from "../hooks/UseSwapper.sol";
import {UseIERC20} from "../hooks/UseIERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

/**
 *
 * Strategy that does AAVE leverage/deleverage using flash loans
 * 
 *
 * TODO: Use the Uniswap Swapper directly to optimize gas consumption
 * TODO: Optimize Gas by set MAX Int allowances on initialization
 *
 * @title
 * @author
 * @notice
 */
abstract contract AAVEv3StrategyBase is
    Ownable,
    IStrategy,
    IERC3156FlashBorrower,
    UseServiceRegistry,
    UseWETH,
    UseIERC20,
    UseAAVEv3,
    UseSwapper,
    UseFlashLender,
    UseUniQuoter,
    ReentrancyGuard,
    UseLeverage,
    UseSettings
{
    enum FlashLoanAction {
        SUPPLY_BOORROW,
        PAY_DEBT_WITHDRAW,
        PAY_DEBT
    }
    event StrategyProfit(uint256 indexed amount);
    event StrategyLoss(uint256 indexed amount);
    event StrategyAmountUpdate(uint256 indexed newDeployment);

    struct FlashLoanData {
        uint256 originalAmount;
        address receiver;
        FlashLoanAction action;
    }

    bytes32 private constant _SUCCESS_MESSAGE = keccak256("ERC3156FlashBorrower.onFlashLoan");

    using SafeERC20 for IERC20;
    using Address for address;    
    using Address for address payable;
    
    uint256 internal _pendingAmount = 0;
    uint256 private _deployedAmount = 0;

    IOracle private immutable _collateralOracle;
    IOracle private immutable _ethUSDOracle;
    uint24 internal immutable _swapFeeTier;

    constructor(
        address initialOwner,
        ServiceRegistry registry,
        bytes32 collateralIERC20,
        bytes32 collateralOracle,
        uint24 swapFeeTier,
        uint8 eModeCategory
    )
        Ownable()
        UseServiceRegistry(registry)
        UseWETH(registry)
        UseIERC20(registry, collateralIERC20)
        UseAAVEv3(registry)
        UseSwapper(registry)
        UseFlashLender(registry)
        UseUniQuoter(registry)
        UseSettings(registry)
    {
        _collateralOracle = IOracle(registry.getServiceFromHash(collateralOracle));
        _ethUSDOracle = IOracle(registry.getServiceFromHash(ETH_USD_ORACLE));
        _swapFeeTier = swapFeeTier;
        require(initialOwner != address(0), "Invalid Owner Address");
        require(address(_ethUSDOracle) != address(0), "Invalid ETH/USD Oracle");
        require(address(_collateralOracle) != address(0), "Invalid <Collateral>/ETH Oracle");
        _transferOwnership(initialOwner);
        aaveV3().setUserEMode(eModeCategory);
        require(aaveV3().getUserEMode(address(this)) == eModeCategory, "Invalid Emode");
        require(wETH().approve(uniRouterA(), 2**256 - 1));
        require(ierc20().approve(uniRouterA(), 2**256 - 1));
    
       // require(wETH().approve(flashLenderA(), 2**256 - 1)); ???
    }
    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    function getPosition()
        external
        view
        returns (uint256 totalCollateralInEth, uint256 totalDebtInEth, uint256 loanToValue)
    {
        (totalCollateralInEth, totalDebtInEth) = _getPosition();
        if (totalCollateralInEth == 0) {
            loanToValue = 0;
        } else {
            loanToValue = (totalDebtInEth * PERCENTAGE_PRECISION) / totalCollateralInEth;
        }
    }

    /**
     * Current capital owned by Share Holders
     * The amount of capital is equal to Total Collateral Value - Total Debt Value
     */
    function totalAssets() public view returns (uint256 totalOwnedAssets) {
        (uint256 totalCollateralInEth, uint256 totalDebtInEth) = _getPosition();
        totalOwnedAssets = totalCollateralInEth - totalDebtInEth;
    }

    /**
     * Deploy new Capital on the pool making it productive on the Lido
     */
    function deploy() external payable onlyOwner nonReentrant returns (uint256 deployedAmount) {
        require(msg.value != 0, "No Zero deposit Allowed");
        // 1. Wrap Ethereum
        address(wETHA()).functionCallWithValue(
            abi.encodeWithSignature("deposit()"), 
            msg.value
        );        
        // 2. Initiate a WETH Flash Loan
        uint256 leverage = calculateLeverageRatio(
            msg.value, 
            settings().getLoanToValue(), 
            settings().getNrLoops()
        );
        uint256 loanAmount = leverage - msg.value;
        uint256 fee = flashLender().flashFee(wETHA(), loanAmount);
        //§uint256 allowance = wETH().allowance(address(this), flashLenderA());
        require(wETH().approve(flashLenderA(), loanAmount + fee));
        require(
            flashLender().flashLoan(
                IERC3156FlashBorrower(this),
                wETHA(),
                loanAmount,
                abi.encode(msg.value, msg.sender, FlashLoanAction.SUPPLY_BOORROW)
            ),
            "Failed to run Flash Loan"
        );
        deployedAmount = _pendingAmount;
        _deployedAmount = _deployedAmount + deployedAmount;
        emit StrategyAmountUpdate(_deployedAmount);
        // Pending amount is not cleared to save gas 
       // _pendingAmount = 0;        
    }

    /**
     *
     */
    function _supplyBorrow(uint256 amount, uint256 loanAmount, uint256 fee) private {
        uint256 collateralIn = _convertFromWETH(amount + loanAmount);
        // Deposit on AAVE Collateral and Borrow ETH
        _supplyAndBorrow(ierc20A(), collateralIn, wETHA(), loanAmount + fee);
        uint256 collateralInETH = _toWETH(collateralIn);       
        _pendingAmount = collateralInETH - loanAmount - fee;        
    }

    function _payDebt(uint256 debtAmount, uint256 fee) private {
        _repay(wETHA(), debtAmount);
        // Get a Quote to know how much collateral i require to pay debt
        (uint256 amountIn, , , ) = uniQuoter().quoteExactOutputSingle(
            IQuoterV2.QuoteExactOutputSingleParams(ierc20A(), wETHA(), debtAmount + fee, 500, 0)
        );
        require(
            aaveV3().withdraw(ierc20A(), amountIn, address(this)) == amountIn, 
            "Invalid Amount Withdrawn"
        );
        _swap(
            ISwapHandler.SwapParams(
                ierc20A(), 
                wETHA(), 
                1, 
                amountIn, 
                debtAmount + fee,
                _swapFeeTier,
                bytes("")
            )
        );
    }

    /**
     *
     */
    function _repayAndWithdraw(
        uint256 withdrawAmountInETh,
        uint256 repayAmount,
        uint256 fee,
        address payable receiver
    ) private {
        
        DataTypes.ReserveData memory reserve = aaveV3().getReserveData(ierc20A());
        uint256 balanceOf = IERC20(reserve.aTokenAddress).balanceOf(address(this));
        uint256 convertedAmount = _fromWETH(withdrawAmountInETh);
        uint256 withdrawAmount = balanceOf > convertedAmount ? convertedAmount: balanceOf;
        _repay(wETHA(), repayAmount);
        
        require(
            aaveV3().withdraw(
            ierc20A(), 
            withdrawAmount,
            address(this)) ==  withdrawAmount, 
            "Invalid Amount Withdrawn"
        );
        // Convert Collateral to WETH
        uint256 wETHAmount = _convertToWETH(withdrawAmount);
        // Calculate how much ETH i am able to withdraw
        uint256 ethToWithdraw = wETHAmount - repayAmount - fee;
        // Unwrap wETH
        _unwrapWETH(ethToWithdraw);
        // Withdraw ETh to Receiver
        payable(receiver).sendValue(ethToWithdraw);
        _pendingAmount = ethToWithdraw;
    }

    /**
     * Flash Loan Callback  
     *
     * @param initiator Flash Loan Requester
     * @param token Asset requested on the loan
     * @param amount Amount of the loan
     * @param fee  Fee to be paid to flash lender
     * @param callData Call data passed by the requester
     */
    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes memory callData
    ) external returns (bytes32) {
        require(msg.sender == flashLenderA(), "Invalid Flash loan sender");
        require(initiator == address(this), "Untrusted loan initiator");
        // Only Allow WETH Flash Loans
        require(token == wETHA(), "Invalid Flash Loan Asset");
        FlashLoanData memory data = abi.decode(callData, (FlashLoanData));
        if (data.action == FlashLoanAction.SUPPLY_BOORROW) {
            _supplyBorrow(data.originalAmount, amount, fee);
            // Use the Borrowed to pay ETH and deleverage
        } else if (data.action == FlashLoanAction.PAY_DEBT_WITHDRAW) {
            _repayAndWithdraw(data.originalAmount, amount, fee, payable(data.receiver));
        } else if (data.action == FlashLoanAction.PAY_DEBT) {
            _payDebt(amount, fee);
        }
        return _SUCCESS_MESSAGE;
    }

    /**
     * The primary purpose of the undeploy method is to allow users to burn shares and receive the attached ETH value to the sahres. 
     * The method is designed to ensure that the collateralization ratio (collateral value to debt value) remains within acceptable limits. 
     * It leverages a flash loan mechanism to obtain additional funds temporarily, covering any necessary adjustments required to maintain 
     * the desired collateralization ratio.
     * @param amount Amount undeployed
     */
    function undeploy(
        uint256 amount
    ) external onlyOwner nonReentrant returns (uint256 undeployedAmount) {
        undeployedAmount = _undeploy(amount, payable(msg.sender));
    }

    function _adjustDebt(
        uint256 totalCollateralBaseInEth,
        uint256 totalDebtBaseInEth
    ) internal returns (uint256 deltaDebt) {
        deltaDebt = calculateDebtToPay(
            settings().getLoanToValue(),
            totalCollateralBaseInEth,
            totalDebtBaseInEth
        );
        uint256 fee = flashLender().flashFee(wETHA(), deltaDebt);
       // uint256 allowance = wETH().allowance(address(this), flashLenderA());
        require(wETH().approve(flashLenderA(), deltaDebt + fee ));
        require(
            flashLender().flashLoan(
                IERC3156FlashBorrower(this),
                wETHA(),
                deltaDebt,
                abi.encode(deltaDebt, address(0), FlashLoanAction.PAY_DEBT)
            ),
            "Failed to run Flash Loan"
        );
    }

    /**
     * Harvest a profit when there is a difference between the amount the strategy
     * predicts that is deployed and the real value
     * 
     */
    function harvest() external override onlyOwner nonReentrant returns (int256 balanceChange) {
        (uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) = _getPosition();
        
        if (totalCollateralBaseInEth == 0 || 
            totalDebtBaseInEth == 0) {
            return 0;             
        }
        require(
            totalCollateralBaseInEth > totalDebtBaseInEth,
            "Collateral is lower that debt"
        );
        uint256 ltv = 0;
        uint256 deltaDebt = 0;
        // Local Copy to reduce the number of SLOADs
        uint256  deployedAmount = _deployedAmount;        
        require(
            deltaDebt < totalDebtBaseInEth, 
            "Invalid DeltaDebt Calculated"
        );

        if (totalDebtBaseInEth > 0) {
            ltv = (totalDebtBaseInEth * PERCENTAGE_PRECISION) / totalCollateralBaseInEth;
            if (ltv > settings().getMaxLoanToValue() && ltv < PERCENTAGE_PRECISION) {
                // Pay Debt to rebalance the position
                deltaDebt = _adjustDebt(totalCollateralBaseInEth, totalDebtBaseInEth);
            }
        }
        uint256 newDeployedAmount = totalCollateralBaseInEth -
            deltaDebt -
            (totalDebtBaseInEth - deltaDebt);

        require(
            deltaDebt < totalCollateralBaseInEth, 
            "Invalid DeltaDebt Calculated"
        );
           
        if (newDeployedAmount == deployedAmount) {
            return 0;
        }   

        // Log Profit or Loss when there is no debt adjustment 
        if (newDeployedAmount > deployedAmount && deltaDebt == 0) {
            uint256 profit = newDeployedAmount - deployedAmount;
            emit StrategyProfit(profit);
            balanceChange = int256(profit);
        } else if (newDeployedAmount < deployedAmount && deltaDebt == 0) {
            uint256 loss = deployedAmount - newDeployedAmount;
            emit StrategyLoss(loss);
            balanceChange = -int256(loss);
        }
        emit StrategyAmountUpdate(newDeployedAmount);     
        _deployedAmount = newDeployedAmount;
      
    }

    function _getPosition()
        internal
        view
        returns (uint256 totalCollateralInEth, uint256 totalDebtInEth)
    {
        totalCollateralInEth = 0;
        totalDebtInEth = 0;
        (uint256 totalCollateralBase, uint256 totalDebtBase, , , , ) = aaveV3().getUserAccountData(
            address(this)
        );
        uint256 price = _ethUSDOracle.getLatestPrice();
        if (totalCollateralBase != 0) {
            totalCollateralInEth = (totalCollateralBase * 1e28) / price;
        }
        if (totalDebtBase != 0) {
            totalDebtInEth = (totalDebtBase * 1e28) / price;
        }
    }

    /**
     * Undeploy an amount from the current position returning ETH to the
     * owner of the shares
     *
     * @param amount The Amount undeployed from the position
     * @param receiver The Receiver of the amount witdrawed
     */
    function _undeploy(
        uint256 amount,
        address payable receiver
    ) private returns (uint256 undeployedAmount) {
        (uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) = _getPosition();
        // When the position is in liquidation state revert the transaction
        require(
            totalCollateralBaseInEth > totalDebtBaseInEth, 
            "No Collateral margin to scale"
        );
        uint256 percentageToBurn = (amount * PERCENTAGE_PRECISION) /
            (totalCollateralBaseInEth - totalDebtBaseInEth);
  
        // Calculate how much i need to burn to accomodate the withdraw
        (uint256 deltaCollateralInETH, uint256 deltaDebtInETH) = calcDeltaPosition(
            percentageToBurn,
            totalCollateralBaseInEth,
            totalDebtBaseInEth
        );
        // Calculate the Flash Loan FEE
        uint256 fee = flashLender().flashFee(wETHA(), deltaDebtInETH);
        // Update WETH allowance to pay the debt after the flash loan
        //uint256 allowance = wETH().allowance(address(this), flashLenderA());
        require(wETH().approve(flashLenderA(), deltaDebtInETH + fee ));
        require(
            flashLender().flashLoan(
                IERC3156FlashBorrower(this),
                wETHA(),
                deltaDebtInETH,
                abi.encode(deltaCollateralInETH, receiver, FlashLoanAction.PAY_DEBT_WITHDRAW)
            ),
            "Failed to run Flash Loan"
        );
        // Update the amount of ETH deployed on the contract
        undeployedAmount = _pendingAmount;
        if(undeployedAmount > _deployedAmount) {
            _deployedAmount = 0;
        } else {
            _deployedAmount = _deployedAmount - undeployedAmount;
        }        
        emit StrategyAmountUpdate( _deployedAmount);  
        // Pending amount is not cleared to save gas      
        //_pendingAmount = 0;
    }

    function _convertFromWETH(uint256 amount) internal virtual returns (uint256);

    function _convertToWETH(uint256 amount) internal virtual returns (uint256);

    function _toWETH(uint256 amountIn) internal view returns (uint256 amountOut) {
        amountOut =
            (amountIn * _collateralOracle.getLatestPrice()) /
            _collateralOracle.getPrecision();
    }

    function _fromWETH(uint256 amountIn) internal view returns (uint256 amountOut) {
        amountOut =
            (amountIn * _collateralOracle.getPrecision()) /
            _collateralOracle.getLatestPrice();
    }
    
}
