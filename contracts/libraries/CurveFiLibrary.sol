// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
import { ISwapHandler } from "../interfaces/core/ISwapHandler.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ICurveRouterNG } from "../interfaces/curve/ICurveRouterNG.sol";

/**
 * @title SwapLibrary
 * @dev Library for swapping tokens using Uniswap V2 and V3
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 *
 * swapCurveFi is used for Curve Finance Swaps
 * swapUniV3 is used for Uniswap V3 Swaps
 * swapUniV2 is used for Uniswap V2 Swaps
 */
library CurveFiLibrary {
  using SafeERC20 for IERC20;

  address public constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

  error InvalidFeeTier();
  error InvalidV2RouterContract();
  error InvalidV3RouterContract();
  error InsufficientBalance();
  error UnsupportedSwapType();

  /**
   * @dev Executes a token swap using the Curve Router.
   */
  function swapCurveFi(
    ICurveRouterNG router,
    ISwapHandler.SwapParams memory params
  ) internal returns (uint256 amountIn, uint256 amountOut) {
    if (params.underlyingIn == address(0)) revert ISwapHandler.InvalidInputToken();
    if (params.underlyingOut == address(0)) revert ISwapHandler.InvalidOutputToken();

    // Initialize route and swap parameters
    address[11] memory route;
    uint256[5][5] memory swapParams;
    address[5] memory pools;
    // Set up basic route (simplified for single direct swap)
    // Configure swap parameters for a standard token exchange
    // [i, j, swap_type, pool_type, n_coins]
    (uint256 i, uint256 j, uint256 swapType, uint256 poolType, address pool) = abi.decode(
      params.payload,
      (uint256, uint256, uint256, uint256, address)
    );
    route[0] = params.underlyingIn;
    route[1] = pool;
    route[2] = params.underlyingOut;
    pools[0] = pool;
    // Decode the payload to get the swap parameters for Curve Router
    swapParams[0] = [uint256(i), uint256(j), uint256(swapType), poolType, 2]; // Standard token exchange in stable pool
    return _executeCurveFiSwap(router, route, swapParams, pools, params);
  }

  /**
   * @dev Executes a token swap using the Curve Router.
   *
   * This function handles two types of swaps:
   * 1. EXACT_INPUT: The user specifies an exact amount of input tokens to swap for a minimum amount of output tokens.
   * 2. EXACT_OUTPUT: The user specifies an exact amount of output tokens to receive, and the function calculates the required input tokens.
   *
   * @param route An array of addresses representing the swap route.
   * @param swapParams A 2D array containing parameters for the swap.
   * @param pools An array of addresses representing the liquidity pools.
   * @param params The swap parameters containing details about the swap.
   * @return amountIn The actual amount of input tokens used in the swap.
   * @return amountOut The actual amount of output tokens received from the swap.
   */
  function _executeCurveFiSwap(
    ICurveRouterNG router,
    address[11] memory route,
    uint256[5][5] memory swapParams,
    address[5] memory pools,
    ISwapHandler.SwapParams memory params
  ) internal returns (uint256 amountIn, uint256 amountOut) {
    // Check if the swap mode is EXACT_INPUT
    if (params.mode == ISwapHandler.SwapType.EXACT_INPUT) {
      // Determine the amount of input tokens
      amountIn = params.underlyingIn == ETH_ADDRESS ? msg.value : params.amountIn;

      // Execute the swap using the Curve Router
      amountOut = router.exchange{ value: msg.value }(
        route,
        swapParams,
        amountIn,
        params.amountOut, // minimum amount out
        pools,
        address(this)
      );

      // Check if the output amount is less than the expected amount
      if (amountOut < params.amountOut) {
        revert ISwapHandler.SwapFailed(); // Revert if the swap failed
      }

      // Check if the swap mode is EXACT_OUTPUT
    } else if (params.mode == ISwapHandler.SwapType.EXACT_OUTPUT) {
      // Declare arrays for base pools and tokens
      address[5] memory basePools;
      address[5] memory baseTokens;

      // Calculate the required input amount for the desired output
      uint256 requiredIn = router.get_dx(
        route,
        swapParams,
        params.amountOut,
        pools,
        basePools,
        baseTokens
      );

      // Check if the required input exceeds the available input
      if (
        (params.underlyingIn == ETH_ADDRESS && requiredIn > msg.value) ||
        (params.underlyingIn != ETH_ADDRESS && requiredIn > params.amountIn)
      ) {
        revert InsufficientBalance(); // Revert if insufficient input amount
      }

      // Determine the amount of input tokens
      amountIn = params.underlyingIn == ETH_ADDRESS ? msg.value : params.amountIn;

      // Execute the swap using the Curve Router
      amountOut = router.exchange{ value: amountIn }(
        route,
        swapParams,
        amountIn,
        params.amountOut,
        pools,
        address(this)
      );

      // Check if the output amount is less than the expected amount
      if (amountOut < params.amountOut) {
        revert ISwapHandler.SwapFailed(); // Revert if the swap failed
      }
    } else {
      revert UnsupportedSwapType(); // Revert if the swap type is unsupported
    }
  }
}
