# Solidity API

## IVaultSettings

_The Settings contract have to implement this interface_

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

### MaxDepositChanged

```solidity
event MaxDepositChanged(uint256 value)
```

_Emitted when the Maximum Deposit ETH is changed_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The new amount that is allowed to be deposited |

### setWithdrawalFee

```solidity
function setWithdrawalFee(uint256 fee) external
```

_Sets the withdrawal fee percentage.
    *_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint256 | The new withdrawal fee percentage to be set. |

### getWithdrawalFee

```solidity
function getWithdrawalFee() external view returns (uint256)
```

_Retrieves the withdrawal fee percentage._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | fee The withdrawal fee percentage. |

### setPerformanceFee

```solidity
function setPerformanceFee(uint256 fee) external
```

_Sets the performance fee percentage._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| fee | uint256 | The new performance fee percentage to be set. |

### getPerformanceFee

```solidity
function getPerformanceFee() external view returns (uint256)
```

_Retrieves the performance fee percentage._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | fee The performance fee percentage. |

### setFeeReceiver

```solidity
function setFeeReceiver(address receiver) external
```

_Sets the fee receiver address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiver | address | The new fee receiver address to be set. |

### getFeeReceiver

```solidity
function getFeeReceiver() external view returns (address)
```

_Retrieves the fee receiver address._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | receiver The fee receiver address. |

### enableAccount

```solidity
function enableAccount(address account, bool enabled) external
```

_Enables or disables an account in the whitelist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account to be enabled or disabled. |
| enabled | bool | A boolean indicating whether the account should be enabled (true) or disabled (false) in the whitelist. |

### isAccountEnabled

```solidity
function isAccountEnabled(address account) external view returns (bool)
```

_Checks if an account is enabled in the whitelist._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | The address of the account to be checked. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | enabled A boolean indicating whether the account is enabled (true) or not (false) in the whitelist. |

### getMaxDeposit

```solidity
function getMaxDeposit() external view returns (uint256)
```

Retrieves the maximum deposit allowed in ETH.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The maximum deposit value in ETH. |

### setMaxDeposit

```solidity
function setMaxDeposit(uint256 value) external
```

Sets the maximum deposit allowed in ETH.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The maximum deposit value to be set in ETH. |

