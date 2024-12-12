# Solidity API

## IOracle

_Interface for an Oracle providing price information with a precision._

### Price

```solidity
struct Price {
  uint256 price;
  uint256 lastUpdate;
}
```

### PriceOptions

```solidity
struct PriceOptions {
  uint256 maxAge;
  uint256 maxConf;
}
```

### PriceOutdated

```solidity
error PriceOutdated()
```

### getPrecision

```solidity
function getPrecision() public view virtual returns (uint256)
```

Retrieves the precision of the price information provided by the Oracle.

_This function is view-only and does not modify the state of the contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The precision of the Oracle's price information as a uint256. |

### getLatestPrice

```solidity
function getLatestPrice() public view virtual returns (struct IOracle.Price)
```

Retrieves the latest price information from the Oracle.

_This function is view-only and does not modify the state of the contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IOracle.Price | The latest price from the Oracle as a uint256. |

### getSafeLatestPrice

```solidity
function getSafeLatestPrice(struct IOracle.PriceOptions priceOptions) public view virtual returns (struct IOracle.Price)
```

Retrieves the latest price information from the Oracle and reverts whern the price
is outdated

_This function is view-only and does not modify the state of the contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IOracle.Price | The latest price from the Oracle as a uint256. |

