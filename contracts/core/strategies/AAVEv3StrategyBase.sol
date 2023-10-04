// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {IWETHAdapter} from "../../interfaces/core/IWETHAdapter.sol";
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
    WST_ETH_CONTRACT,
    E_MODE_CATEGORY_ETH
} from "../Constants.sol";
import {Rebase, RebaseLibrary} from "../../libraries/BoringRebase.sol";
import {IWETH} from "../../interfaces/tokens/IWETH.sol";
import {IOracle} from "../../interfaces/core/IOracle.sol";
import {IWStETH} from "../../interfaces/lido/IWStETH.sol";
import {IPoolV3} from "../../interfaces/aave/v3/IPoolV3.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import "../../interfaces/aave/v3/DataTypes.sol";
import {IStrategy} from "../../interfaces/core/IStrategy.sol";
import {UseLeverage} from "../hooks/UseLeverage.sol";
import { UseOracle } from "../hooks/UseOracle.sol";
import { UseUniQuoter } from "../hooks/UseUniQuoter.sol";
import { UseSettings } from "../hooks/UseSettings.sol";
import { UseWETH } from "../hooks/UseWETH.sol";
import { UseStETH } from "../hooks/UseStETH.sol";
import { UseFlashLender } from "../hooks/UseFlashLender.sol";
import { UseWstETH } from "../hooks/UseWstETH.sol";
import { UseAAVEv3 } from "../hooks/UseAAVEv3.sol";
import { UseServiceRegistry } from "../hooks/UseServiceRegistry.sol";
import { UseSwapper } from "../hooks/UseSwapper.sol";
import { UseIERC20 } from "../hooks/UseIERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * 
 * Base Strategy that does AAVE leverage/deleverage using flash loans 
 * 
 * TODO: Use the Uniswap Swapper directly to optimize gas consumption
 * TODO: Enable E-Mode on initialization for collateral
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

    enum FlashLoanAction{ SUPPLY_BOORROW, PAY_DEBT_WITHDRAW, PAY_DEBT}
    event StrategyProfit(uint256 amount, uint256 deployedAmount);
    event StrategyLoss(uint256 amount, uint256 deployedAmount);

    uint256 private _targetLoanToValue = 800 * 1e6;

    struct FlashLoanData {
        uint256 originalAmount;
        address receiver;
        FlashLoanAction action;
    }

    bytes32 constant SUCCESS_MESSAGE = keccak256("ERC3156FlashBorrower.onFlashLoan");

    using SafeERC20 for IERC20;

    uint256 internal _pendingAmount = 0;
    uint256 private _deployedAmount = 0;

    IOracle         _collateralOracle;
    IOracle         _ethUSDOracle;

    constructor(
        address owner,
        ServiceRegistry registry,
        bytes32 collateralIERC20,
        bytes32 collateralOracle
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
        require(owner != address(0), "Invalid Owner Address");     
        require(address(_ethUSDOracle)!= address(0), "Invalid ETH/USD Oracle");
        require(address(_collateralOracle)!= address(0), "Invalid <Collateral>/ETH Oracle");        
        _transferOwnership(owner);        
        aaveV3().setUserEMode(E_MODE_CATEGORY_ETH);
        require(aaveV3().getUserEMode(address(this)) == E_MODE_CATEGORY_ETH, "Invalid Emode");
    }

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
            loanToValue = totalDebtInEth * PERCENTAGE_PRECISION / totalCollateralInEth;
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
        require(msg.value != 0, "No Zero deposit Allower");
        // 1. Wrap Ethereum
        wETH().deposit{value: msg.value}();
        // 2. Initiate a WETH Flash Loan
        uint256 leverage = calculateLeverageRatio(msg.value, _targetLoanToValue, 10);
        uint256 loanAmount = leverage - msg.value;
        uint256 fee = flashLender().flashFee(wETHA(), loanAmount);
        uint256 allowance = wETH().allowance(address(this), flashLenderA());
        wETH().approve(flashLenderA(), loanAmount + fee + allowance);
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
        _pendingAmount = 0;
    }

    /**
     * 
     */
    function _supplyBorrow(uint256 amount, uint256 loanAmount, uint256 fee) private {
       uint256 collateralIn = _convertFromWETH(amount + loanAmount);
        // 3. Deposit Collateral and Borrow ETH
        supplyAndBorrow(ierc20A(), collateralIn, wETHA(), loanAmount + fee);
        uint256 collateralInETH = _toWETH(collateralIn);
        _pendingAmount = collateralInETH - loanAmount + fee;
    }


    function _payDebt(uint256 debtAmount, uint256 fee ) private {
        repay(wETHA(), debtAmount);
        // Get a Quote to know how much collateral i require to pay debt
        (uint256 amountIn,,,) = uniQuoter().quoteExactOutputSingle(
                IQuoterV2.QuoteExactOutputSingleParams(
                    ierc20A(), 
                    wETHA(), 
                    debtAmount + fee,
                    500,  
                    0
                )
        );
        aaveV3().withdraw(ierc20A(), amountIn , address(this));
        swaptoken(ierc20A(), wETHA(), 1, amountIn, debtAmount + fee);             
    }

    /**
     * 
     */
    function _repayAndWithdraw(uint256 withdrawAmountInETh, uint256 repayAmount, uint256 fee, address payable receiver ) private {
        uint256 withdrawAmount = _fromWETH(withdrawAmountInETh);    
        repay(wETHA(), repayAmount);
        aaveV3().withdraw(ierc20A(), withdrawAmount, address(this));             
        // 2. Convert Collateral to WETH
        uint256 wETHAmount = _convertToWETH(withdrawAmount);
        // 2. Convert Collateral to WETH
        uint256 leftETH = wETHAmount - repayAmount - fee;                             
        // 3. Unwrap wETH
        unwrapWETH(leftETH);
        // 4. Withdraw ETh to Receiver
        (bool success, ) = payable(receiver).call{value: leftETH}("");
        require(success, "Failed to Send ETH Back");
        _pendingAmount = leftETH;
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
        // TODO: Block msg.sender to our flash Lender
        require(initiator == address(this), "FlashBorrower: Untrusted loan initiator");
        // Only Allow WETH Flash Loans
        require(token == wETHA(), "Invalid Flash Loan Asset");        
        FlashLoanData memory data = abi.decode(callData, (FlashLoanData));                
        if( data.action ==  FlashLoanAction.SUPPLY_BOORROW ) {
            _supplyBorrow(data.originalAmount, amount, fee);
        // Use the Borrowed to pay ETH and deleverage        
        } else if (data.action ==  FlashLoanAction.PAY_DEBT_WITHDRAW) {            
            _repayAndWithdraw(data.originalAmount, amount, fee, payable(data.receiver));
        } else if (data.action ==  FlashLoanAction.PAY_DEBT) { 
            _payDebt(amount, fee);
        }
        return SUCCESS_MESSAGE;
    }

    /**
     * Undeploy an amount from the current position returning ETH to the
     * owner of the shares
     * @param amount Amount undeployed
     * @param receiver Receiver of the capital
     */
    function undeploy(
        uint256 amount,
        address payable receiver
    ) external onlyOwner returns (uint256 undeployedAmount) {
        undeployedAmount = _undeploy(amount, receiver);
    }

    function _adjustDebt(
        uint256 totalCollateralBaseInEth,
        uint256 totalDebtBaseInEth
    ) internal returns (uint256 deltaDebt) {
        (deltaDebt) = calcDeltaDebt(totalCollateralBaseInEth, totalDebtBaseInEth, settings().getLoanToValue());
        uint256 fee = flashLender().flashFee(wETHA(), deltaDebt);
        uint256 allowance = wETH().allowance(address(this), flashLenderA());
        wETH().approve(flashLenderA(), deltaDebt + fee + allowance);
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
     */
    function harvest() external override onlyOwner nonReentrant returns (int256 balanceChange) {
        (uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) = _getPosition();
        uint256 ltv = 0;
        uint256 deltaDebt = 0;

        if (totalDebtBaseInEth > 0) {
            ltv = totalDebtBaseInEth * PERCENTAGE_PRECISION/totalCollateralBaseInEth;
            if (ltv > settings().getMaxLoanToValue() && ltv < PERCENTAGE_PRECISION) {
                // Pay Debt to rebalance the position
                deltaDebt = _adjustDebt(totalCollateralBaseInEth, totalDebtBaseInEth);
            }
        }
        uint256 newDeployedAmount = totalCollateralBaseInEth - deltaDebt - (totalDebtBaseInEth - deltaDebt);

        require(deltaDebt < totalCollateralBaseInEth, "Invalid DeltaDeb Calculated");

        if (newDeployedAmount == _deployedAmount) {
            return 0;
        }

        if (newDeployedAmount > _deployedAmount) {
            uint256 profit = newDeployedAmount - _deployedAmount;
            emit StrategyProfit(profit, newDeployedAmount);
            balanceChange = int256(profit);
        } else if (newDeployedAmount < _deployedAmount) {
            uint256 loss = _deployedAmount - newDeployedAmount;
            emit StrategyLoss(loss, newDeployedAmount);
            balanceChange = -int256(loss);
        }
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
        if ( totalCollateralBase !=0 ) {
              totalCollateralInEth = totalCollateralBase * 1e28 /price;
        }
        if ( totalDebtBase != 0 ) {
            totalDebtInEth = totalDebtBase * 1e28 /price;
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
        require(totalCollateralBaseInEth > totalDebtBaseInEth, "No Collateral margin to scale");    
        uint256 percentageToBurn = amount * PERCENTAGE_PRECISION /(totalCollateralBaseInEth - totalDebtBaseInEth);
        (uint256 deltaCollateralInETH, uint256 deltaDebtInETH) = calcDeltaPosition(
            percentageToBurn, 
            totalCollateralBaseInEth, 
            totalDebtBaseInEth
        );
        uint256 fee = flashLender().flashFee(wETHA(), deltaDebtInETH);
        uint256 allowance = wETH().allowance(address(this), flashLenderA());
        wETH().approve(flashLenderA(), deltaDebtInETH + fee + allowance);
         require(
            flashLender().flashLoan(
                IERC3156FlashBorrower(this),
                wETHA(),
                deltaDebtInETH,
                abi.encode(deltaCollateralInETH, receiver, FlashLoanAction.PAY_DEBT_WITHDRAW)
            ),
            "Failed to run Flash Loan"
        );
        undeployedAmount = _pendingAmount;
        _deployedAmount = _deployedAmount - undeployedAmount;
        _pendingAmount = 0;
    }
    
    function _convertFromWETH(uint256 amount) internal virtual returns (uint256);

    function _convertToWETH(uint256 amount) internal virtual returns (uint256);
    
    function _toWETH(uint256 amountIn) internal view  returns (uint256 amountOut) {
        amountOut = amountIn * _collateralOracle.getLatestPrice() /_collateralOracle.getPrecision();
    }

    function _fromWETH(uint256 amountIn) internal view returns (uint256 amountOut) {
        amountOut = amountIn * _collateralOracle.getPrecision() / _collateralOracle.getLatestPrice();
    }
}
