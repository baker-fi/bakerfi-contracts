# Solidity API

## IVault

### Deposit

```solidity
event Deposit(address depositor, address receiver, uint256 amount, uint256 shares)
```

_Emitted when a ETH deposit is made to the contract.

This event provides information about the depositor, receiver, deposited amount,
and the corresponding number of shares minted as a result of the deposit._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| depositor | address | The address initiating the deposit. |
| receiver | address | The address receiving the minted shares. |
| amount | uint256 | The amount of Ether deposited. |
| shares | uint256 | The number of shares minted for the deposit. |

### Withdraw

```solidity
event Withdraw(address owner, uint256 amount, uint256 shares)
```

_Emitted when a withdrawal is made from the contract.

This event provides information about the owner initiating the withdrawal, the withdrawn amount,
and the corresponding number of shares burned as a result of the withdrawal._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | The address initiating the withdrawal. |
| amount | uint256 | The amount of Ether withdrawn after fees. |
| shares | uint256 | The number of shares burned for the withdrawal. |

### deposit

```solidity
function deposit(address receiver) external payable virtual returns (uint256 shares)
```

_Deposits Ether into the contract and mints vault's shares for the specified receiver._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiver | address | The address to receive the minted shares. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares minted for the specified receiver. |

### withdraw

```solidity
function withdraw(uint256 shares) external virtual returns (uint256 amount)
```

_Withdraws a specified number of vault's shares, converting them to ETH and
transferring to the caller._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares to be withdrawn. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of Ether withdrawn after fees. Emits a {Withdraw} event after successfully handling the withdrawal. |

### totalAssets

```solidity
function totalAssets() public view virtual returns (uint256 amount)
```

_Retrieves the total assets controlled/belonging to the vault

This function is publicly accessible and provides a view of the total assets currently
deployed in the current strategy._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The total assets under management by the strategy. |

### convertToShares

```solidity
function convertToShares(uint256 assets) external view virtual returns (uint256 shares)
```

_Converts the specified amount of ETH to shares._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to be converted to shares. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The calculated number of shares. |

### convertToAssets

```solidity
function convertToAssets(uint256 shares) external view virtual returns (uint256 assets)
```

_Converts the specified number of shares to ETH._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares to be converted to assets. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The calculated amount of assets. |

### tokenPerAsset

```solidity
function tokenPerAsset() external view virtual returns (uint256 rate)
```

_Retrieves the token-to-ETH exchange rate._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| rate | uint256 | The calculated token-to-ETH exchange rate. |

### rebalance

```solidity
function rebalance() external virtual returns (int256 balanceChange)
```

_Function to rebalance the strategy, prevent a liquidation and pay fees
to protocol by minting shares to the fee receiver_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in balance after the rebalance operation. |

