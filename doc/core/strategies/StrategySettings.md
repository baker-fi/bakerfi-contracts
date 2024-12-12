# Solidity API

## StrategySettings

The settings could only be changed by the Owner and could be used by any contract by the system.

_The `Settings` contract is used to manage protocol settings.
It extends the `OwnableUpgradeable` contract and implements the `ISettings` interface.
The settings can only be changed by the owner and can be utilized by any contract within the system.

This contract is going to be used by any service on the Bakerfi system to retrieve
the fees, basic configuration parameters and the list of whitelisted adresess that can
interact with the system_

### InvalidOwner

```solidity
error InvalidOwner()
```

### InvalidValue

```solidity
error InvalidValue()
```

### InvalidPercentage

```solidity
error InvalidPercentage()
```

### InvalidAddress

```solidity
error InvalidAddress()
```

### constructor

```solidity
constructor() internal
```

### _initializeStrategySettings

```solidity
function _initializeStrategySettings() internal
```

_Initializes the contract.

This function is used for the initial setup of the contract, setting the owner, withdrawal fee,
performance fee, fee receiver, loan-to-value ratio, maximum loan-to-value ratio, and the number of loops.

Requirements:
- The provided owner address must not be the zero address._

### setPriceMaxAge

```solidity
function setPriceMaxAge(uint256 value) external
```

Sets the max age for price retrievals
Sets the maximum age of the price data.

_Setting the maxAge to 0 is quite dangerous and the protocol could be working
with stale prices_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The maximum age in seconds. |

### getPriceMaxAge

```solidity
function getPriceMaxAge() public view returns (uint256)
```

Retrieves the maximum age of the price data.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The maximum age in seconds. |

### setPriceMaxConf

```solidity
function setPriceMaxConf(uint256 value) external
```

Sets the maximum confidence level for the price data in percentage

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| value | uint256 | The maximum confidence level. |

### getPriceMaxConf

```solidity
function getPriceMaxConf() public view returns (uint256)
```

Retrieves the maximum confidence level for the price data.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The maximum confidence level. |

