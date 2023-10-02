// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import {UseServiceRegistry} from "../Hooks.sol";
import {IV3SwapRouter} from "../../interfaces/uniswap/v3/ISwapRouter.sol";
import {UNISWAP_ROUTER} from "../Constants.sol";

contract UniV3Swapper is Ownable, ISwapHandler, UseServiceRegistry {
    
    error SwapFailed();
    using SafeERC20 for IERC20;

    IV3SwapRouter private _uniRouter;
    
    event Swap(address indexed assetIn, address assetOut,  uint256 assetInAmount, uint256 assetOutAmount);

    mapping(bytes32 => uint24) private _feeTiers;

    constructor(
        ServiceRegistry registry,
        address owner
    ) Ownable() ISwapHandler() UseServiceRegistry(registry) {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
        _uniRouter = IV3SwapRouter(registerSvc().getServiceFromHash(UNISWAP_ROUTER));
        require(address(_uniRouter) != address(0), "Invalid Uniswap Router");    
    }

    function getFeeTier(address fromToken, address toToken) public view returns (uint24) {
        return _feeTiers[keccak256(abi.encodePacked(fromToken, toToken))];
    }

    function addFeeTier(address fromToken, address toToken, uint24 fee) external onlyOwner {
        _feeTiers[keccak256(abi.encodePacked(fromToken, toToken))] = fee;
        _feeTiers[keccak256(abi.encodePacked(toToken, fromToken))] = fee;
    }

    function removeFeeTier(address fromToken, address toToken) external onlyOwner {
        require(_feeTiers[keccak256(abi.encodePacked(fromToken, toToken))] > 0, "Tier not found");
        require(_feeTiers[keccak256(abi.encodePacked(toToken, fromToken))] > 0, "Tier not found");
        _feeTiers[keccak256(abi.encodePacked(fromToken, toToken))] = 0;
        _feeTiers[keccak256(abi.encodePacked(toToken, fromToken))] = 0;
    }

    function executeSwap(SwapParams calldata params) external override returns (uint256 amountOut) {
        require(params.underlyingIn != address(0), "Invalid Input Asset");
        require(params.underlyingOut != address(0), "Invalid Input Asset");
        uint24 fee = getFeeTier(params.underlyingIn, params.underlyingOut);
        require(fee > 0, "Invalid Fee Tier to Swap");
  

        // Exact Input
        if (params.mode == 0) {
              // Transfer the specified amount of asset to this contract.
            IERC20(params.underlyingIn).safeTransferFrom(
                msg.sender,
                address(this),
                params.amountIn
            );
            // Approve the router to spend DAI.
            IERC20(params.underlyingIn).safeApprove(address(_uniRouter), params.amountIn);
            amountOut = _uniRouter.exactInputSingle(
                IV3SwapRouter.ExactInputSingleParams({
                    tokenIn: params.underlyingIn,
                    tokenOut: params.underlyingOut,
                    amountIn: params.amountIn,
                    amountOutMinimum: 0,
                    fee: fee,
                    recipient: msg.sender,
                   // deadline: block.timestamp,
                    sqrtPriceLimitX96: 0
                })
            );
            if (amountOut == 0) {
                revert SwapFailed();
            }

            emit Swap( params.underlyingIn, params.underlyingOut,   params.amountIn, amountOut);

            // Exact Output
        } else if (params.mode == 1) {
            IERC20(params.underlyingIn).safeTransferFrom(
                msg.sender,
                address(this),
                params.amountIn
            );
            IERC20(params.underlyingIn).safeApprove(address(_uniRouter), params.amountIn);
            // Executes the swap returning the amountIn needed to spend to receive the desired amountOut.
            uint256 amountIn = _uniRouter.exactOutputSingle(
                IV3SwapRouter.ExactOutputSingleParams({
                    tokenIn: params.underlyingIn,
                    tokenOut: params.underlyingOut,
                    fee: fee,
                    recipient: msg.sender,
                    amountOut: params.amountOut,
                    amountInMaximum: params.amountIn,
                    sqrtPriceLimitX96: 0
                })
            );
            if (amountIn < params.amountIn) {
                IERC20(params.underlyingIn).safeApprove(address(_uniRouter), 0);
                IERC20(params.underlyingIn).safeTransfer(msg.sender, params.amountIn - amountIn);
            }
            emit Swap( params.underlyingIn, params.underlyingOut, amountIn, params.amountOut);
            amountOut = params.amountOut;
        }
    }
}
