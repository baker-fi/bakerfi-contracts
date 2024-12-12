# Solidity API

## IStrategyLeverage

Interface used for Leverage Strategy

### getCollateralAsset

```solidity
function getCollateralAsset() external view returns (address)
```

_Return the Address of the Asset used as Collatteral_

### getDebAsset

```solidity
function getDebAsset() external view returns (address)
```

_Return the Address of the Debt Asset used as Debt_

### getPosition

```solidity
function getPosition(struct IOracle.PriceOptions priceOptions) external view returns (uint256 totalCollateralInUSD, uint256 totalDebtInUSD, uint256 loanToValue)
```

_Return the Collatetal/Debt/Loan Balances in USD and Loan To Value_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| priceOptions | struct IOracle.PriceOptions | The Oracle optios |

