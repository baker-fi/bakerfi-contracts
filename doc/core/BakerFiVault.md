# Solidity API

## Vault

_The BakerFi vault deployed to any supported chain (Arbitrum One, Optimism, Ethereum,...)

This is smart contract where the users deposit their ETH and receives a share of the pool <x>brETH. 
A share of the pool is an ERC-20 Token (transferable) and could be used to later to withdraw their 
owned amount of the pool that could contain (Assets + Yield ). This vault could use a customized IStrategy 
to deploy the capital and harvest an yield.

The Contract is able to charge a performance and withdraw fee that is send to the treasury 
owned account when the fees are set by the deploy owner.

The Vault is Pausable by the the governor and is using the settings contract to retrieve base 
performance, withdraw fees and other kind of settings.

During the beta phase only whitelisted addresses are able to deposit and withdraw
 
The Contract is upgradable and can use a BakerProxy in front of._

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

### onlyWhiteListed

```solidity
modifier onlyWhiteListed()
```

_Modifier to restrict access to addresses that are whitelisted.

This modifier ensures that only addresses listed in the account whitelist
within the contract's settings are allowed to proceed with the function call.
If the caller's address is not whitelisted, the function call will be rejected._

### initialize

```solidity
function initialize(address initialOwner, contract ServiceRegistry registry, contract IStrategy strategy) public
```

_Initializes the contract with specified parameters.

This function is designed to be called only once during the contract deployment.
It sets up the initial state of the contract, including ERC20 and ERC20Permit
initializations, ownership transfer, and configuration of the ServiceRegistry
and Strategy._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address that will be set as the initial owner of the contract. |
| registry | contract ServiceRegistry | The ServiceRegistry contract to be associated with this contract. |
| strategy | contract IStrategy | The IStrategy contract to be set as the strategy for this contract. Emits an {OwnershipTransferred} event and initializes ERC20 and ERC20Permit features. It also ensures that the initialOwner is a valid address and sets up the ServiceRegistry and Strategy for the contract. |

### rebalance

```solidity
function rebalance() external returns (int256 balanceChange)
```

_Function to rebalance the strategy, prevent a liquidation and pay fees
to protocol by minting shares to the fee receiver

This function is externally callable and is marked as non-reentrant.
It triggers the harvest operation on the strategy, calculates the balance change,
and applies performance fees if applicable._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in balance after the rebalance operation. |

### receive

```solidity
receive() external payable
```

_Fallback function to receive Ether.

This function is marked as external and payable. It is automatically called
when Ether is sent to the contract, such as during a regular transfer or as part
of a self-destruct operation.

Emits no events and allows the contract to accept Ether._

### deposit

```solidity
function deposit(address receiver) external payable returns (uint256 shares)
```

_Deposits Ether into the contract and mints vault's shares for the specified receiver.

This function is externally callable, marked as non-reentrant, and restricted
to whitelisted addresses. It performs various checks, including verifying that
the deposited amount is valid, the Rebase state is initialized, and executes
the strategy's `deploy` function to handle the deposit._

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
function withdraw(uint256 shares) external returns (uint256 amount)
```

_Withdraws a specified number of vault's shares, converting them to ETH and 
transferring to the caller.

This function is externally callable, marked as non-reentrant, and restricted to whitelisted addresses.
It checks for sufficient balance, non-zero share amount, and undeploy the capital from the strategy 
to handle the withdrawal request. It calculates withdrawal fees, transfers Ether to the caller, and burns the
withdrawn shares._

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
function totalAssets() public view returns (uint256 amount)
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
function convertToShares(uint256 assets) external view returns (uint256 shares)
```

_Converts the specified amount of ETH to shares.

This function is externally callable and provides a view of the number of shares that
would be equivalent to the given amount of assets based on the current Vault and Strategy state._

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
function convertToAssets(uint256 shares) external view returns (uint256 assets)
```

_Converts the specified number of shares to ETH.

This function is externally callable and provides a view of the amount of assets that
would be equivalent to the given number of shares based on the current Rebase state._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | The number of shares to be converted to assets. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The calculated amount of assets. |

### tokenPerETH

```solidity
function tokenPerETH() external view returns (uint256)
```

_Retrieves the token-to-ETH exchange rate.

This function is externally callable and provides a view of the current exchange rate
between the token and ETH. It calculates the rate based on the total supply of the token
and the total assets under management by the strategy._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | rate The calculated token-to-ETH exchange rate. |

