# Solidity API

## Settings

The settings could only be changed by the Owner and could be used by any contract by the system.

_The `Settings` contract is used to manage protocol settings.
It extends the `OwnableUpgradeable` contract and implements the `ISettings` interface.
The settings can only be changed by the owner and can be utilized by any contract within the system.

This contract is going to be used by any service on the Bakerfi system to retrieve 
the fees, basic configuration parameters and the list of whitelisted adresess that can 
interact with the system_

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

### WithdrawalFeeChanged

```solidity
event WithdrawalFeeChanged(uint256 value)
```

_Emitted when the withdrawal fee is changed.

This event provides information about the updated withdrawal fee._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The new withdrawal fee percentage. |

### PerformanceFeeChanged

```solidity
event PerformanceFeeChanged(uint256 value)
```

_Emitted when the performance fee is changed.

This event provides information about the updated performance fee._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The new performance fee percentage. |

### FeeReceiverChanged

```solidity
event FeeReceiverChanged(address value)
```

_Emitted when the fee receiver address is changed.

This event provides information about the updated fee receiver address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | address | The new fee receiver address. |

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

### AccountWhiteList

```solidity
event AccountWhiteList(address account, bool enabled)
```

_Emitted when an account is added or removed from the whitelist.

This event provides information about whether an account is enabled or disabled in the whitelist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account affected by the whitelist change. |
| enabled | bool | A boolean indicating whether the account is enabled (true) or disabled (false) in the whitelist. |

### initialize

```solidity
function initialize(address initialOwner) public
```

_Initializes the contract.

This function is used for the initial setup of the contract, setting the owner, withdrawal fee,
performance fee, fee receiver, loan-to-value ratio, maximum loan-to-value ratio, and the number of loops._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address to be set as the initial owner of the contract. Requirements: - The provided owner address must not be the zero address. |

### enableAccount

```solidity
function enableAccount(address account, bool enabled) external
```

_Enables or disables an account in the whitelist.

This function can only be called by the owner and is used to enable or disable an account
in the whitelist. Emits an {AccountWhiteList} event upon successful update._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account to be enabled or disabled. |
| enabled | bool | A boolean indicating whether the account should be enabled (true) or disabled (false) in the whitelist. Requirements: - The caller must be the owner of the contract. |

### isAccountEnabled

```solidity
function isAccountEnabled(address account) external view returns (bool)
```

_Checks if an account is enabled in the whitelist.

This function is externally callable and returns a boolean indicating whether the specified account
is enabled in the whitelist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account to be checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | enabled A boolean indicating whether the account is enabled (true) or not (false) in the whitelist. |

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
function getMaxLoanToValue() external view returns (uint256)
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
function getLoanToValue() external view returns (uint256)
```

_Retrieves the general loan-to-value ratio.

This function is externally callable and returns the general loan-to-value ratio._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | loanToValue The general loan-to-value ratio. |

### setWithdrawalFee

```solidity
function setWithdrawalFee(uint256 fee) external
```

_Sets the withdrawal fee percentage.

This function can only be called by the owner and is used to update the withdrawal fee percentage.
Emits a {WithdrawalFeeChanged} event upon successful update._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint256 | The new withdrawal fee percentage to be set. Requirements: - The caller must be the owner of the contract. - The new withdrawal fee percentage must be a valid percentage value. |

### getWithdrawalFee

```solidity
function getWithdrawalFee() external view returns (uint256)
```

_Retrieves the withdrawal fee percentage.

This function is externally callable and returns the withdrawal fee percentage._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | fee The withdrawal fee percentage. |

### setPerformanceFee

```solidity
function setPerformanceFee(uint256 fee) external
```

_Sets the performance fee percentage.

This function can only be called by the owner and is used to update the performance fee percentage.
Emits a {PerformanceFeeChanged} event upon successful update._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint256 | The new performance fee percentage to be set. Requirements: - The caller must be the owner of the contract. - The new performance fee percentage must be a valid percentage value. |

### getPerformanceFee

```solidity
function getPerformanceFee() external view returns (uint256)
```

_Retrieves the performance fee percentage.

This function is externally callable and returns the performance fee percentage._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | fee The performance fee percentage. |

### setFeeReceiver

```solidity
function setFeeReceiver(address receiver) external
```

_Sets the fee receiver address.

This function can only be called by the owner and is used to update the fee receiver address.
Emits a {FeeReceiverChanged} event upon successful update._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiver | address | The new fee receiver address to be set. Requirements: - The caller must be the owner of the contract. - The new fee receiver address must not be the zero address. |

### getFeeReceiver

```solidity
function getFeeReceiver() external view returns (address)
```

_Retrieves the fee receiver address.

This function is externally callable and returns the fee receiver address._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | receiver The fee receiver address. |

### getNrLoops

```solidity
function getNrLoops() external view returns (uint8)
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

