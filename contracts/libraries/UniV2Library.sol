// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IUniswapV2Router02 } from "../interfaces/uniswap/v2/IUniswapV2Router02.sol";
import { ISwapHandler } from "../interfaces/core/ISwapHandler.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title UniV2Library
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @dev Library for handling Uniswap V2 swaps
 */
library UniV2Library {
  using SafeERC20 for IERC20;
  error InvalidInputToken();
  error InvalidOutputToken();
  error SwapFailed();
  error FailedToApproveAllowance();

  /**
   * @notice Swaps tokens using Uniswap V2
   * @param router The Uniswap V2 Router address
   * @param params The swap parameters
   * @return amountIn The actual input amount
   * @return amountOut The actual output amount
   */
  function swapUniV2(
    IUniswapV2Router02 router,
    ISwapHandler.SwapParams memory params
  ) internal returns (uint256 amountIn, uint256 amountOut) {
    // Check if the input token address is valid
    if (params.underlyingIn == address(0)) revert InvalidInputToken();
    // Check if the output token address is valid
    if (params.underlyingOut == address(0)) revert InvalidOutputToken();

    // Create an array to hold the path for the Uniswap V2 swap
    address[] memory path = new address[](2);
    path[0] = params.underlyingIn; // Set the first element of the path to the input token
    path[1] = params.underlyingOut; // Set the second element of the path to the output token

    // Handle the case for Exact Input swaps
    if (params.mode == ISwapHandler.SwapType.EXACT_INPUT) {
      // Allow the Uniswap router to spend the specified amount of the input token
      if (!IERC20(params.underlyingIn).approve(address(router), params.amountIn))
        revert FailedToApproveAllowance();

      // Determine the minimum amount of output tokens to receive
      uint256 amountOutMin = 0;
      if (params.amountOut > 0) {
        amountOutMin = params.amountOut; // Use the specified minimum amount if provided
      } else {
        // Calculate the expected output amount based on the input amount
        uint256[] memory amountsOut = router.getAmountsOut(params.amountIn, path);
        amountOutMin = amountsOut[amountsOut.length - 1]; // Get the last amount in the array as the minimum output
      }

      // Execute the swap on Uniswap V2
      amountIn = params.amountIn; // Set the amountIn to the input amount
      uint256[] memory amounts = router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        path,
        address(this), // Send the output tokens to this contract
        block.timestamp // Set the deadline for the swap to the current block timestamp
      );
      amountOut = amounts[amounts.length - 1]; // Get the actual output amount from the swap

      // Handle the case for Exact Output swaps
    } else if (params.mode == ISwapHandler.SwapType.EXACT_OUTPUT) {
      amountOut = params.amountOut; // Set the expected output amount
      uint256 amountInMax = 0; // Initialize the maximum input amount

      // If no input amount is specified, calculate the required input amount for the desired output
      if (params.amountIn == 0) {
        uint256[] memory amountsIn = router.getAmountsIn(amountOut, path);
        amountInMax = amountsIn[0]; // Get the required input amount from the calculation
      } else {
        amountInMax = params.amountIn; // Use the specified maximum input amount
      }

      // Allow the Uniswap router to spend the maximum input amount
      if (!IERC20(params.underlyingIn).approve(address(router), amountInMax))
        revert FailedToApproveAllowance();

      // Execute the swap on Uniswap V2 for exact output
      uint256[] memory amounts = router.swapTokensForExactTokens(
        amountOut,
        amountInMax,
        path,
        address(this), // Send the output tokens to this contract
        block.timestamp // Set the deadline for the swap to the current block timestamp
      );
      amountIn = amounts[0]; // Get the actual input amount used in the swap
    }

    // If the output amount is zero, the swap has failed
    if (amountOut == 0) {
      revert SwapFailed(); // Revert the transaction with a failure error
    }
  }
}
