# Solidity API

## RatioOracle

A contract that provides price data based on a ratio calculation

_This contract implements the IOracle interface_

### InvalidPriceFromOracle

```solidity
error InvalidPriceFromOracle()
```

### Call

```solidity
struct Call {
  address target;
  bytes callData;
}
```

### constructor

```solidity
constructor(struct RatioOracle.Call call, uint8 resultDecimals) public
```

Constructs the RatioOracle contract

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| call | struct RatioOracle.Call | The target contract and calldata for fetching the ratio |
| resultDecimals | uint8 | The number of decimals in the result |

### getPrecision

```solidity
function getPrecision() public pure returns (uint256)
```

Get the price precision

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The precision of the price (1e18) |

### getLatestPrice

```solidity
function getLatestPrice() public view returns (struct IOracle.Price)
```

Get the latest price

_This function might return a stale price or a price with lower confidence_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct IOracle.Price | The latest price data |

### getSafeLatestPrice

```solidity
function getSafeLatestPrice(struct IOracle.PriceOptions priceOptions) public view returns (struct IOracle.Price price)
```

Get the latest safe price

_This function checks the maxAge of the price and the price confidence_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| priceOptions | struct IOracle.PriceOptions | Options for price fetching |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct IOracle.Price | The fetched price data |

