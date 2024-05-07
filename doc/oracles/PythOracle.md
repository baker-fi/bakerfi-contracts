# Solidity API

## PythOracle

### InvalidPriceUpdate

```solidity
error InvalidPriceUpdate()
```

### NoEnoughFee

```solidity
error NoEnoughFee()
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

Get the Latest Price

