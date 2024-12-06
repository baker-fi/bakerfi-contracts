# Solidity API

## StrategyAeroSwapAnd

### constructor

```solidity
constructor(address initialOwner, contract IERC20 iAsset, contract IStrategy iUnderlyingStrategy, contract IOracle iOracle, contract ISwapRouter router) public
```

Constructor for the StrategyAeroSwapAnd contract

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the initial owner of the contract |
| iAsset | contract IERC20 | The asset being managed |
| iUnderlyingStrategy | contract IStrategy | The underlying strategy |
| iOracle | contract IOracle | The oracle used to get the price of the asset iAsset/underlyingAsset |
| router | contract ISwapRouter | The Aerodrome swap router used to swap the asset |

### _swap

```solidity
function _swap(struct ISwapHandler.SwapParams params) internal returns (uint256 amountIn, uint256 amountOut)
```

Internal function to swap the asset using the AeroSwapper

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | The swap parameters |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of input tokens |
| amountOut | uint256 | The amount of output tokens |

