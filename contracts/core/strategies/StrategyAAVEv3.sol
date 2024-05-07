// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import {StrategyBase} from "./StrategyBase.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UseAAVEv3} from "../hooks/UseAAVEv3.sol";
import {DataTypes} from "../../interfaces/aave/v3/IPoolV3.sol";
import {IQuoterV2} from "../../interfaces/uniswap/v3/IQuoterV2.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
/**
 * @title  AAVE v3 Recursive Staking Strategy for anyETH/WETH
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev This strategy is used by the bakerfi vault to deploy ETH capital
 * on aave money market.
 *
 * The Collateral could be cbETH, wstETH, rETH against and the debt is always WETH
 *
 * The strategy inherits all the business logic from StrategyAAVEv3Base and could be deployed
 * on Optimism, Arbitrum , Base and Ethereum.
 */

contract StrategyAAVEv3 is Initializable, UseAAVEv3, StrategyBase {
    using SafeERC20 for IERC20;
    using AddressUpgradeable for address;
    using AddressUpgradeable for address payable;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // solhint-disable no-empty-blocks
    function initialize(
        address initialOwner,
        address initialGovernor,
        ServiceRegistry registry,
        bytes32 collateral,
        bytes32 oracle,
        uint24 swapFeeTier,
        uint8 eModeCategory
    ) public initializer {        
        _initializeStrategyBase(
            initialOwner,
            initialGovernor,
            registry,
            collateral,
            oracle,
            swapFeeTier
        );
        _initUseAAVEv3(registry, eModeCategory);
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
    ) internal virtual override {
        DataTypes.ReserveData memory reserve = aaveV3().getReserveData(ierc20A());
        uint256 balanceOf = IERC20Upgradeable(reserve.aTokenAddress).balanceOf(address(this));
        uint256 convertedAmount = _fromWETH(withdrawAmountInETh);
        uint256 withdrawAmount = balanceOf > convertedAmount ? convertedAmount : balanceOf;
        _repay(wETHA(), repayAmount);

        if (aaveV3().withdraw(ierc20A(), withdrawAmount, address(this)) != withdrawAmount) {
            revert InvalidWithdrawAmount();
        }
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


     function _supplyBorrow(uint256 amount, uint256 loanAmount, uint256 fee) internal virtual override{
        uint256 collateralIn = _convertFromWETH(amount + loanAmount);
        // Deposit on AAVE Collateral and Borrow ETH
        _supplyAndBorrow(ierc20A(), collateralIn, wETHA(), loanAmount + fee);
        uint256 collateralInETH = _toWETH(collateralIn);
        _pendingAmount = collateralInETH - loanAmount - fee;
        emit StrategyDeploy(msg.sender, _pendingAmount);
    }

     function _payDebt(uint256 debtAmount, uint256 fee) internal virtual override {
        _repay(wETHA(), debtAmount);
        // Get a Quote to know how much collateral i require to pay debt
        (uint256 amountIn, , , ) = uniQuoter().quoteExactOutputSingle(
            IQuoterV2.QuoteExactOutputSingleParams(ierc20A(), wETHA(), debtAmount + fee, 500, 0)
        );
        if (aaveV3().withdraw(ierc20A(), amountIn, address(this)) != amountIn)
            revert InvalidWithdrawAmount();

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
            if (!wETH().approve(aaveV3A(), wethLefts)) revert FailedToApproveAllowance();
            aaveV3().supply(wETHA(), wethLefts, address(this), 0);
        }
        emit StrategyUndeploy(msg.sender, debtAmount);
    }

    /**
     * Get the Current Position on AAVE v3 Money Market
     * @return collateralBalance 
     * @return debtBalance 
     */   
    function _getMMPosition() internal virtual override view returns ( uint256 collateralBalance, uint256 debtBalance ) {
        DataTypes.ReserveData memory wethReserve = (aaveV3().getReserveData(wETHA()));
        DataTypes.ReserveData memory colleteralReserve = (aaveV3().getReserveData(ierc20A()));

        debtBalance = IERC20(wethReserve.variableDebtTokenAddress).balanceOf(address(this));
        collateralBalance = IERC20(colleteralReserve.aTokenAddress).balanceOf(
            address(this)
        );
    }
}
