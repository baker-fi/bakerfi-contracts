# Solidity API

## UniV3Library

_Library for handling Uniswap V3 swaps_

### InvalidInputToken

```solidity
error InvalidInputToken()
```

### InvalidOutputToken

```solidity
error InvalidOutputToken()
```

### InvalidFeeTier

```solidity
error InvalidFeeTier()
```

### SwapFailed

```solidity
error SwapFailed()
```

### swapUniV3

```solidity
function swapUniV3(contract IV3SwapRouter router, struct ISwapHandler.SwapParams params) internal returns (uint256 amountIn, uint256 amountOut)
```

Swaps tokens using Uniswap V3

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| router | contract IV3SwapRouter | The Uniswap V3 Router address |
| params | struct ISwapHandler.SwapParams | The swap parameters |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The actual input amount |
| amountOut | uint256 | The actual output amount |

