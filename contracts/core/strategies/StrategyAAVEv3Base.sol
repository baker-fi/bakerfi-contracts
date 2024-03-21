// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC3156FlashBorrowerUpgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashBorrowerUpgradeable.sol";
import {IERC3156FlashLenderUpgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashLenderUpgradeable.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {IQuoterV2} from "../../interfaces/uniswap/v3/IQuoterV2.sol";
import {PERCENTAGE_PRECISION} from "../Constants.sol";
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
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {ETH_USD_ORACLE_CONTRACT} from "../ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AAVE v3 Recursive Staking Strategy
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev This contract implements a strategy and could be used to deploy ETH on a AAVE with
 * the a recursive staking strategy and receive an amplified yield
 *
 * The Strategy interacts with :
 *
 * ✅ BalancerFlashLender to request a flash loan from Balancer
 * ✅ Uniswap to convert from collateral token to WETH
 * ✅ Uniswap Quoter to reqques a precise price token
 * ✅ AAVE as the lending/borrow market
 *
 * The APY of this strategy depends on the followwin factors:
 *
 *  ✅ Lido APY
 *  ✅ AAVE v3 Borrow Rate
 *  ✅ Target Loan to Value
 *  ✅ Number of Loops on the recursive Strategy
 *
 *  Flow Deposit:
 *  1) Deploy X amount of ETH
 *  2) Borrow Y Amount of ETH
 *  3) Deposit X+Y amount of Collateral in AAVE
 *  4) Borrow Y ETH From AAVE to pay the flash loan
 *  5) Ends up with X+Y Amount of Collateral and Y of Debt
 *
 *  LeverageRatio = LeverageFunc(numberOfLoops, LTV)
 *  APY ~=  LidoAPY - (LidoAPY-AAVE_Borrow_Rate)*(1-leverateRatio);
 *
 *  This strategy could work for
 *  rETH/WETH
 *  awstETH/WETH
 *
 * @notice The Contract is abstract and needs to be extended to implement the
 * conversion between WETH and the collateral
 */
