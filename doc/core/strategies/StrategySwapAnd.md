# Solidity API

## StrategySwapAnd

A strategy that swaps an asset for a parked asset and then swaps the parked asset back to the original asset
This strategy could be used to convert an assert to an yield bearing asset harvest the yield

_The strategy is designed to be used with a single asset and a single parked asset_

### InvalidConfiguration

```solidity
error InvalidConfiguration()
```

Error for invalid configuration

### SlippageExceeded

```solidity
error SlippageExceeded()
```

Error for slippage exceeded

### InvalidAmount

```solidity
error InvalidAmount()
```

Error for invalid amount

### FailedToApproveAllowanceFor

```solidity
error FailedToApproveAllowanceFor()
```

### _asset

```solidity
contract IERC20 _asset
```

The asset being managed

### constructor

```solidity
constructor(address initialOwner, contract IERC20 iAsset, contract IStrategy iUnderlyingStrategy, contract IOracle iOracle) internal
```

Constructor for the StrategySwapPark contract

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The initial owner of the strategy |
| iAsset | contract IERC20 | The strategy input asset |
| iUnderlyingStrategy | contract IStrategy | The oracle used to get the price of the asset iAsset/underlyingAsset |
| iOracle | contract IOracle | The swap router used to swap the asset |

### underlyingAsset

```solidity
function underlyingAsset() public view returns (address)
```

Get the parked asset

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address The address of the parked asset |

### deploy

```solidity
function deploy(uint256 amount) external returns (uint256 amountUsed)
```

_Deploys funds in the AAVEv3 strategy_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountUsed | uint256 |  |

### _convertToUnderlying

```solidity
function _convertToUnderlying(struct IOracle.PriceOptions options, uint256 amount) internal view returns (uint256 amountOut_)
```

Convert the asset to the parked asset

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| options | struct IOracle.PriceOptions | The options for the oracle |
| amount | uint256 | The amount to convert |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut_ | uint256 | The amount out |

### _convertFromUnderlying

```solidity
function _convertFromUnderlying(struct IOracle.PriceOptions options, uint256 amount) internal view returns (uint256 amountOut_)
```

Convert the parked asset to the asset

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| options | struct IOracle.PriceOptions | The options for the oracle |
| amount | uint256 | The amount to convert |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut_ | uint256 | The amount out |

### _swap

```solidity
function _swap(struct ISwapHandler.SwapParams params) internal virtual returns (uint256 amountIn, uint256 amountOut)
```

### undeploy

```solidity
function undeploy(uint256 amount) external returns (uint256 undeployedAmount_)
```

_Initiates the undeployment process by adjusting the contract's position and performing a flash loan._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of ETH to undeploy. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| undeployedAmount_ | uint256 |  |

### harvest

```solidity
function harvest() external returns (int256 balanceChange)
```

Harvests the strategy by yield and rebalances the strategy

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in strategy balance as an int256 value. |

### totalAssets

```solidity
function totalAssets() external view returns (uint256)
```

_Retrieves the total owned assets by the Strategy in_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 |  |

### _totalAssets

```solidity
function _totalAssets() internal view returns (uint256 amount_)
```

Get the total assets using the oracle price and the parked asset balance

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount_ | uint256 | The amount |

### asset

```solidity
function asset() external view returns (address)
```

The Asset deployed on this strategy

### setMaxSlippage

```solidity
function setMaxSlippage(uint256 maxSlippage_) external
```

Set the max slippage

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxSlippage_ | uint256 | The max slippage |

### maxSlippage

```solidity
function maxSlippage() external view returns (uint256)
```

Get the max slippage

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | maxSlippage_ The max slippage |

### oracle

```solidity
function oracle() external view returns (address)
```

