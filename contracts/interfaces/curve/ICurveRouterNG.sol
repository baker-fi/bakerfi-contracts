// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ICurveRouterNG
 *
 * @dev Interface for the Curve Finance Router
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 */
interface ICurveRouterNG {
  /**
   * @notice Exchange Curve function
   * @param route The route of the swap
   * @param swapParams The swap parameters
   * @param amountIn The amount of tokens to swap
   * @param amountOutMin The minimum amount of tokens to receive
   * @param pools The receivers of the swap
   * @param receiverAddress The address of the receiver
   *
   * Swap parameters are defined in a multidimensional array which provides essential information about
   * which tokens to swap using a specified pool.
   * The array structure includes the following elements: [i, j, swap_type, pool_type, n_coins].
   *
   * i = index of the token to swap from
   * j = index of the token to swap to
   * n
   *
   *  swap_type	Description
   * 1	Standard token exchange
   * 2	Underlying token exchange_underlying
   * 3	Underlying exchange via zap for factory stable metapools and crypto-meta pools (exchange_underlying for stable, exchange in zap for crypto)
   * 4	Coin to LP token "exchange" (effectively add_liquidity)
   * 5	Lending pool underlying coin to LP token "exchange" (effectively add_liquidity)
   * 6	LP token to coin "exchange" (effectively remove_liquidity_one_coin)
   * 7	LP token to lending or fake pool underlying coin "exchange" (effectively remove_liquidity_one_coin)
   * 8	Specialized swaps like ETH <-> WETH, ETH -> stETH or frxETH, and cross-liquidity between staked tokens (e.g., stETH <-> wstETH, frxETH <-> sfrxETH)
   * 9	SNX-related swaps (e.g., sUSD, sEUR, sETH, sBTC)
   *
   * pool_type	Description
   * 1	Stable pools using the Stableswap algorithm
   * 2	Two-coin Crypto pools using the Cryptoswap algorithm
   * 3	Tricrypto pools with three coins using the Cryptoswap algorithm
   * 4	Llamma pools, typically used in crvUSD and lending markets
   *
   */
  function exchange(
    address[11] memory route,
    uint256[5][5] memory swapParams,
    uint256 amountIn,
    uint256 amountOutMin,
    address[5] memory pools,
    address receiverAddress
  ) external payable returns (uint256);

  /**
   * @notice Function to calculate the amount of final output tokens received when performing an exchange.
   * @param route The route of the swap
   * @param swapParams The swap parameters
   * @param amount The desired amount of output tokens
   * @param pools The pools to use for the swap
   */
  function get_dy(
    address[11] memory route,
    uint256[5][5] memory swapParams,
    uint256 amount,
    address[5] memory pools
  ) external view returns (uint256);

  /**
   * @notice Function to calculate the amount of input tokens required to receive the desired amount of output tokens.
   * @param route The route of the swap
   * @param swapParams The swap parameters
   * @param amountOut The desired amount of output tokens
   * @param pools The pools to use for the swap
   * @param basePools The base pools to use for the swap
   * @param baseTokens The base tokens to use for the swap
   */
  function get_dx(
    address[11] memory route,
    uint256[5][5] memory swapParams,
    uint256 amountOut,
    address[5] memory pools,
    address[5] memory basePools,
    address[5] memory baseTokens
  ) external view returns (uint256);
}