abstract contract StrategyAAVEv3Base is
    OwnableUpgradeable,
    IStrategy,
    IERC3156FlashBorrowerUpgradeable,
    UseServiceRegistry,
    UseWETH,
    UseIERC20,
    UseAAVEv3,
    UseSwapper,
    UseFlashLender,
    UseUniQuoter,
    ReentrancyGuardUpgradeable,
    UseLeverage,
    UseSettings
{
    enum FlashLoanAction {
        SUPPLY_BOORROW,
        PAY_DEBT_WITHDRAW,
        PAY_DEBT
    }

    struct FlashLoanData {
        uint256 originalAmount;
        address receiver;
        FlashLoanAction action;
    }

    bytes32 private constant _SUCCESS_MESSAGE = keccak256("ERC3156FlashBorrower.onFlashLoan");

    using SafeERC20Upgradeable for IERC20Upgradeable;
    using AddressUpgradeable for address;
    using AddressUpgradeable for address payable;

    uint256 internal _pendingAmount = 0;
    uint256 private _deployedAmount = 0;

    IOracle private _collateralOracle;
    IOracle private _ethUSDOracle;
    uint24 internal _swapFeeTier;

    /**
     * @dev Internal function to initialize the AAVEv3 strategy base.
     *
     * This function is used for the initial setup of the AAVEv3 strategy base contract, including ownership transfer,
     * service registry initialization, setting oracles, configuring AAVEv3 parameters, and approving allowances.
     *
     * @param initialOwner The address to be set as the initial owner of the AAVEv3 strategy base contract.
     * @param registry The service registry contract address to be used for initialization.
     * @param collateralIERC20 The hash representing the collateral ERC20 token in the service registry.
     * @param collateralOracle The hash representing the collateral/ETH oracle in the service registry.
     * @param swapFeeTier The swap fee tier for Uniswap.
     * @param eModeCategory The EMode category for the AAVEv3 strategy.
     *
     * Requirements:
     * - The caller must be in the initializing state.
     * - The initial owner address must not be the zero address.
     * - The ETH/USD oracle and collateral/USD oracle addresses must be valid.
     * - The EMode category must be successfully set for the AAVEv3 strategy.
     * - Approval allowances must be successfully set for WETH and the collateral ERC20 token for UniSwap.
     */
    function _initializeStrategyAAVEv3Base(
        address initialOwner,
        ServiceRegistry registry,
        bytes32 collateralIERC20,
        bytes32 collateralOracle,
        uint24 swapFeeTier,
        uint8 eModeCategory
    ) internal onlyInitializing {
        __Ownable_init();
        _initUseServiceRegistry(registry);
        _initUseWETH(registry);
        _initUseIERC20(registry, collateralIERC20);
        _initUseAAVEv3(registry);
        _initUseSwapper(registry);
        _initUseFlashLender(registry);
        _initUseUniQuoter(registry);
        _initUseSettings(registry);
        _collateralOracle = IOracle(registry.getServiceFromHash(collateralOracle));
        _ethUSDOracle = IOracle(registry.getServiceFromHash(ETH_USD_ORACLE_CONTRACT));
        _swapFeeTier = swapFeeTier;
        require(initialOwner != address(0), "Invalid Owner Address");
        require(address(_ethUSDOracle) != address(0), "Invalid ETH/USD Oracle");
        require(address(_collateralOracle) != address(0), "Invalid <Collateral>/ETH Oracle");
        _transferOwnership(initialOwner);
        aaveV3().setUserEMode(eModeCategory);
        require(aaveV3().getUserEMode(address(this)) == eModeCategory, "Invalid Emode");
        require(wETH().approve(uniRouterA(), 2 ** 256 - 1));
        require(ierc20().approve(uniRouterA(), 2 ** 256 - 1));
    }

    /**
     * @dev Fallback function to receive Ether.
     *
     * This function is automatically called when the contract receives Ether without a specific function call.
     * It allows the contract to accept incoming Ether transactions.
     */
    receive() external payable {}

    /**
     * @dev Retrieves the position details including total collateral, total debt, and loan-to-value ratio.
     *
     * This function is externally callable and returns the total collateral in Ether, total debt in Ether,
     * and the loan-to-value ratio for the AAVEv3 strategy.
     *
     * @return totalCollateralInEth The total collateral in Ether.
     * @return totalDebtInEth The total debt in Ether.
     * @return loanToValue The loan-to-value ratio calculated as (totalDebtInEth * PERCENTAGE_PRECISION) / totalCollateralInEth.
     *
     * Requirements:
     * - The AAVEv3 strategy must be properly configured and initialized.
     */
    function getPosition()
        external
        view
        returns (uint256 totalCollateralInEth, uint256 totalDebtInEth, uint256 loanToValue)
    {
        (totalCollateralInEth, totalDebtInEth) = _getPosition(0);
        if (totalCollateralInEth == 0) {
            loanToValue = 0;
        } else {
            loanToValue = (totalDebtInEth * PERCENTAGE_PRECISION) / totalCollateralInEth;
        }
    }

    /**
     * @dev Retrieves the total owned assets by the Strategy in ETH
     *
     * This function is externally callable and returns the total owned assets in Ether, calculated as the difference
     * between total collateral and total debt. If the total collateral is less than or equal to the total debt, the
     * total owned assets is set to 0.
     *
     * @return totalOwnedAssets The total owned assets in Ether.
     *
     * Requirements:
     * - The AAVEv3 strategy must be properly configured and initialized.
     */
    function deployed() public view returns (uint256 totalOwnedAssets) {
        (uint256 totalCollateralInEth, uint256 totalDebtInEth) = _getPosition(0);
        totalOwnedAssets = totalCollateralInEth > totalDebtInEth
            ? (totalCollateralInEth - totalDebtInEth)
            : 0;
    }

    /**
     * @dev Deploys funds in the AAVEv3 strategy
     *
     * This function is externally callable only by the owner, and it involves the following steps:
     * 1. Wraps the received Ether into WETH.
     * 2. Initiates a WETH flash loan to leverage the deposited amount.
     *
     * @return deployedAmount The amount deployed in the AAVEv3 strategy after leveraging.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     * - The received Ether amount must not be zero.
     * - The AAVEv3 strategy must be properly configured and initialized.
     */
    function deploy() external payable onlyOwner nonReentrant returns (uint256 deployedAmount) {
        require(msg.value != 0, "No Zero deposit Allowed");
        // 1. Wrap Ethereum
        address(wETHA()).functionCallWithValue(abi.encodeWithSignature("deposit()"), msg.value);
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
                IERC3156FlashBorrowerUpgradeable(this),
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
     * @dev Executes the supply and borrow operations on AAVE, converting assets from WETH.
     *
     * This function is private and is used internally in the AAVEv3 strategy for depositing collateral
     * and borrowing ETH on the AAVE platform. It involves converting assets from WETH to the respective
     * tokens, supplying collateral, and borrowing ETH. The strategy owned value is logged on the  `StrategyDeploy` event.
     *
     * @param amount The amount to be supplied to AAVE (collateral) in WETH.
     * @param loanAmount The amount to be borrowed from AAVE in WETH.
     * @param fee The fee amount in WETH associated with the flash loan.
     *
     * Requirements:
     * - The AAVEv3 strategy must be properly configured and initialized.
     */
    function _supplyBorrow(uint256 amount, uint256 loanAmount, uint256 fee) private {
        uint256 collateralIn = _convertFromWETH(amount + loanAmount);
        // Deposit on AAVE Collateral and Borrow ETH
        _supplyAndBorrow(ierc20A(), collateralIn, wETHA(), loanAmount + fee);
        uint256 collateralInETH = _toWETH(collateralIn);
        _pendingAmount = collateralInETH - loanAmount - fee;
        emit StrategyDeploy(msg.sender, _pendingAmount);
    }

    /**
     * @dev Repays the debt on AAVEv3 strategy, handling the withdrawal and swap operations.
     *
     * This private function is used internally to repay the debt on the AAVEv3 strategy. It involves repaying
     * the debt on AAVE, obtaining a quote for the required collateral, withdrawing the collateral from AAVE, and
     * swapping the collateral to obtain the necessary WETH. The leftover WETH after the swap is deposited back
     * into AAVE if there are any. The function emits the `StrategyUndeploy` event after the debt repayment.
     *
     * @param debtAmount The amount of debt in WETH to be repaid on AAVE.
     * @param fee The fee amount in WETH associated with the debt repayment.
     *
     * Requirements:
     * - The AAVEv3 strategy must be properly configured and initialized.
     */
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
        uint256 output = _swap(
            ISwapHandler.SwapParams(
                ierc20A(),
                wETHA(),
                ISwapHandler.SwapType.EXACT_OUTPUT,
                amountIn,
                debtAmount + fee,
                _swapFeeTier,
                bytes("")
            )
        );
        // When there are leftovers from the swap, deposit then back
        uint256 wethLefts = output > (debtAmount + fee) ? output - (debtAmount + fee) : 0;
        if (wethLefts > 0) {
            require(wETH().approve(aaveV3A(), wethLefts));
            aaveV3().supply(wETHA(), wethLefts, address(this), 0);
        }
        emit StrategyUndeploy(msg.sender, debtAmount);
    }

    /**
     * @dev Repays a specified amount, withdraws collateral, and sends the remaining ETH to the specified receiver.
     *
     * This private function is used internally to repay a specified amount on AAVE, withdraw collateral, and send
     * the remaining ETH to the specified receiver. It involves checking the available balance, repaying the debt on
     * AAVE, withdrawing the specified amount of collateral, converting collateral to WETH, unwrapping WETH, and finally
     * sending the remaining ETH to the receiver. The function emits the `StrategyUndeploy` event after the operation.
     *
     * @param withdrawAmountInETh The amount of collateral to be withdrawn in WETH.
     * @param repayAmount The amount of debt in WETH to be repaid on AAVE.
     * @param fee The fee amount in WETH associated with the operation.
     * @param receiver The address to receive the remaining ETH after debt repayment and withdrawal.
     *
     * Requirements:
     * - The AAVEv3 strategy must be properly configured and initialized.
     */
    function _repayAndWithdraw(
        uint256 withdrawAmountInETh,
        uint256 repayAmount,
        uint256 fee,
        address payable receiver
    ) private {
        DataTypes.ReserveData memory reserve = aaveV3().getReserveData(ierc20A());
        uint256 balanceOf = IERC20Upgradeable(reserve.aTokenAddress).balanceOf(address(this));
        uint256 convertedAmount = _fromWETH(withdrawAmountInETh);
        uint256 withdrawAmount = balanceOf > convertedAmount ? convertedAmount : balanceOf;
        _repay(wETHA(), repayAmount);

        require(
            aaveV3().withdraw(ierc20A(), withdrawAmount, address(this)) == withdrawAmount,
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
        emit StrategyUndeploy(msg.sender, ethToWithdraw);
        _pendingAmount = ethToWithdraw;
    }

    /**
     * @dev Handles the execution of actions after receiving a flash loan.
     *
     * This function is part of the IERC3156FlashBorrower interface and is called by the flash lender contract
     * after a flash loan is initiated. It validates the loan parameters, ensures that the initiator is the
     * contract itself, and executes specific actions based on the provided FlashLoanAction. The supported actions
     * include supplying and borrowing funds, repaying debt and withdrawing collateral, and simply repaying debt.
     * The function returns a bytes32 success message after the actions are executed.
     *
     * @param initiator The address that initiated the flash loan.
     * @param token The address of the token being flash borrowed (should be WETH in this case).
     * @param amount The total amount of tokens being flash borrowed.
     * @param fee The fee amount associated with the flash loan.
     * @param callData Additional data encoded for specific actions, including the original amount, action type, and receiver address.
     *
     * Requirements:
     * - The flash loan sender must be the expected flash lender contract.
     * - The initiator must be the contract itself to ensure trust.
     * - Only WETH flash loans are allowed.
     * - The contract must be properly configured and initialized.
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
     * @dev Initiates the undeployment of a specified amount, sending the resulting ETH to the contract owner.
     *
     * This function allows the owner of the contract to undeploy a specified amount, which involves
     * withdrawing the corresponding collateral, converting it to WETH, unwrapping WETH, and finally
     * sending the resulting ETH to the contract owner. The undeployment is subject to reentrancy protection.
     * The function returns the amount of ETH undeployed to the contract owner.
     * The method is designed to ensure that the collateralization ratio (collateral value to debt value) remains within acceptable limits.
     * It leverages a flash loan mechanism to obtain additional funds temporarily, covering any necessary adjustments required to maintain
     * the desired collateralization ratio.
     *
     * @param amount The amount of collateral to undeploy.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
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
        require(wETH().approve(flashLenderA(), deltaDebt + fee));
        require(
            flashLender().flashLoan(
                IERC3156FlashBorrowerUpgradeable(this),
                wETHA(),
                deltaDebt,
                abi.encode(deltaDebt, address(0), FlashLoanAction.PAY_DEBT)
            ),
            "Failed to run Flash Loan"
        );
    }

    /**
     * @dev Harvests the strategy by rebalancing the collateral and debt positions.
     *
     * This function allows the owner of the contract to harvest the strategy by rebalancing the collateral
     * and debt positions. It calculates the current collateral and debt positions, checks if the collateral
     * is higher than the debt, adjusts the debt if needed to maintain the loan-to-value (LTV) within the specified
     * range, and logs profit or loss based on changes in the deployed amount. The function returns the balance change
     * as an int256 value.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     * - The contract must be properly configured and initialized.
     *
     * Emits:
     * - StrategyProfit: If the strategy achieves a profit.
     * - StrategyLoss: If the strategy incurs a loss.
     * - StrategyAmountUpdate: Whenever the deployed amount is updated.
     *
     * @return balanceChange The change in strategy balance as an int256 value.
     */
    function harvest() external override onlyOwner nonReentrant returns (int256 balanceChange) {
        (uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) = _getPosition(
            settings().getOraclePriceMaxAge()
        );

        if (totalCollateralBaseInEth == 0 || totalDebtBaseInEth == 0) {
            return 0;
        }
        require(totalCollateralBaseInEth > totalDebtBaseInEth, "Collateral is lower that debt");

        uint256 deltaDebt = 0;
        // Local Copy to reduce the number of SLOADs
        uint256 deployedAmount = _deployedAmount;
        require(deltaDebt < totalDebtBaseInEth, "Invalid DeltaDebt Calculated");

        uint256 ltv = (totalDebtBaseInEth * PERCENTAGE_PRECISION) / totalCollateralBaseInEth;
        if (ltv > settings().getMaxLoanToValue() && ltv < PERCENTAGE_PRECISION) {
            // Pay Debt to rebalance the position
            deltaDebt = _adjustDebt(totalCollateralBaseInEth, totalDebtBaseInEth);
        }
        uint256 newDeployedAmount = totalCollateralBaseInEth -
            deltaDebt -
            (totalDebtBaseInEth - deltaDebt);

        require(deltaDebt < totalCollateralBaseInEth, "Invalid DeltaDebt Calculated");

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

    /**
     * @dev Retrieves the current collateral and debt positions of the contract.
     *
     * This internal function provides a view into the current collateral and debt positions of the contract
     * by querying the Aave V3 protocol. It calculates the positions in ETH based on the current ETH/USD exchange rate.
     *
     * @return totalCollateralInEth The total collateral position in ETH.
     * @return totalDebtInEth The total debt position in ETH.
     */
    function _getPosition(
        uint priceMaxAge
    ) internal view returns (uint256 totalCollateralInEth, uint256 totalDebtInEth) {
        totalCollateralInEth = 0;
        totalDebtInEth = 0;

        DataTypes.ReserveData memory wethReserve = (aaveV3().getReserveData(wETHA()));
        DataTypes.ReserveData memory colleteralReserve = (aaveV3().getReserveData(ierc20A()));

        uint256 wethBalance = IERC20(wethReserve.variableDebtTokenAddress).balanceOf(address(this));
        uint256 collateralBalance = IERC20(colleteralReserve.aTokenAddress).balanceOf(
            address(this)
        );

        if (collateralBalance != 0) {
            IOracle.Price memory ethPrice = _ethUSDOracle.getLatestPrice();
            IOracle.Price memory collateralPrice = _collateralOracle.getLatestPrice();
            require(
                priceMaxAge == 0 ||
                    (priceMaxAge > 0 && (ethPrice.lastUpdate >= (block.timestamp - priceMaxAge))) ||
                    (priceMaxAge > 0 &&
                        (collateralPrice.lastUpdate >= (block.timestamp - priceMaxAge))),
                "Oracle Price is outdated"
            );
            totalCollateralInEth = (collateralBalance * collateralPrice.price) / ethPrice.price;
        }
        if (wethBalance != 0) {
            totalDebtInEth = wethBalance;
        }
    }

    /**
     * @dev Initiates the undeployment process by adjusting the contract's position and performing a flash loan.
     *
     * This private function calculates the necessary adjustments to the contract's position to accommodate the requested
     * undeployment amount. It then uses a flash loan to perform the required operations, including paying off debt and
     * withdrawing ETH. The resulting undeployed amount is updated, and the contract's deployed amount is adjusted accordingly.
     *
     * @param amount The amount of ETH to undeploy.
     * @param receiver The address to receive the undeployed ETH.
     * @return undeployedAmount The actual undeployed amount of ETH.
     *
     * Requirements:
     * - The contract must have a collateral margin greater than the debt to initiate undeployment.
     */
    function _undeploy(
        uint256 amount,
        address payable receiver
    ) private returns (uint256 undeployedAmount) {
        (uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) = _getPosition(0);
        // When the position is in liquidation state revert the transaction
        require(totalCollateralBaseInEth > totalDebtBaseInEth, "No Collateral margin to scale");
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
        require(wETH().approve(flashLenderA(), deltaDebtInETH + fee));
        require(
            flashLender().flashLoan(
                IERC3156FlashBorrowerUpgradeable(this),
                wETHA(),
                deltaDebtInETH,
                abi.encode(deltaCollateralInETH, receiver, FlashLoanAction.PAY_DEBT_WITHDRAW)
            ),
            "Failed to run Flash Loan"
        );
        // Update the amount of ETH deployed on the contract
        undeployedAmount = _pendingAmount;
        if (undeployedAmount > _deployedAmount) {
            _deployedAmount = 0;
        } else {
            _deployedAmount = _deployedAmount - undeployedAmount;
        }
        emit StrategyAmountUpdate(_deployedAmount);
        // Pending amount is not cleared to save gas
        //_pendingAmount = 0;
    }

    /**
     * @dev Internal function to convert the specified amount from WETH to the underlying collateral.
     *
     * This function is virtual and intended to be overridden in derived contracts for customized implementation.
     *
     * @param amount The amount to convert from WETH.
     * @return uint256 The converted amount in the underlying collateral.
     */
    function _convertFromWETH(uint256 amount) internal virtual returns (uint256);

    /**
     * @dev Internal function to convert the specified amount to WETH from the underlying collateral.
     *
     * This function is virtual and intended to be overridden in derived contracts for customized implementation.
     *
     * @param amount The amount to convert to WETH.
     * @return uint256 The converted amount in WETH.
     */
    function _convertToWETH(uint256 amount) internal virtual returns (uint256);

    /**
     * @dev Internal function to convert the specified amount in the underlying collateral to WETH.
     *
     * This function calculates the equivalent amount in WETH based on the latest price from the collateral oracle.
     *
     * @param amountIn The amount in the underlying collateral.
     * @return amountOut The equivalent amount in WETH.
     */
    function _toWETH(uint256 amountIn) internal view returns (uint256 amountOut) {
        amountOut =
            (amountIn * _collateralOracle.getLatestPrice().price) /
            _ethUSDOracle.getLatestPrice().price;
    }

    /**
     * @dev Internal function to convert the specified amount in WETH to the underlying collateral.
     *
     * This function calculates the equivalent amount in the underlying collateral based on the latest price from the collateral oracle.
     *
     * @param amountIn The amount in WETH.
     * @return amountOut The equivalent amount in the underlying collateral.
     */
    function _fromWETH(uint256 amountIn) internal view returns (uint256 amountOut) {
        amountOut =
            (amountIn * _ethUSDOracle.getLatestPrice().price) /
            _collateralOracle.getLatestPrice().price;
    }
}
