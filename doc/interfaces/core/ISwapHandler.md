# Solidity API

## ISwapHandler

### SwapParams

```solidity
struct SwapParams {
  address underlyingIn;
  address underlyingOut;
  enum ISwapHandler.SwapType mode;
  uint256 amountIn;
  uint256 amountOut;
  uint24 feeTier;
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

### _swap

```solidity
function _swap(struct ISwapHandler.SwapParams params) internal virtual returns (uint256 amountOut)
```

Execute a trade on the swap handler

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | struct defining the requested trade |

