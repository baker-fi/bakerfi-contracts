# Solidity API

## UniV2Library

_Library for handling Uniswap V2 swaps_

### InvalidInputToken

```solidity
error InvalidInputToken()
```

### InvalidOutputToken

```solidity
error InvalidOutputToken()
```

### SwapFailed

```solidity
error SwapFailed()
```

### FailedToApproveAllowance

```solidity
error FailedToApproveAllowance()
```

### swapUniV2

```solidity
function swapUniV2(contract IUniswapV2Router02 router, struct ISwapHandler.SwapParams params) internal returns (uint256 amountIn, uint256 amountOut)
```

Swaps tokens using Uniswap V2

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| router | contract IUniswapV2Router02 | The Uniswap V2 Router address |
| params | struct ISwapHandler.SwapParams | The swap parameters |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The actual input amount |
| amountOut | uint256 | The actual output amount |

