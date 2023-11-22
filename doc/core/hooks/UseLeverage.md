# Solidity API

## UseLeverage

### calculateLeverageRatio

```solidity
function calculateLeverageRatio(uint256 baseValue, uint256 loanToValue, uint8 nrLoops) public pure returns (uint256)
```

### calcDeltaPosition

```solidity
function calcDeltaPosition(uint256 percentageToBurn, uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) public pure returns (uint256 deltaCollateralInETH, uint256 deltaDebtInETH)
```

### calculateDebtToPay

```solidity
function calculateDebtToPay(uint256 targetLoanToValue, uint256 collateral, uint256 debt) public pure returns (uint256 delta)
```

