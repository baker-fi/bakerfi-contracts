# Solidity API

## ExRateOracle

This contract provide safe and unsafe price retrieval functions

### _PRECISION

```solidity
uint256 _PRECISION
```

### _DECIMALS

```solidity
uint8 _DECIMALS
```

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
constructor(contract IOracle baseOracle) internal
```

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
function getLatestPrice() public view returns (struct IOracle.Price)
```

Get the Latest Price.

_This function might return a stale price or a price with lower confidence.
Warning: This oracle is unsafe to use on price sensitive operations._

### getRatio

```solidity
function getRatio() public view virtual returns (struct IOracle.Price ratio)
```

Get the wstETH/ETH Ratio from the External oracle

_This method is not part of the IOracle interface but it could be usefull
to show prices on the frontend_

### getSafeLatestPrice

```solidity
function getSafeLatestPrice(struct IOracle.PriceOptions priceOptions) public view returns (struct IOracle.Price price)
```

Get the Latest Price from the Pyth Feed

_This function checks the maxAge of the price and the price confidence specified
on the input parameters._

