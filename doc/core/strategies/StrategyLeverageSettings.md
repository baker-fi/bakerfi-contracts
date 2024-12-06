# Solidity API

## StrategyLeverageSettings

### InvalidMaxLoanToValue

```solidity
error InvalidMaxLoanToValue()
```

### InvalidLoopCount

```solidity
error InvalidLoopCount()
```

### MaxLoanToValueChanged

```solidity
event MaxLoanToValueChanged(uint256 value)
```

_Emitted when the maximum allowed loan-to-value ratio is changed.

This event provides information about the updated maximum loan-to-value ratio._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The new maximum allowed loan-to-value ratio. |

### LoanToValueChanged

```solidity
event LoanToValueChanged(uint256 value)
```

_Emitted when the general loan-to-value ratio is changed.

This event provides information about the updated loan-to-value ratio._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The new general loan-to-value ratio. |

### NrLoopsChanged

```solidity
event NrLoopsChanged(uint256 value)
```

_Emitted when the number of loops for a specific process is changed.

This event provides information about the updated number of loops._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The new number of loops. |

### MaxSlippageChanged

```solidity
event MaxSlippageChanged(uint256 value)
```

### _initLeverageSettings

```solidity
function _initLeverageSettings(address initialOwner, address initialGovernor) internal
```

### setMaxLoanToValue

```solidity
function setMaxLoanToValue(uint256 maxLoanToValue) external
```

_Sets the maximum allowed loan-to-value ratio.

This function can only be called by the owner and is used to update the maximum allowed loan-to-value ratio.
Emits a {MaxLoanToValueChanged} event upon successful update._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| maxLoanToValue | uint256 | The new maximum allowed loan-to-value ratio to be set. Requirements: - The caller must be the owner of the contract. |

### getMaxLoanToValue

```solidity
function getMaxLoanToValue() public view returns (uint256)
```

_Retrieves the maximum allowed loan-to-value ratio.

This function is externally callable and returns the maximum allowed loan-to-value ratio._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | maxLoanToValue The maximum allowed loan-to-value ratio. |

### setLoanToValue

```solidity
function setLoanToValue(uint256 loanToValue) external
```

_Sets the general loan-to-value ratio.

This function can only be called by the owner and is used to update the general loan-to-value ratio.
Emits a {LoanToValueChanged} event upon successful update._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| loanToValue | uint256 | The new general loan-to-value ratio to be set. Requirements: - The caller must be the owner of the contract. - The new loan-to-value ratio must be less than or equal to the maximum allowed loan-to-value ratio. - The new loan-to-value ratio must be a valid percentage value. - The new loan-to-value ratio must be greater than 0. |

### getLoanToValue

```solidity
function getLoanToValue() public view returns (uint256)
```

_Retrieves the general loan-to-value ratio.

This function is externally callable and returns the general loan-to-value ratio._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | loanToValue The general loan-to-value ratio. |

### getNrLoops

```solidity
function getNrLoops() public view returns (uint8)
```

_Retrieves the number of loops for our Recursive Staking Strategy

This function is externally callable and returns the number of loops configured._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint8 | nrLoops The number of loops. |

### setNrLoops

```solidity
function setNrLoops(uint8 nrLoops) external
```

_Sets the number of loops for our Recursive Staking Strategy

This function can only be called by the owner and is used to update the number of loops.
Emits an {NrLoopsChanged} event upon successful update._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| nrLoops | uint8 | The new number of loops to be set. Requirements: - The caller must be the owner of the contract. - The new number of loops must be less than the maximum allowed number of loops. |

### getMaxSlippage

```solidity
function getMaxSlippage() public view returns (uint256)
```

### setMaxSlippage

```solidity
function setMaxSlippage(uint256 slippage) external
```

