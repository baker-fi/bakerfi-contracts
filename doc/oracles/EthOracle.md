# Solidity API

## ETHOracle

ETH/USD Oracle using chainlink data feeds

 For more information about the feed go to 
 https://data.chain.link/feeds/arbitrum/mainnet/eth-usd

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
constructor(address ethPriceFeed) public
```

### getPrecision

```solidity
function getPrecision() external pure returns (uint256)
```

Retrieves the precision of the price information provided by the Oracle.

_This function is view-only and does not modify the state of the contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The precision of the Oracle's price information as a uint256. |

### getLatestPrice

```solidity
function getLatestPrice() external view returns (struct IOracle.Price price)
```

Retrieves the latest price information from the Oracle.

_This function is view-only and does not modify the state of the contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct IOracle.Price | The latest price from the Oracle as a uint256. |

