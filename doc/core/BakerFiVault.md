# Solidity API

## BakerFiVault

BakerFi Vault
This pool allows a user to leverage their yield position and exposure 
using a recursive strategy based on flash loans and borrow markets.

### Deposit

```solidity
event Deposit(address depositor, address receiver, uint256 amount, uint256 shares)
```

### Withdraw

```solidity
event Withdraw(address owner, uint256 amount, uint256 shares)
```

### onlyWhiteListed

```solidity
modifier onlyWhiteListed()
```

### initialize

```solidity
function initialize(address initialOwner, contract ServiceRegistry registry, contract IStrategy strategy) public
```

Deploy The Vaults

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The owner of this contract that is able to change the settings |
| registry | contract ServiceRegistry | The Contract Registry address |
| strategy | contract IStrategy | The Strategy applied on this vault |

### rebalance

```solidity
function rebalance() external returns (int256 balanceChange)
```

Function to rebalance the strategy, prevent a liquidation and pay fees
to protocol by minting shares to the fee receiver

### receive

```solidity
receive() external payable
```

Function to receive ETH Payments from the strategy

### deposit

```solidity
function deposit(address receiver) external payable returns (uint256 shares)
```

Deposit msg.value ETH and leverage the position on the strategy
a number of shares are going to received by the receiver

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiver | address | The account that receives the shares minted |

### withdraw

```solidity
function withdraw(uint256 shares) external returns (uint256 amount)
```

Burn shares and receive the ETH unrolled to a receiver

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The amount of shares (mateETH) to be burned |

### totalAssets

```solidity
function totalAssets() public view returns (uint256 amount)
```

Total Assets that belong to the Share Holders

### convertToShares

```solidity
function convertToShares(uint256 assets) external view returns (uint256 shares)
```

Convert an Ammount of Assets to shares

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to convert |

### convertToAssets

```solidity
function convertToAssets(uint256 shares) external view returns (uint256 assets)
```

Convert a number of shares to the ETH value

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The amount of shares to be converted |

### tokenPerETH

```solidity
function tokenPerETH() external view returns (uint256)
```

The Value of a share per 1ETH

