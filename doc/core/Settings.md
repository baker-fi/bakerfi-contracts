# Solidity API

## Settings

The settings could only be changed by the Owner and could be used by any contract by the system.

_The `Settings` contract is used to manage protocol settings.
It extends the `OwnableUpgradeable` contract and implements the `ISettings` interface.
The settings can only be changed by the owner and can be utilized by any contract within the system.

This contract is going to be used by any service on the Bakerfi system to retrieve
the fees, basic configuration parameters and the list of whitelisted adresess that can
interact with the system_


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **Settings** | Implementation | Ownable2StepUpgradeable, ISettings |||
| └ | <Constructor> | Public ❗️ | 🛑  |NO❗️ |
| └ | initialize | Public ❗️ | 🛑  | initializer |
| └ | enableAccount | External ❗️ | 🛑  | onlyOwner |
| └ | isAccountEnabled | External ❗️ |   |NO❗️ |
| └ | setWithdrawalFee | External ❗️ | 🛑  | onlyOwner |
| └ | getWithdrawalFee | External ❗️ |   |NO❗️ |
| └ | setPerformanceFee | External ❗️ | 🛑  | onlyOwner |
| └ | getPerformanceFee | External ❗️ |   |NO❗️ |
| └ | setFeeReceiver | External ❗️ | 🛑  | onlyOwner |
| └ | getFeeReceiver | External ❗️ |   |NO❗️ |
| └ | getMaxDepositInETH | External ❗️ |   |NO❗️ |
| └ | setMaxDepositInETH | External ❗️ | 🛑  | onlyOwner |
| └ | setRebalancePriceMaxAge | External ❗️ | 🛑  | onlyOwner |
| └ | getRebalancePriceMaxAge | External ❗️ |   |NO❗️ |
| └ | setPriceMaxAge | External ❗️ | 🛑  | onlyOwner |
| └ | getPriceMaxAge | External ❗️ |   |NO❗️ |


 Legend

|  Symbol  |  Meaning  |
|:--------:|-----------|
|    🛑    | Function can modify state |
|    💵    | Function is payable |


### InvalidOwner

```solidity
error InvalidOwner()
```

### WhiteListAlreadyEnabled

```solidity
error WhiteListAlreadyEnabled()
```

### WhiteListFailedToAdd

```solidity
error WhiteListFailedToAdd()
```

### WhiteListNotEnabled

```solidity
error WhiteListNotEnabled()
```

### WhiteListFailedToRemove

```solidity
error WhiteListFailedToRemove()
```

### InvalidValue

```solidity
error InvalidValue()
```

### InvalidPercentage

```solidity
error InvalidPercentage()
```

### InvalidMaxLoanToValue

```solidity
error InvalidMaxLoanToValue()
```

### InvalidAddress

```solidity
error InvalidAddress()
```

### InvalidLoopCount

```solidity
error InvalidLoopCount()
```

### constructor

```solidity
constructor() public
```

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

### getMaxDepositInETH

```solidity
function getMaxDepositInETH() external view returns (uint256)
```

### setMaxDepositInETH

```solidity
function setMaxDepositInETH(uint256 value) external
```

### setRebalancePriceMaxAge

```solidity
function setRebalancePriceMaxAge(uint256 value) external
```

### getRebalancePriceMaxAge

```solidity
function getRebalancePriceMaxAge() external view returns (uint256)
```

### setPriceMaxAge

```solidity
function setPriceMaxAge(uint256 value) external
```

### getPriceMaxAge

```solidity
function getPriceMaxAge() external view returns (uint256)
```

