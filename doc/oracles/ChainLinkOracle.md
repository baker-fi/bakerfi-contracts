# Solidity API

## ChainLinkOracle

Oracle that uses ChainLink feeds to provide up to date prices
for further use on the protocol

### InvalidPriceFromOracle

```solidity
error InvalidPriceFromOracle()
```

### InvalidPriceUpdatedAt

```solidity
error InvalidPriceUpdatedAt()
```

### constructor

```solidity
constructor(address priceFeed, uint256 minPrice, uint256 maxPrice) public
```

Chainlink Price Feed Address

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| priceFeed | address | The Price Feed Chain Address. |
| minPrice | uint256 |  |
| maxPrice | uint256 |  |

### getPrecision

```solidity
function getPrecision() public pure returns (uint256)
```

Retrieves the precision of the price information provided by the Oracle.

_This function is view-only and does not modify the state of the contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The precision of the Oracle's price information as a uint256. |

### getLatestPrice

```solidity
function getLatestPrice() public view returns (struct IOracle.Price price)
```

Get the Latest price from the Chainlink aggregator and convert the price taking into account
the price decimals.

### getSafeLatestPrice

```solidity
function getSafeLatestPrice(struct IOracle.PriceOptions priceOptions) public view returns (struct IOracle.Price price)
```

Retrieves the latest price information from the Oracle and reverts whern the price
is outdated

_This function is view-only and does not modify the state of the contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct IOracle.Price | The latest price from the Oracle as a uint256. |

