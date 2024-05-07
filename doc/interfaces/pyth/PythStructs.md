# Solidity API

## PythStructs

### Price

```solidity
struct Price {
  int64 price;
  uint64 conf;
  int32 expo;
  uint256 publishTime;
}
```

### PriceFeed

```solidity
struct PriceFeed {
  bytes32 id;
  struct PythStructs.Price price;
  struct PythStructs.Price emaPrice;
}
```

