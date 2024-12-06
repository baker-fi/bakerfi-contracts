# Solidity API

## PythOracle

Oracle that uses Pyth feeds to provide up to date prices
for further use on the protocol

This contract provide safe and unsafe price retrieval functions

### InvalidPriceUpdate

```solidity
error InvalidPriceUpdate()
```

### InvalidPriceAnswer

```solidity
error InvalidPriceAnswer()
```

### NoEnoughFee

```solidity
error NoEnoughFee()
```

### InvalidPriceOption

```solidity
error InvalidPriceOption()
```

### _MIN_EXPONENT

```solidity
int256 _MIN_EXPONENT
```

### _MAX_EXPONENT

```solidity
int256 _MAX_EXPONENT
```

### constructor

```solidity
constructor(bytes32 priceID, address pythContract) public
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| priceID | bytes32 | The Pyth Oracle identifier |
| pythContract | address | The Pyth Central Point |

### getPrecision

```solidity
function getPrecision() public pure returns (uint256)
```

Get the Price precision

### getAndUpdatePrice

```solidity
function getAndUpdatePrice(bytes priceUpdateData) external payable returns (struct IOracle.Price)
```

Update the Price and return the Price

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| priceUpdateData | bytes | Price Update for Pyth |

### getLatestPrice

```solidity
function getLatestPrice() public view returns (struct IOracle.Price)
```

Get the Latest Price.

_This function might return a stale price or a price with lower confidence.
Warning: This oracle is unsafe to use on price sensitive operations._

### getSafeLatestPrice

```solidity
function getSafeLatestPrice(struct IOracle.PriceOptions priceOptions) public view returns (struct IOracle.Price price)
```

Get the Latest Price from the Pyth Feed

_This function checks the maxAge of the price and the price confidence specified
on the input parameters._

