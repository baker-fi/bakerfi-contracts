# Solidity API

## UseLeverage

### InvalidNumberOfLoops

```solidity
error InvalidNumberOfLoops()
```

### InvalidLoanToValue

```solidity
error InvalidLoanToValue()
```

### InvalidPercentageValue

```solidity
error InvalidPercentageValue()
```

### InvalidTargetValue

```solidity
error InvalidTargetValue()
```

### InvalidDivisor

```solidity
error InvalidDivisor()
```

### _calculateLeverageRatio

```solidity
function _calculateLeverageRatio(uint256 baseValue, uint256 loanToValue, uint8 nrLoops) internal pure returns (uint256)
```

_Calculates the leverage ratio based on the provided parameters._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| baseValue | uint256 | The base value for leverage calculation. |
| loanToValue | uint256 | The loan-to-value ratio (expressed as a percentage with precision). |
| nrLoops | uint8 | The number of loops for the iterative calculation. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The calculated leverage ratio. |

### _calcDeltaPosition

```solidity
function _calcDeltaPosition(uint256 percentageToBurn, uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) internal pure returns (uint256 deltaCollateralInETH, uint256 deltaDebtInETH)
```

_Calculates the changes in collateral and debt based on a specified percentage to burn._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| percentageToBurn | uint256 | The percentage to burn (expressed as a percentage with precision). |
| totalCollateralBaseInEth | uint256 | The total collateral base in ETH. |
| totalDebtBaseInEth | uint256 | The total debt base in ETH. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deltaCollateralInETH | uint256 | The change in collateral in ETH. |
| deltaDebtInETH | uint256 | The change in debt in ETH. |

### _calculateDebtToPay

```solidity
function _calculateDebtToPay(uint256 targetLoanToValue, uint256 collateral, uint256 debt) internal pure returns (uint256 delta)
```

_Calculates the amount of debt that needs to be paid to achieve a target loan-to-value ratio._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| targetLoanToValue | uint256 | The target loan-to-value ratio (expressed as a percentage with precision). |
| collateral | uint256 | The current collateral amount. |
| debt | uint256 | The current debt amount. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| delta | uint256 | The additional debt that needs to be paid. |

