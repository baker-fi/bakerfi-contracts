// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AAVEv3StrategyBase} from "./AAVEv3StrategyBase.sol";
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
contract AAVEv3StrategyWstETH is AAVEv3StrategyBase, UseWstETH, UseStETH { 
    
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    constructor(
        address owner,
        ServiceRegistry registry
    )
        AAVEv3StrategyBase(owner, registry, WST_ETH_CONTRACT, WSTETH_ETH_ORACLE)
        UseWstETH(registry)
        UseStETH(registry)
    {}

    function _convertFromWETH(uint256 amount)  internal virtual override returns (uint256) {
        // 1. Unwrap ETH to this account
        wETH().withdraw(amount);
        uint256 wStEthBalanceBefore = wstETH().balanceOf(address(this));
        // 2. Stake and Wrap using the receive function
        (bool sent, ) = payable(wstETHA()).call{value: amount}("");
        require(sent, "Failed to send Ether");
        uint256 wStEthBalanceAfter = wstETH().balanceOf(address(this));
        // 3. Wrap stETH -> wstETH
        return wStEthBalanceAfter.sub(wStEthBalanceBefore);
    }

    function _convertToWETH(uint256 amount) internal virtual override returns (uint256) {
        // 1. Unwrap wstETH -> stETH
        uint256 stETHAmount = unwrapWstETH(amount);
        // 2. Swap stETH -> weth
        return swaptoken(stETHA(), wETHA(), stETHAmount);
    }
}

