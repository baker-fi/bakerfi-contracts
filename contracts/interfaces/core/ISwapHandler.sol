// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

/**
 * @title Generic Swapper Handler
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev A contract that converts one token to another
 */
abstract contract ISwapHandler {
  error InvalidInputToken();
  error InvalidOutputToken();
  error SwapFailed();

  /// @notice Params for swaps using SwapHub contract and swap handlers
  /// @param underlyingIn sold token address
  /// @param underlyingOut bought token address
  /// @param mode type of the swap: 0 for exact input, 1 for exact output
  /// @param amountIn amount of token to sell. Exact value for exact input, maximum for exact output
  /// @param amountOut amount of token to buy. Exact value for exact output, minimum for exact input
  /// @param payload multi-purpose byte param. The usage depends on the swap handler implementation
  struct SwapParams {
    address underlyingIn;
    address underlyingOut;
    SwapType mode;
    uint256 amountIn;
    uint256 amountOut;
    bytes payload;
  }

  // @notice The type of swap
  enum SwapType {
    EXACT_INPUT,
    EXACT_OUTPUT
  }

  /// @notice Execute a trade on the swap handler
  /// @param params struct defining the requested trade
  function swap(
    SwapParams memory params
  ) internal virtual returns (uint256 amountIn, uint256 amountOut);
}
