// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AAVEv3Strategy} from "./AAVEv3Strategy.sol";
import {WST_ETH_CONTRACT, WSTETH_ETH_ORACLE} from "../Constants.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {UseWETH, UseStETH, UseWstETH, UseServiceRegistry, UseOracle, UseIERC20} from "../Hooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IWStETH} from "../../interfaces/lido/IWStETH.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title WST used 
 * @author 
 * @notice 
 */
contract AAVEv3StrategyWstETH is AAVEv3Strategy, UseWstETH, UseStETH, UseOracle {
    
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    constructor(
        address owner,
        ServiceRegistry registry
    )
        AAVEv3Strategy(owner, registry, WST_ETH_CONTRACT)
        UseWstETH(registry)
        UseStETH(registry)
        UseOracle(WSTETH_ETH_ORACLE, registry)
    {}

    function _swapFromWETH(uint256 amount) internal virtual override returns (uint256) {
        // 1. Swap WETH -> stETH
        uint256 stEThAmount = _swaptoken(wETHA(), stETHA(), amount);
        // 2. Wrap stETH -> wstETH
        return _wrapStETH(stEThAmount);
    }

     /*function _swapFromWETH(uint256 amount) internal returns ( uint256 wstETHAmount) {
        // 1. Unwrap ETH to this account
        wETH().withdraw(amount);
        uint256 wStEthBalanceBefore = wstETH().balanceOf(address(this));
        // 2. Stake and Wrap using the receive function
        (bool sent, ) = payable(wstETHA()).call{value: amount}("");
        require(sent, "Failed to send Ether");
        uint256 wStEthBalanceAfter = wstETH().balanceOf(address(this));
        // 2. Wrap stETH -> wstETH
        wstETHAmount =  wStEthBalanceAfter.sub(wStEthBalanceBefore);
    }*/

    function _swapToWETH(uint256 amount) internal virtual override returns (uint256) {
        // 1. Unwrap wstETH -> stETH
        uint256 stETHAmount = _unwrapWstETH(amount);
        // 2. Swap stETH -> weth
        return _swaptoken(stETHA(), wETHA(), stETHAmount);
    }

    function _unwrapWstETH(uint256 deltaAssetInWSETH) internal returns (uint256 stETHAmount) {
        IERC20(wstETHA()).safeApprove(wstETHA(), deltaAssetInWSETH);
        stETHAmount = wstETH().unwrap(deltaAssetInWSETH);
    }

    function _wrapStETH(uint256 toWrap) internal returns (uint256 amountOut) {
        stETH().safeApprove(wstETHA(), toWrap);
        amountOut = IWStETH(wstETHA()).wrap(toWrap);
    }

    function _toWETH(uint256 amountIn) internal virtual override returns (uint256 amountOut) {
        amountOut = amountIn.mul(oracle().getLatestPrice()).div(oracle().getPrecision());
    }

    function _fromWETH(uint256 amountIn) internal virtual override returns (uint256 amountOut) {
        amountOut = amountIn.mul(oracle().getPrecision()).div(oracle().getLatestPrice());
    }
}
