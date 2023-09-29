// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SwapHandlerMock is ISwapHandler {
    
    mapping(address => address) _pairs;
    uint256 RATIO_PRECISION  = 1e9;
    uint256 private _ratio = 1e9;

    using SafeERC20 for IERC20;

    constructor( 
        IERC20 asset0,
        IERC20 asset1
        ) {
        _pairs[address(asset0)]  = address(asset1);
    }

    function addPair(address token0, address token1) external {
        _pairs[token0] = token1;
    }

    function setRatio(uint256 ratio ) external {
        _ratio = ratio;
    }

    function executeSwap(
        SwapParams calldata params
    ) external override returns (uint256 amountOut) {

        require(
            _pairs[params.underlyingIn] == params.underlyingOut || 
            _pairs[params.underlyingOut] ==  params.underlyingIn, 
            "Invalid Pair" 
        );

        if (params.mode == 0) {
            IERC20(params.underlyingIn).safeTransferFrom(msg.sender, address(this), params.amountIn);        
            if ( params.underlyingOut == _pairs[params.underlyingIn]) {
                amountOut = params.amountIn * RATIO_PRECISION / _ratio;
            } else {
                amountOut = params.amountIn * _ratio / RATIO_PRECISION  ;
            }        
            require(IERC20(params.underlyingOut).balanceOf(address(this))>= amountOut);
            IERC20(params.underlyingOut).safeTransfer(msg.sender, amountOut);
        } else { 
            require(IERC20(params.underlyingIn).balanceOf(msg.sender)>= params.amountIn);
            require(IERC20(params.underlyingOut).balanceOf(address(this))>=  params.amountOut);       
            uint256 amountIn = params.amountOut / (RATIO_PRECISION / _ratio);
            IERC20(params.underlyingIn).safeTransferFrom(msg.sender, address(this), amountIn);           
            IERC20(params.underlyingOut).safeTransfer(msg.sender, params.amountOut);
        }
    }
    
}