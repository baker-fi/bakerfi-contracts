// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IUniswapV2Router02 } from "../../interfaces/uniswap/v2/IUniswapV2Router02.sol";
import { ISwapHandler } from "../../interfaces/core/ISwapHandler.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
/**
 * @title UseUniV2Swapper
 *
 * @dev Abstract contract to integrate the use of Uniswap V2
 *      Provides functions to initialize, access and swap
 *      It allows any contract to swap an ERC-20 for another ERC-20 with a fixed
 *      input amount or a fixed output amount of tokens.
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 */
abstract contract UseUniV2Swapper is ISwapHandler {
  using SafeERC20 for IERC20;

  error InvalidV2RouterContract();
  error InvalidInputToken();
  error InvalidOutputToken();
  error SwapFailed();

  IUniswapV2Router02 private _v2UniRouter;

  /**
   * @dev Initialize the Uniswap V2 Swapper
   */
  function _initUseUniV2Swapper(IUniswapV2Router02 iV2UniRouter) internal {
    _v2UniRouter = iV2UniRouter;
    if (address(iV2UniRouter) == address(0)) revert InvalidV2RouterContract();
  }

  function v2UniRouter() internal view returns (IUniswapV2Router02) {
    return _v2UniRouter;
  }

  /**
   * @inheritdoc ISwapHandler
   */
  /**
   * @notice Executes a token swap on Uniswap V2 using the Uniswap V2 Router
   * @dev This function allows for two types of swaps:
   *      - Exact Input: The user specifies the amount of input tokens to swap, and the function calculates
   *        the minimum amount of output tokens to receive.
   *      - Exact Output: The user specifies the desired amount of output tokens, and the function calculates
   *        the maximum amount of input tokens that can be used for the swap.
   *
   * @param params A struct containing the parameters for the swap, including:
   *        - underlyingIn: The address of the token being sold.
   *        - underlyingOut: The address of the token being bought.
   *        - mode: The type of swap (0 for exact input, 1 for exact output).
   *        - amountIn: The amount of the input token to sell (exact value for exact input, maximum for exact output).
   *        - amountOut: The amount of the output token to buy (exact value for exact output, minimum for exact input).
   *
   * @return amountIn The actual amount of input tokens used in the swap.
   * @return amountOut The actual amount of output tokens received from the swap.
   *
   * @dev Reverts if:
   *      - The input or output token address is invalid.
   *      - The swap fails (i.e., the output amount is zero).
   */
  function swap(
    ISwapHandler.SwapParams memory params
  ) internal virtual override returns (uint256 amountIn, uint256 amountOut) {
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
      _allowRouterSpend(IERC20(params.underlyingIn), params.amountIn);

      // Determine the minimum amount of output tokens to receive
      uint256 amountOutMin = 0;
      if (params.amountOut > 0) {
        amountOutMin = params.amountOut; // Use the specified minimum amount if provided
      } else {
        // Calculate the expected output amount based on the input amount
        uint256[] memory amountsOut = _v2UniRouter.getAmountsOut(params.amountIn, path);
        amountOutMin = amountsOut[amountsOut.length - 1]; // Get the last amount in the array as the minimum output
      }

      // Execute the swap on Uniswap V2
      amountIn = params.amountIn; // Set the amountIn to the input amount
      uint256[] memory amounts = _v2UniRouter.swapExactTokensForTokens(
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
        uint256[] memory amountsIn = _v2UniRouter.getAmountsIn(amountOut, path);
        amountInMax = amountsIn[0]; // Get the required input amount from the calculation
      } else {
        amountInMax = params.amountIn; // Use the specified maximum input amount
      }

      // Allow the Uniswap router to spend the maximum input amount
      _allowRouterSpend(IERC20(params.underlyingIn), amountInMax);

      // Execute the swap on Uniswap V2 for exact output
      uint256[] memory amounts = _v2UniRouter.swapTokensForExactTokens(
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
  /**
   * @dev Allow the router to spend the input token
   */
  function _allowRouterSpend(IERC20 token, uint256 amount) internal {
    token.approve(address(_v2UniRouter), amount);
  }
}

/**
 * @dev Mock contract to test the UseUniV2Swapper
 */
contract UseUniV2SwapperMock is UseUniV2Swapper {
  /**
   * @dev Initialize the UseUniV2SwapperMock
   */
  constructor(IUniswapV2Router02 iV2UniRouter) {
    _initUseUniV2Swapper(iV2UniRouter);
  }

  /**
   * @notice Mock function to test the swap function
   */
  function test__swap(
    ISwapHandler.SwapParams memory params
  ) external returns (uint256 amountIn, uint256 amountOut) {
    return swap(params);
  }
}
