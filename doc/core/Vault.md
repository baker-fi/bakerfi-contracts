# Solidity API

## Vault

_The BakerFi vault deployed to any supported chain (Arbitrum One, Optimism, Ethereum,...)

This is a smart contract where the users deposit their ETH or an ERC-20 and receive a share of the pool <x>brETH.
A share of the pool is an ERC-20 Token (transferable) and could be used to later withdraw their
owned amount of the pool that could contain (Assets + Yield). This vault could use a customized IStrategy
to deploy the capital and harvest a yield.

The Contract is able to charge a performance and withdraw fee that is sent to the treasury
owned account when the fees are set by the deploy owner.

The Vault is Pausable by the governor and is using the settings contract to retrieve base
performance, withdraw fees, and other kinds of settings.

During the beta phase, only whitelisted addresses are able to deposit and withdraw.

The Contract is upgradeable and can use a BakerProxy in front of it.

The Vault follows the ERC-4626 Specification and can be integrated by any Aggregator._

### _strategyAsset

```solidity
address _strategyAsset
```

_The address of the asset being managed by the strategy._

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address initialOwner, string tokenName, string tokenSymbol, address iAsset, contract IStrategy strategy, address weth) public
```

_Initializes the contract with specified parameters.

This function is designed to be called only once during the contract deployment.
It sets up the initial state of the contract, including ERC20 and ERC20Permit
initializations, ownership transfer, and configuration of the VaultRegistry
and Strategy._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address that will be set as the initial owner of the contract. |
| tokenName | string | The name of the token. |
| tokenSymbol | string | The symbol of the token. |
| iAsset | address | The address of the asset. |
| strategy | contract IStrategy | The IStrategy contract to be set as the strategy for this contract. |
| weth | address | The WETH contract to be set as the WETH for this contract. Emits an {OwnershipTransferred} event and initializes ERC20 and ERC20Permit features. It also ensures that the initialOwner is a valid address and sets up the VaultRegistry and Strategy for the contract. |

### _harvest

```solidity
function _harvest() internal virtual returns (int256 balanceChange)
```

_Function to rebalance the strategy, prevent a liquidation and pay fees
to the protocol by minting shares to the fee receiver.

This function is externally callable and is marked as non-reentrant.
It triggers the harvest operation on the strategy, calculates the balance change,
and applies performance fees if applicable._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in balance after the rebalance operation. |

### _afterHarvest

```solidity
function _afterHarvest() internal virtual
```

_Placeholder for any actions to be taken after harvesting_

### _deploy

```solidity
function _deploy(uint256 assets) internal virtual returns (uint256 deployedAmount)
```

_Deposits Ether into the contract and mints vault's shares for the specified receiver.

This function is externally callable, marked as non-reentrant, and could be restricted
to whitelisted addresses. It performs various checks, including verifying that
the deposited amount is valid, the Rebase state is initialized, and executes
the strategy's `deploy` function to handle the deposit._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to be deployed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deployedAmount | uint256 | The number of deployed assets. |

### _undeploy

```solidity
function _undeploy(uint256 assets) internal virtual returns (uint256 retAmount)
```

_Withdraws a specified number of vault's shares, converting them to ETH/ERC20 and
transferring to the caller.

This function is externally callable, marked as non-reentrant, and restricted to whitelisted addresses.
It checks for sufficient balance, non-zero share amount, and undeploys the capital from the strategy
to handle the withdrawal request. It calculates withdrawal fees, transfers Ether to the caller, and burns the
withdrawn shares._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The number of shares to be withdrawn. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| retAmount | uint256 | The amount of ETH/ERC20 withdrawn after fees. Emits a {Withdraw} event after successfully handling the withdrawal. |

### _totalAssets

```solidity
function _totalAssets() internal view virtual returns (uint256 amount)
```

_Retrieves the total assets controlled/belonging to the vault.

This function is publicly accessible and provides a view of the total assets currently
deployed in the current strategy. This function uses the latest prices
and does not revert on outdated prices._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The total assets under management by the strategy. |

### _asset

```solidity
function _asset() internal view virtual returns (address)
```

_Returns the address of the asset being managed by the vault._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the asset. |

