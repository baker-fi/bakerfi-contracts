// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IV3SwapRouter } from "../interfaces/uniswap/v3/IV3SwapRouter.sol";
import { ISwapHandler } from "../interfaces/core/ISwapHandler.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title UniV3Library
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @dev Library for handling Uniswap V3 swaps
 */
library UniV3Library {
  using SafeERC20 for IERC20;

  error InvalidInputToken();
  error InvalidOutputToken();
  error InvalidFeeTier();
  error SwapFailed();

  /**
   * @notice Swaps tokens using Uniswap V3
   * @param router The Uniswap V3 Router address
   * @param params The swap parameters
   * @return amountIn The actual input amount
   * @return amountOut The actual output amount
   */
  function swapUniV3(
    IV3SwapRouter router,
    ISwapHandler.SwapParams memory params
  ) internal returns (uint256 amountIn, uint256 amountOut) {
    // Validate input token address
    if (params.underlyingIn == address(0)) revert InvalidInputToken();
    // Validate output token address
    if (params.underlyingOut == address(0)) revert InvalidOutputToken();
    // Validate fee tier
    uint24 fee = abi.decode(params.payload, (uint24));
    if (fee == 0) revert InvalidFeeTier();

    // Handle Exact Input swaps
    if (params.mode == ISwapHandler.SwapType.EXACT_INPUT) {
      amountIn = params.amountIn; // Set the input amount
      // Execute the swap using the Uniswap V3 router
      amountOut = router.exactInputSingle(
        IV3SwapRouter.ExactInputSingleParams({
          tokenIn: params.underlyingIn,
          tokenOut: params.underlyingOut,
          amountIn: amountIn,
          amountOutMinimum: params.amountOut,
          fee: fee,
          recipient: address(this),
          sqrtPriceLimitX96: 0
        })
      );
      // Check if the swap was successful
      if (amountOut == 0) {
        revert SwapFailed(); // Revert if the output amount is zero
      }

      // Handle Exact Output swaps
    } else if (params.mode == ISwapHandler.SwapType.EXACT_OUTPUT) {
      amountOut = params.amountOut; // Set the expected output amount
      // Execute the swap using the Uniswap V3 router
      amountIn = router.exactOutputSingle(
        IV3SwapRouter.ExactOutputSingleParams({
          tokenIn: params.underlyingIn,
          tokenOut: params.underlyingOut,
          fee: fee,
          recipient: address(this),
          amountOut: amountOut,
          amountInMaximum: params.amountIn,
          sqrtPriceLimitX96: 0
        })
      );
    }
  }
}
