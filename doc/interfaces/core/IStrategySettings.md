# Solidity API

## IStrategySettings

_The Settings contract have to implement this interface_

### PriceMaxAgeChanged

```solidity
event PriceMaxAgeChanged(uint256 value)
```

_Emitted when the price max age is changed_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The new price max age |

### PriceMaxConfChanged

```solidity
event PriceMaxConfChanged(uint256 value)
```

_Emitted when the price max conf is changed_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The new price max conf |

### setPriceMaxAge

```solidity
function setPriceMaxAge(uint256 value) external
```

Sets the maximum age of the price data.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The maximum age in seconds. |

### getPriceMaxAge

```solidity
function getPriceMaxAge() external view returns (uint256)
```

Retrieves the maximum age of the price data.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The maximum age in seconds. |

### setPriceMaxConf

```solidity
function setPriceMaxConf(uint256 value) external
```

Sets the maximum confidence level for the price data in percentage

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The maximum confidence level. |

### getPriceMaxConf

```solidity
function getPriceMaxConf() external view returns (uint256)
```

Retrieves the maximum confidence level for the price data.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The maximum confidence level. |

