// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISwapHandler } from "../../interfaces/core/ISwapHandler.sol";
import { IV3SwapRouter } from "../../interfaces/uniswap/v3/IV3SwapRouter.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title UseUniV3Swapper
 *
 * @dev Abstract contract to integrate the use of Uniswap V3
 *      Provides functions to initialize, access and swap
 *      It allows any contract to swap an ERC-20 for another ERC-20 with a fixed
 *      input amoun  or a fixed output amount of tokens.
 *
 *      During the contract initialization it sets the uniswap router address from the
 *      service registry
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 */
abstract contract UseUniV3Swapper is ISwapHandler {
  using SafeERC20 for IERC20;

  error InvalidUniRouterContract();
  error InvalidInputToken();
  error InvalidOutputToken();
  error InvalidFeeTier();
  error SwapFailed();

  IV3SwapRouter private _uniRouter;

  function _initUseUniV3Swapper(IV3SwapRouter luniRouter) internal {
    _uniRouter = luniRouter; //
    if (address(_uniRouter) == address(0)) revert InvalidUniRouterContract();
  }

  function uniRouter() public view returns (IV3SwapRouter) {
    return _uniRouter;
  }

  function uniRouterA() internal view returns (address) {
    return address(_uniRouter);
  }

  function _allowRouterSpend(IERC20 token, uint256 amount) internal {
    token.approve(address(_uniRouter), amount);
  }

  /**
   * @inheritdoc ISwapHandler
   * @notice Executes a token swap on Uniswap V3 using the specified parameters.
   * @dev This function supports two types of swaps:
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
   *        - feeTier: The fee tier for the swap.
   *
   * @return amountIn The actual amount of input tokens used in the swap.
   * @return amountOut The actual amount of output tokens received from the swap.
   *
   * @dev Reverts if:
   *      - The input or output token address is invalid.
   *      - The fee tier is invalid (zero).
   *      - The swap fails (i.e., the output amount is zero for exact input swaps).
   */
  function swap(
    ISwapHandler.SwapParams memory params
  ) internal virtual override returns (uint256 amountIn, uint256 amountOut) {
    // Validate input token address
    if (params.underlyingIn == address(0)) revert InvalidInputToken();
    // Validate output token address
    if (params.underlyingOut == address(0)) revert InvalidOutputToken();
    // Validate fee tier
    uint24 fee = params.feeTier;
    if (fee == 0) revert InvalidFeeTier();

    // Handle Exact Input swaps
    if (params.mode == ISwapHandler.SwapType.EXACT_INPUT) {
      amountIn = params.amountIn; // Set the input amount
      // Execute the swap using the Uniswap V3 router
      amountOut = _uniRouter.exactInputSingle(
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
      amountIn = _uniRouter.exactOutputSingle(
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
