# Solidity API

## MultiStrategy

This contract is used to manage multiple strategies. The rebalancing is done based on the weights of the
strategies.

### AddStrategy

```solidity
event AddStrategy(address strategy)
```

Emitted when a new strategy is added to the MultiStrategy contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| strategy | address | The address of the added strategy. |

### RemoveStrategy

```solidity
event RemoveStrategy(address strategy)
```

Emitted when a strategy is removed from the MultiStrategy contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| strategy | address | The address of the removed strategy. |

### WeightsUpdated

```solidity
event WeightsUpdated(uint16[] weights)
```

Emitted when the weights of the strategies are updated.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| weights | uint16[] | The new weights to set. |

### MaxDifferenceUpdated

```solidity
event MaxDifferenceUpdated(uint256 maxDifference)
```

Emitted when the maximum difference is updated.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxDifference | uint256 | The new maximum difference to set. |

### InvalidStrategy

```solidity
error InvalidStrategy()
```

### InvalidStrategyIndex

```solidity
error InvalidStrategyIndex(uint256 index)
```

### InvalidMaxDifference

```solidity
error InvalidMaxDifference(uint256 maxDifference)
```

### InvalidWeightsLength

```solidity
error InvalidWeightsLength()
```

### InvalidStrategies

```solidity
error InvalidStrategies()
```

### InvalidWeights

```solidity
error InvalidWeights()
```

### MAX_TOTAL_WEIGHT

```solidity
uint16 MAX_TOTAL_WEIGHT
```

### _initMultiStrategy

```solidity
function _initMultiStrategy(contract IStrategy[] istrategies, uint16[] iweights) internal
```

Initializes the MultiStrategy contract with an array of strategy parameters.

_This function sets the strategies and calculates the total weight of all strategies._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| istrategies | contract IStrategy[] | An array of StrategyParams containing the strategies and their weights. |
| iweights | uint16[] |  |

### setWeights

```solidity
function setWeights(uint16[] iweights) external
```

Sets the weights of the strategies.

_Reverts if the weights array length is not equal to the strategies array length._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| iweights | uint16[] | The new weights to set. |

### maxDifference

```solidity
function maxDifference() external view returns (uint256)
```

Returns the maximum allowable difference between target and current allocation.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The maximum difference as a uint256. |

### setMaxDifference

```solidity
function setMaxDifference(uint256 imaxDifference) external
```

Sets the maximum allowable difference between target and current allocation.

_Reverts if the new maximum difference exceeds the defined precision._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| imaxDifference | uint256 | The new maximum difference to set. |

### addStrategy

```solidity
function addStrategy(contract IStrategy strategy) external
```

Adds a new strategy to the MultiStrategy contract.

_Reverts if the strategy address is zero or if the weight is zero._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| strategy | contract IStrategy | The StrategyParams containing the strategy and its weight. |

### strategies

```solidity
function strategies() external view returns (contract IStrategy[])
```

Returns the array of strategies.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | contract IStrategy[] | An array of StrategyParams representing the strategies. |

### weights

```solidity
function weights() external view returns (uint16[])
```

Returns the array of weights.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint16[] | An array of uint8 representing the weights. |

### totalWeight

```solidity
function totalWeight() public view returns (uint16)
```

Returns the total weight of all strategies.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint16 | The total weight as a uint256. |

### _allocateAssets

```solidity
function _allocateAssets(uint256 amount) internal returns (uint256 totalDeployed)
```

Allocates assets to the strategies based on their weights.

_This function deploys the calculated fractional amounts to each strategy._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The total amount of assets to allocate. |

### _deallocateAssets

```solidity
function _deallocateAssets(uint256 amount) internal returns (uint256 totalUndeployed)
```

Deallocates assets from the strategies based on their current weights.

_This function undeploys the calculated fractional amounts from each strategy._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The total amount of assets to deallocate. |

### _totalAssets

```solidity
function _totalAssets() internal view virtual returns (uint256 assets)
```

Calculates the total assets managed by all strategies.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The total assets as a uint256. |

### _harvestStrategies

```solidity
function _harvestStrategies() internal returns (int256 balanceChange)
```

### _rebalanceStrategies

```solidity
function _rebalanceStrategies() internal
```

Rebalances the strategies based on their target allocations.

_This function checks if the last allocation was within the minimum reallocation interval
and adjusts the allocations of each strategy accordingly._

### removeStrategy

```solidity
function removeStrategy(uint256 index) external
```

Removes a strategy from the MultiStrategy contract.

_Reverts if the index is out of bounds. The last strategy is moved to the removed index.
This function also handles the undeployment of assets from the strategy being removed and rebalances the remaining strategies._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | The index of the strategy to remove. |

