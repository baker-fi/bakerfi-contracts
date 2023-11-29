// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry, UNISWAP_ROUTER_CONTRACT} from "../ServiceRegistry.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import {IV3SwapRouter} from "../../interfaces/uniswap/v3/ISwapRouter.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseSwapper is ISwapHandler, Initializable {
    
    using SafeERC20 for IERC20;
    
    event Swap(address indexed assetIn, address assetOut,  uint256 assetInAmount, uint256 assetOutAmount);
    error SwapFailed();
    
    IV3SwapRouter private _uniRouter;

    function _initUseSwapper(ServiceRegistry registry) internal onlyInitializing {
        _uniRouter = IV3SwapRouter(registry.getServiceFromHash(UNISWAP_ROUTER_CONTRACT));
        require(address(_uniRouter) != address(0), "Invalid Uniswap Router");   
    }


     function uniRouter() public view returns (IV3SwapRouter) {
        return _uniRouter;
    }

    function uniRouterA() public view returns (address) {
        return address(_uniRouter);
    }

    function _swap(ISwapHandler.SwapParams memory params) internal override returns (uint256 amountOut) {
        require(params.underlyingIn != address(0), "Invalid Input Asset");
        require(params.underlyingOut != address(0), "Invalid Input Asset");
        uint24 fee = params.feeTier;
        require(fee > 0, "Invalid Fee Tier to Swap");

        // Exact Input
        if (params.mode == ISwapHandler.SwapType.EXACT_INPUT) {
            amountOut = _uniRouter.exactInputSingle(
                IV3SwapRouter.ExactInputSingleParams({
                    tokenIn: params.underlyingIn,
                    tokenOut: params.underlyingOut,
                    amountIn: params.amountIn,
                    amountOutMinimum: 0,
                    fee: fee,
                    recipient: address(this),
                    sqrtPriceLimitX96: 0
                })
            );
            if (amountOut == 0) {
                revert SwapFailed();
            }
            emit Swap( params.underlyingIn, params.underlyingOut,   params.amountIn, amountOut);        
            // Exact Output
        } else if (params.mode == ISwapHandler.SwapType.EXACT_OUTPUT) {
            uint256 amountIn = _uniRouter.exactOutputSingle(
                IV3SwapRouter.ExactOutputSingleParams({
                    tokenIn: params.underlyingIn,
                    tokenOut: params.underlyingOut,
                    fee: fee,
                    recipient: address(this),
                    amountOut: params.amountOut,
                    amountInMaximum: params.amountIn,
                    sqrtPriceLimitX96: 0
                })
            );
            if (amountIn < params.amountIn) {
                IERC20(params.underlyingIn).safeTransfer(address(this), params.amountIn - amountIn);
            }
            emit Swap( params.underlyingIn, params.underlyingOut, amountIn, params.amountOut);
            amountOut = params.amountOut;
        }    
    }
}
