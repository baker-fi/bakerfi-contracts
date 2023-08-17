// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {WETH_CONTRACT, PERCENTAGE_PRECISION, WSTETH_ETH_ORACLE, AAVE_V3, FLASH_LENDER, SWAP_HANDLER, ST_ETH_CONTRACT, WST_ETH_CONTRACT} from "./Constants.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {IWETH} from "../interfaces/tokens/IWETH.sol";
import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IPoolV3} from "../interfaces/aave/v3/IPoolV3.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import "../interfaces/aave/v3/DataTypes.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";
import {Leverage} from "../libraries/Leverage.sol";
import { 
    UseWETH, 
    UseStETH, 
    UseFlashLender, 
    UseWstETH, 
    UseAAVEv3, 
    UseServiceRegistry, 
    UseOracle, 
    UseSwapper
} from "./Hooks.sol";

contract AAVEv3Strategy is
    IStrategy,
    IERC3156FlashBorrower,
    UseServiceRegistry,
    UseWETH,
    UseStETH,
    UseWstETH,
    UseAAVEv3,
    UseOracle,
    UseSwapper,
    UseFlashLender
{
    event StrategyProfit(uint256 amount);
    event StrategyLoss(uint256 amount);

    uint256 private LOAN_TO_VALUE = 80000;

    struct FlashLoanData {
        uint256 originalAmount;
        address receiver;
    }

    bytes32 constant SUCCESS_MESSAGE = keccak256("ERC3156FlashBorrower.onFlashLoan");

    using SafeERC20 for IERC20;
    using Leverage for uint256;
    using SafeMath for uint256;

    uint256 internal _pendingAmount = 0;
    uint256 internal _deployedAmount = 0;

    constructor(
        ServiceRegistry registry
    )
        UseServiceRegistry(registry)
        UseWETH(registry)
        UseStETH(registry)
        UseWstETH(registry)
        UseAAVEv3(registry)
        UseOracle(WSTETH_ETH_ORACLE, registry)
        UseSwapper(registry)
        UseFlashLender(registry)
    {}

    receive() external payable {}

    function getPosition()
        external
        view
        returns (uint256 totalCollateralInEth, uint256 totalDebtInEth)
    {
        return _getPosition();
    }

    function _getPosition()
        internal
        view
        returns (uint256 totalCollateralInEth, uint256 totalDebtInEth)
    {
        (uint256 totalCollateralBase, uint256 totalDebtBase, , , , ) = aaveV3().getUserAccountData(
            address(this)
        );
        totalCollateralInEth = totalCollateralBase;
        totalDebtInEth = totalDebtBase;
    }

    function totalAssets() public view returns (uint256 totalOwnedAssets) {
        (uint256 totalCollateralInEth, uint256 totalDebtInEth) = _getPosition();
        totalOwnedAssets = totalCollateralInEth - totalDebtInEth;
    }

    function deploy() external payable returns (uint256 deployedAmount) {
        require(msg.value != 0, "No Zero deposit Allower");
        // 1. Wrap Ethereum
        wETH().deposit{value: msg.value}();

        // 2. Initiate a Flash Loan
        uint256 leverage = Leverage.calculateLeverageRatio(msg.value, LOAN_TO_VALUE, 10);
        uint256 loanAmount = leverage - msg.value;
        uint256 fee = flashLender().flashFee(wETHA(), loanAmount);
        uint256 allowance = wETH().allowance(address(this), flashLenderA());
        wETH().approve(flashLenderA(), loanAmount + fee + allowance);
        require(
            flashLender().flashLoan(
                IERC3156FlashBorrower(this),
                wETHA(),
                loanAmount,
                abi.encode(msg.value, msg.sender)
            ),
            "Failed to run Flash Loan"
        );
        deployedAmount = _pendingAmount;
        _pendingAmount = 0;
    }

    function _converWETHinWSTETH(uint256 amount) internal returns ( uint256 wstETHAmount) {
        // 1. Swap WETH -> stETH
        uint256 stEThAmount = _swaptoken(wETHA(), stETHA(), amount);
        // 2. Wrap stETH -> wstETH
        wstETHAmount = _wrapStETH(stEThAmount);
    }

    function _converWETHinWSTETH_2(uint256 amount) internal returns ( uint256 wstETHAmount) {
        // 1. Unwrap ETH to this account
        wETH().withdraw(amount);
        uint256 wStEthBalanceBefore = wstETH().balanceOf(address(this));
        // 2. Stake and Wrap using the receive function
        (bool sent, ) = payable(wstETHA()).call{value: amount}("");
        require(sent, "Failed to send Ether");
        uint256 wStEthBalanceAfter = wstETH().balanceOf(address(this));
        // 2. Wrap stETH -> wstETH
        wstETHAmount =  wStEthBalanceAfter.sub(wStEthBalanceBefore);
    }

    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes memory callData
    ) external returns (bytes32) {
        require(initiator == address(this), "FlashBorrower: Untrusted loan initiator");
        require(token == wETHA(), "Invalid Flash Loan Asset");
        require(stETHA() != address(0), "Invalid Output");

        FlashLoanData memory data = abi.decode(callData, (FlashLoanData));
        uint256 wstETHAmount = _converWETHinWSTETH(data.originalAmount + amount);
        // 3. Deposit wstETH and Borrow ETH
        supplyAndBorrow(wstETHA(), wstETHAmount, wETHA(), amount + fee);

        uint256 collateralInETH = convertWstInETH(wstETHAmount);
        _pendingAmount = collateralInETH - amount + fee;
        return SUCCESS_MESSAGE;
    }

    function convertWstInETH(uint256 amountIn) public view returns (uint256 amountOut) {
        amountOut = (amountIn * oracle().getLatestPrice()) / (oracle().getPrecision());
    }

    function convertETHInWSt(uint256 amountIn) public view returns (uint256 amountOut) {
        amountOut = (amountIn * oracle().getPrecision()) / oracle().getLatestPrice();
    }

    function _wrapStETH(uint256 toWrap) private returns (uint256 amountOut) {
        stETH().safeApprove(wstETHA(), toWrap);
        amountOut = IWStETH(wstETHA()).wrap(toWrap);
    }

    function supplyAndBorrow(
        address assetIn,
        uint256 amountIn,
        address assetOut,
        uint256 borrowOut
    ) private {
        IERC20(assetIn).approve(aaveV3A(), amountIn);
        aaveV3().supply(assetIn, amountIn, address(this), 0);
        aaveV3().borrow(assetOut, borrowOut, 2, 0, address(this));
    }

    function _swaptoken(
        address assetIn,
        address assetOut,
        uint256 amountIn
    ) private returns (uint256 amountOut) {
        IERC20(assetIn).approve(swapperA(), amountIn);
        ISwapHandler.SwapParams memory params = ISwapHandler.SwapParams(
            assetIn,
            assetOut,
            0,
            amountIn,
            0,
            bytes("")
        );
        amountOut = swapper().executeSwap(params);
    }

    function undeploy(
        uint256 amount,
        address payable receiver
    ) external returns (uint256 undeployedAmount) {
        uint256 percentageToBurn = (amount).mul(PERCENTAGE_PRECISION).div(totalAssets());
        uint256 deltaAssetInWSETH = _payDebtAndWithdraw(percentageToBurn);
        // 3. Unwrap wstETH -> stETH
        uint256 stETHAmount = _unwrapWstETH(deltaAssetInWSETH);
        // 4. Swap stETH -> weth
        uint256 wETHAmount = _swaptoken(stETHA(), wETHA(), stETHAmount);
        // 5. Unwrap wETH
        _unwrapWETH(wETHAmount);
        // 6. Withdraw ETh to User Wallet
        (bool success, ) = payable(receiver).call{value: wETHAmount}("");
        require(success, "Failed to Send ETH Back");
        undeployedAmount = wETHAmount;
    }

    function _unwrapWETH(uint256 wETHAmount) internal {
        IERC20(wETHA()).safeApprove(wETHA(), wETHAmount);
        wETH().withdraw(wETHAmount);
    }

    function _unwrapWstETH(uint256 deltaAssetInWSETH) internal returns (uint256 stETHAmount) {
        IERC20(wstETHA()).safeApprove(wstETHA(), deltaAssetInWSETH);
        stETHAmount = wstETH().unwrap(deltaAssetInWSETH);
    }

    function _payDebtAndWithdraw(
        uint256 percentageToBurn
    ) internal returns (uint256 deltaAssetInWSETH) {
        (uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) = _getPosition();

        // 1. Pay Debt
        uint256 deltaDebt = (totalDebtBaseInEth).mul(percentageToBurn).div(PERCENTAGE_PRECISION);
        uint256 wstETHPaidInDebt = convertETHInWSt(deltaDebt);
        DataTypes.ReserveData memory reserve = aaveV3().getReserveData(wETHA());

        IERC20(reserve.aTokenAddress).safeApprove(aaveV3A(), wstETHPaidInDebt);
        aaveV3().repayWithATokens(wstETHA(), wstETHPaidInDebt, 2);
        // 2. Withdraw from AAVE Pool
        uint256 deltaCollateral = (totalCollateralBaseInEth).mul(percentageToBurn).div(
            PERCENTAGE_PRECISION
        );
        deltaAssetInWSETH = convertETHInWSt(deltaCollateral) - wstETHPaidInDebt;
        aaveV3().withdraw(wstETHA(), deltaAssetInWSETH, address(this));
    }

    function harvest() external override returns(int256 balanceChange){
        (uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) = _getPosition();
        balanceChange = int256(
            int256(totalCollateralBaseInEth) - 
            int256(totalDebtBaseInEth) - 
            int256(_deployedAmount));
        if (balanceChange == 0 ) {
            return 0;
        }
        
        if (balanceChange > 0 ) {
             _deployedAmount.add(uint256(balanceChange));
            emit StrategyLoss(uint256(balanceChange));
        } else if ( balanceChange < 0 ) {
            _deployedAmount.sub(uint256(-balanceChange));
            emit StrategyProfit(uint256(-balanceChange));
        }        
    }
}
