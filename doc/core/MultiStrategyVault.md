# Solidity API

## MultiStrategyVault

_The BakerFi vault deployed to any supported chain (Arbitrum One, Optimism, Ethereum,...)

This is smart contract where the users deposit their ETH or an ERC-20 and receives a share of the pool <x>brETH.
A share of the pool is an ERC-20 Token (transferable) and could be used to later to withdraw their
owned amount of the pool that could contain (Assets + Yield). This vault could use a customized IStrategy
to deploy the capital and harvest an yield.

The Contract is able to charge a performance and withdraw fee that is send to the treasury
owned account when the fees are set by the deploy owner.

The Vault is Pausable by the the governor and is using the settings contract to retrieve base
performance, withdraw fees and other kind of settings.

During the beta phase only whitelisted addresses are able to deposit and withdraw

The Contract is upgradeable and can use a BakerProxy in front of.

The Vault follows the ERC-4626 Specification and can be integrated by any Aggregator_

### _strategyAsset

```solidity
address _strategyAsset
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address initialOwner, string tokenName, string tokenSymbol, address iAsset, contract IStrategy[] istrategies, uint16[] iweights, address weth) public
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
| iAsset | address | The asset to be set as the asset for this contract. |
| istrategies | contract IStrategy[] | The IStrategy contracts to be set as the strategies for this contract. |
| iweights | uint16[] | The weights of the strategies. |
| weth | address | The WETH contract to be set as the WETH for this contract. Emits an {OwnershipTransferred} event and initializes ERC20 and ERC20Permit features. It also ensures that the initialOwner is a valid address and sets up the VaultRegistry and Strategy for the contract. |

### _harvest

```solidity
function _harvest() internal virtual returns (int256 balanceChange)
```

_Harvests the yield from the strategies.

This function calls the internal _harvestStrategies function to collect yield
from all strategies and returns the balance change._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in balance after harvesting. |

### _afterHarvest

```solidity
function _afterHarvest() internal virtual
```

_Executes actions after harvesting.

This function is called after the harvest process to rebalance the strategies._

### _deploy

```solidity
function _deploy(uint256 assets) internal virtual returns (uint256 deployedAmount)
```

_Deploys assets to the strategies.

This function allocates the specified amount of assets to the strategies
and returns the amount that was deployed._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to deploy. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deployedAmount | uint256 | The amount of assets that were successfully deployed. |

### _undeploy

```solidity
function _undeploy(uint256 assets) internal virtual returns (uint256 undeployedAmount)
```

_Undeploys assets from the strategies.

This function deallocates the specified amount of assets from the strategies
and returns the amount that was undeployed._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The amount of assets to undeploy. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| undeployedAmount | uint256 | The amount of assets that were successfully undeployed. |

### _totalAssets

```solidity
function _totalAssets() internal view virtual returns (uint256 assets)
```

_Calculates the total assets managed by the vault.

This function overrides the totalAssets function from both VaultBase and MultiStrategy
to return the total assets managed by the strategies._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The total assets managed by the vault. |

### _asset

```solidity
function _asset() internal view virtual returns (address)
```

_Returns the address of the asset being managed by the vault._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the asset. |

