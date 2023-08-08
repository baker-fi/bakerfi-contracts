// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SwapHandlerMock is ISwapHandler {
    
    IERC20 _asset0;
    IERC20 _asset1;

    uint256 RATIO_PRECISION  = 10000;
    uint256 RATIO = 10000;

    using SafeERC20 for IERC20;

    constructor( 
        IERC20 asset0,
        IERC20 asset1
        ) {
        _asset0 = asset0;
        _asset1 = asset1;        
    }

    function executeSwap(
        SwapParams calldata params
    ) external override returns (uint256 amountOut) {

        require(params.underlyingIn == address(_asset0) || params.underlyingIn ==  address(_asset1), "Invalid Input Token" );
        require(params.underlyingOut ==  address(_asset0) || params.underlyingOut ==  address(_asset1),  "Invalid Output Token" );  
        require(address(params.underlyingOut) != address(params.underlyingIn), "Invalid Swapped Token");       

        if (params.mode == 0) {
            IERC20(params.underlyingIn).safeTransferFrom(msg.sender, address(this), params.amountIn);
            amountOut = params.amountIn * RATIO_PRECISION / RATIO;
            require(IERC20(params.underlyingOut).balanceOf(address(this))>= amountOut);
            IERC20(params.underlyingOut).safeTransfer(msg.sender, amountOut);
        } else {
            require(IERC20(params.underlyingOut).balanceOf(address(this))>= params.amountOut);
            uint256 amountIn = params.amountOut / (RATIO_PRECISION / RATIO);
            IERC20(params.underlyingIn).safeTransferFrom(msg.sender, address(this), amountIn);           
            IERC20(params.underlyingOut).safeTransfer(msg.sender, params.amountOut);
        }
    }
    
}