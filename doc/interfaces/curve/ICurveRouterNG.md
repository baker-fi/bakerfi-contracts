# Solidity API

## ICurveRouterNG

_Interface for the Curve Finance Router_

### exchange

```solidity
function exchange(address[11] route, uint256[5][5] swapParams, uint256 amountIn, uint256 amountOutMin, address[5] pools, address receiverAddress) external payable returns (uint256)
```

Exchange Curve function

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| route | address[11] | The route of the swap |
| swapParams | uint256[5][5] | The swap parameters |
| amountIn | uint256 | The amount of tokens to swap |
| amountOutMin | uint256 | The minimum amount of tokens to receive |
| pools | address[5] | The receivers of the swap |
| receiverAddress | address | The address of the receiver Swap parameters are defined in a multidimensional array which provides essential information about which tokens to swap using a specified pool. The array structure includes the following elements: [i, j, swap_type, pool_type, n_coins]. i = index of the token to swap from j = index of the token to swap to n  swap_type	Description 1	Standard token exchange 2	Underlying token exchange_underlying 3	Underlying exchange via zap for factory stable metapools and crypto-meta pools (exchange_underlying for stable, exchange in zap for crypto) 4	Coin to LP token "exchange" (effectively add_liquidity) 5	Lending pool underlying coin to LP token "exchange" (effectively add_liquidity) 6	LP token to coin "exchange" (effectively remove_liquidity_one_coin) 7	LP token to lending or fake pool underlying coin "exchange" (effectively remove_liquidity_one_coin) 8	Specialized swaps like ETH <-> WETH, ETH -> stETH or frxETH, and cross-liquidity between staked tokens (e.g., stETH <-> wstETH, frxETH <-> sfrxETH) 9	SNX-related swaps (e.g., sUSD, sEUR, sETH, sBTC) pool_type	Description 1	Stable pools using the Stableswap algorithm 2	Two-coin Crypto pools using the Cryptoswap algorithm 3	Tricrypto pools with three coins using the Cryptoswap algorithm 4	Llamma pools, typically used in crvUSD and lending markets |

### get_dy

```solidity
function get_dy(address[11] route, uint256[5][5] swapParams, uint256 amount, address[5] pools) external view returns (uint256)
```

Function to calculate the amount of final output tokens received when performing an exchange.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| route | address[11] | The route of the swap |
| swapParams | uint256[5][5] | The swap parameters |
| amount | uint256 | The desired amount of output tokens |
| pools | address[5] | The pools to use for the swap |

### get_dx

```solidity
function get_dx(address[11] route, uint256[5][5] swapParams, uint256 amountOut, address[5] pools, address[5] basePools, address[5] baseTokens) external view returns (uint256)
```

Function to calculate the amount of input tokens required to receive the desired amount of output tokens.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| route | address[11] | The route of the swap |
| swapParams | uint256[5][5] | The swap parameters |
| amountOut | uint256 | The desired amount of output tokens |
| pools | address[5] | The pools to use for the swap |
| basePools | address[5] | The base pools to use for the swap |
| baseTokens | address[5] | The base tokens to use for the swap |

