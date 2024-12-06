# Solidity API

## StrategyUniV2SwapAnd

A strategy that swaps an asset for a parked asset and then swaps the parked asset back to the original asset
This strategy could be used to convert an assert to an yield bearing asset harvest the yield

### constructor

```solidity
constructor(address initialOwner, contract IERC20 iAsset, contract IStrategy iUnderlyingStrategy, contract IOracle iOracle, contract IUniswapV2Router02 router) public
```

Constructor for the StrategyUniV2SwapAnd contract

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the initial owner of the contract |
| iAsset | contract IERC20 | The asset being managed |
| iUnderlyingStrategy | contract IStrategy | The underlying strategy |
| iOracle | contract IOracle | The oracle used to get the price of the asset iAsset/underlyingAsset |
| router | contract IUniswapV2Router02 | The swap router used to swap the asset |

### _swap

```solidity
function _swap(struct ISwapHandler.SwapParams params) internal returns (uint256 amountIn, uint256 amountOut)
```

Internal function to swap the asset using the UniV2Swapper

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | The swap parameters |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of input tokens |
| amountOut | uint256 | The amount of output tokens |

