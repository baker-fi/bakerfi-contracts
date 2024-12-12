# Solidity API

## ISwapHandler

_A contract that converts one token to another_

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

### SwapParams

Params for swaps using SwapHub contract and swap handlers

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |

```solidity
struct SwapParams {
  address underlyingIn;
  address underlyingOut;
  enum ISwapHandler.SwapType mode;
  uint256 amountIn;
  uint256 amountOut;
  bytes payload;
}
```

### SwapType

```solidity
enum SwapType {
  EXACT_INPUT,
  EXACT_OUTPUT
}
```

### swap

```solidity
function swap(struct ISwapHandler.SwapParams params) internal virtual returns (uint256 amountIn, uint256 amountOut)
```

Execute a trade on the swap handler

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | struct defining the requested trade |

