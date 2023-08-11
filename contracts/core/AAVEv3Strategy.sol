// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import "hardhat/console.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {
    WETH_CONTRACT, 
    WSTETH_ETH_ORACLE, 
    AAVE_V3, 
    FLASH_LENDER, 
    SWAP_HANDLER, 
    ST_ETH_CONTRACT, 
    WST_ETH_CONTRACT
} from "./Constants.sol";
import {Rebase, RebaseLibrary} from "../libraries/BoringRebase.sol";
import {IWETH} from "../interfaces/tokens/IWETH.sol";
import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IPoolV3} from "../interfaces/aave/v3/IPoolV3.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import "../interfaces/aave/v3/DataTypes.sol";
import {IStrategy} from "../interfaces/core/IStrategy.sol";
import {Leverage} from "../libraries/Leverage.sol";

contract AAVEv3Strategy is IStrategy, IERC3156FlashBorrower {
    uint256 private LOAN_TO_VALUE = 80000;

    struct FlashLoanData {
        uint256 originalAmount;
        address receiver;
    }

    uint256 public constant PERCENTAGE_PRECISION = 1e9;
    bytes32 constant SUCCESS_MESSAGE = keccak256("ERC3156FlashBorrower.onFlashLoan");

    using SafeERC20 for IERC20;
    using Leverage for uint256;
    using SafeMath for uint256;

    ServiceRegistry public immutable _registry;
    uint256 internal _pendingAmount = 0;

    constructor(ServiceRegistry registry) {
        _registry = registry;
    }

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
        IPoolV3 aavePool = IPoolV3(_registry.getServiceFromHash(AAVE_V3));
        (
            uint256 totalCollateralBase,
            uint256 totalDebtBase,,,,           
        ) = aavePool.getUserAccountData(address(this));
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
        IWETH weth = IWETH(_registry.getServiceFromHash(WETH_CONTRACT));
        weth.deposit{value: msg.value}();

        // 2. Initiate a Flash Loan
        IERC3156FlashLender flashLender = IERC3156FlashLender(
            _registry.getServiceFromHash(FLASH_LENDER)
        );
        uint256 leverage = Leverage.calculateLeverageRatio(msg.value, LOAN_TO_VALUE, 10);
        uint256 loanAmount = leverage - msg.value;
        uint256 fee = flashLender.flashFee(address(weth), loanAmount);
        uint256 allowance = weth.allowance(address(this), address(flashLender));
        weth.approve(address(flashLender), loanAmount + fee + allowance);
        require(
            flashLender.flashLoan(
                IERC3156FlashBorrower(this),
                address(weth),
                loanAmount,
                abi.encode(msg.value, msg.sender)
            ),
            "Failed to run Flash Loan"
        );
        deployedAmount = _pendingAmount;
        _pendingAmount = 0;
    }

    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes memory callData
    ) external returns (bytes32) {
        require(initiator == address(this), "FlashBorrower: Untrusted loan initiator");
        address weth = _registry.getServiceFromHash(WETH_CONTRACT);
        address wstETH = _registry.getServiceFromHash(WST_ETH_CONTRACT);
        address stETH = _registry.getServiceFromHash(ST_ETH_CONTRACT);

        require(token == weth, "Invalid INput");
        require(stETH != address(0), "Invalid Output");

        FlashLoanData memory data = abi.decode(callData, (FlashLoanData));
        // 1. Swap WETH -> stETH
        uint256 stEThAmount = _swaptoken(weth, stETH, data.originalAmount + amount);
        // 2. Wrap stETH -> wstETH
        uint256 wstETHAmount = wrapStETH(stETH, wstETH, stEThAmount);
        // 3. Deposit wstETH and Borrow ETH
        supplyAndBorrow(address(wstETH), wstETHAmount, weth, amount + fee);

        uint256 collateralInETH = convertWstInETH(wstETHAmount);
        _pendingAmount = collateralInETH - amount + fee;
        return SUCCESS_MESSAGE;
    }

    function convertWstInETH(uint256 amountIn) public view returns (uint256 amountOut) {
        IOracle oracle = IOracle(_registry.getServiceFromHash(WSTETH_ETH_ORACLE));
        amountOut = (amountIn * oracle.getLatestPrice()) / (oracle.getPrecision());
    }

    function convertETHInWSt(uint256 amountIn) public view returns (uint256 amountOut) {
        IOracle oracle = IOracle(_registry.getServiceFromHash(WSTETH_ETH_ORACLE));
        amountOut = (amountIn * oracle.getPrecision()) / oracle.getLatestPrice();
    }

    function wrapStETH(
        address stETh,
        address wstETh,
        uint256 toWrap
    ) private returns (uint256 amountOut) {
        IERC20(stETh).safeApprove(wstETh, toWrap);
        amountOut = IWStETH(wstETh).wrap(toWrap);
    }

    function supplyAndBorrow(
        address assetIn,
        uint256 amountIn,
        address assetOut,
        uint256 borrowOut
    ) private {
        IPoolV3 aavePool = IPoolV3(_registry.getServiceFromHash(AAVE_V3));
        IERC20(assetIn).approve(address(aavePool), amountIn);
        aavePool.supply(assetIn, amountIn, address(this), 0);
        aavePool.borrow(assetOut, borrowOut, 2, 0, address(this));
    }

    function _swaptoken(
        address assetIn,
        address assetOut,
        uint256 amountIn
    ) private returns (uint256 amountOut) {
        ISwapHandler swapHandler = ISwapHandler(_registry.getServiceFromHash(SWAP_HANDLER));
        IERC20(assetIn).approve(address(swapHandler), amountIn);
        ISwapHandler.SwapParams memory params = ISwapHandler.SwapParams(
            assetIn,
            assetOut,
            0,
            amountIn,
            0,
            bytes("")
        );
        amountOut = swapHandler.executeSwap(params);
    }

    function undeploy(
        uint256 amount,
        address payable receiver
    ) external returns (uint256 undeployedAmount) {
        address wstETH = _registry.getServiceFromHash(WST_ETH_CONTRACT);
        address stETH = _registry.getServiceFromHash(ST_ETH_CONTRACT);
        address weth = _registry.getServiceFromHash(WETH_CONTRACT);
        IPoolV3 aavePool = IPoolV3(_registry.getServiceFromHash(AAVE_V3));
        // 0 UpdateCollateral
        uint256 percentageToBurn = (amount).mul(PERCENTAGE_PRECISION).div(totalAssets());      
        (uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) = _getPosition();
// 1. Pay Debt
        uint256 deltaDebt = (totalDebtBaseInEth).mul(percentageToBurn).div(PERCENTAGE_PRECISION);
        uint256 wstETHPaidInDebt = convertETHInWSt(deltaDebt);
        DataTypes.ReserveData memory reserve = aavePool.getReserveData(wstETH);
        IERC20(reserve.aTokenAddress).safeApprove(address(aavePool), wstETHPaidInDebt);
        aavePool.repayWithATokens(wstETH, wstETHPaidInDebt, 2);
        // 2. Withdraw from AAVE Pool
        uint256 deltaCollateral = (totalCollateralBaseInEth).mul(percentageToBurn).div(
            PERCENTAGE_PRECISION
        );
        uint256 deltaAssetInWSETH = convertETHInWSt(deltaCollateral)- wstETHPaidInDebt;
        aavePool.withdraw(wstETH, deltaAssetInWSETH, address(this));

        // 3. Unwrap wstETH -> stETH
        IERC20(wstETH).safeApprove(wstETH, deltaAssetInWSETH);
        uint256 stETHAmount = IWStETH(wstETH).unwrap(deltaAssetInWSETH);
        // 4. Swap stETH -> weth
        uint256 wETHAmount = _swaptoken(stETH, weth, stETHAmount);
        require(IERC20(weth).balanceOf(address(this)) >= wETHAmount, "No balance received");
        // 1. Pay Debt
        // 5. Unwrap wETH
        IERC20(weth).safeApprove(weth, wETHAmount);
        IWETH(weth).withdraw(wETHAmount);
        // 6. Withdraw ETh to User Wallet
        (bool success, ) = payable(receiver).call{value: wETHAmount}("");
        require(success, "Failed to Send ETH Back");
        undeployedAmount = wETHAmount;
    }

    function harvest() external override returns (uint256 amountAdded) {}

    function updatePositionInfo() external override {}
}
