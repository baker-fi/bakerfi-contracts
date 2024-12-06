# Solidity API

## AerodromeLibrary

_Library for handling Aerodrome swaps_

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

### NotSupported

```solidity
error NotSupported()
```

### FailedToApproveAllowance

```solidity
error FailedToApproveAllowance()
```

### swapAerodrome

```solidity
function swapAerodrome(contract ISwapRouter router, struct ISwapHandler.SwapParams params) internal returns (uint256 amountIn, uint256 amountOut)
```

Swaps tokens using Uniswap V2

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| router | contract ISwapRouter | The Uniswap V2 Router address |
| params | struct ISwapHandler.SwapParams | The swap parameters |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The actual input amount |
| amountOut | uint256 | The actual output amount |

