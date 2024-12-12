# Solidity API

## StrategyUniV3SwapAnd

### constructor

```solidity
constructor(address initialOwner, contract IERC20 iAsset, contract IStrategy iUnderlyingStrategy, contract IOracle iOracle, contract IV3SwapRouter router, uint24 ifeeTier) public
```

Constructor for the StrategyUniV3SwapAnd contract

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the initial owner of the contract |
| iAsset | contract IERC20 | The asset being managed |
| iUnderlyingStrategy | contract IStrategy | The underlying strategy |
| iOracle | contract IOracle | The oracle used to get the price of the asset iAsset/underlyingAsset |
| router | contract IV3SwapRouter | The swap router used to swap the asset |
| ifeeTier | uint24 | The fee tier for the swap |

### _swap

```solidity
function _swap(struct ISwapHandler.SwapParams params) internal returns (uint256 amountIn, uint256 amountOut)
```

Internal function to swap the asset using the UniV3Swapper

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | The swap parameters |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of input tokens |
| amountOut | uint256 | The amount of output tokens |

### feeTier

```solidity
function feeTier() external view returns (uint24)
```

Getter for the fee tier

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint24 | The fee tier |

