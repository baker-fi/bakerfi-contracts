# Solidity API

## StrategyCurveSwapAnd

### constructor

```solidity
constructor(address initialOwner, contract IERC20 iAsset, contract IStrategy iUnderlyingStrategy, contract IOracle iOracle, contract ICurveRouterNG router, address iPool, uint8 inTokenPoolIndex, uint8 outTokenPoolIndex, uint8 iSwapType, uint8 iPoolType) public
```

Constructor for the StrategyCurveSwapAnd contract

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the initial owner of the contract |
| iAsset | contract IERC20 | The asset being managed |
| iUnderlyingStrategy | contract IStrategy | The underlying strategy |
| iOracle | contract IOracle | The oracle used to get the price of the asset iAsset/underlyingAsset |
| router | contract ICurveRouterNG | The Curve Router NG contract |
| iPool | address | The Curve pool address |
| inTokenPoolIndex | uint8 | The index of the input token in the pool |
| outTokenPoolIndex | uint8 | The index of the output token in the pool |
| iSwapType | uint8 | The type of swap (1 for stableswap, 2 for cryptoswap) |
| iPoolType | uint8 | The type of pool (1 for standard, 2 for lending, etc.) |

### _swap

```solidity
function _swap(struct ISwapHandler.SwapParams params) internal returns (uint256 amountIn, uint256 amountOut)
```

Internal function to swap the asset using the CurveSwapper

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | The swap parameters |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of input tokens |
| amountOut | uint256 | The amount of output tokens |

### pool

```solidity
function pool() external view returns (address)
```

Getter for the Curve pool address

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The pool address |

