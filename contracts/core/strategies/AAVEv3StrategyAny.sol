// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AAVEv3StrategyBase} from "./AAVEv3StrategyBase.sol";
import {CBETH_ERC20, CBETH_ETH_ORACLE} from "../Constants.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {UseWETH, ServiceRegistry, UseOracle, UseIERC20} from "../Hooks.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IWStETH} from "../../interfaces/lido/IWStETH.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title WST used 
 * @author 
 * @notice 
 */
contract AAVEv3StrategyAny is AAVEv3StrategyBase, UseOracle {
    
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    constructor(
        address owner,
        ServiceRegistry registry,
        bytes32 collateral, 
        bytes32 oracle
    )
        AAVEv3StrategyBase(owner, registry, collateral)
        UseOracle(oracle, registry)
    {
        
    }

    function _swapFromWETH(uint256 amount) internal virtual override returns (uint256) {
        // 1. Swap WETH -> cbETH  
        return _swaptoken(wETHA(), ierc20A(), amount);
    } 

    function _swapToWETH(uint256 amount) internal virtual override returns (uint256) {
        // 1.Swap cbETH -> WETH
        return _swaptoken(ierc20A(), wETHA(), amount);
    }

    function _toWETH(uint256 amountIn) internal virtual override returns (uint256 amountOut) {
        amountOut = amountIn.mul(oracle().getLatestPrice()).div(oracle().getPrecision());
    }

    function _fromWETH(uint256 amountIn) internal virtual override returns (uint256 amountOut) {
        amountOut = amountIn.mul(oracle().getPrecision()).div(oracle().getLatestPrice());
    }
}
