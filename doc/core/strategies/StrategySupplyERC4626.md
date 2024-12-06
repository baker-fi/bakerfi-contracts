# Solidity API

## StrategySupplyERC4626

A strategy that can deploy or undeploy assets to an ERC4626 vault

### InvalidVault

```solidity
error InvalidVault()
```

### constructor

```solidity
constructor(address initialOwner, address asset_, address vault_) public
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address that will own the strategy |
| asset_ | address | The address of the asset to be managed |
| vault_ | address | The address of the ERC4626 vault |

### _deploy

```solidity
function _deploy(uint256 amount) internal returns (uint256)
```

Deploys a specified amount of the managed asset to the lending pool.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of the asset to be deployed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of the asset that was successfully deployed. |

### _undeploy

```solidity
function _undeploy(uint256 amount) internal returns (uint256)
```

Undeploys a specified amount of the managed asset from the lending pool.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of the asset to be undeployed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of the asset that was successfully undeployed. |

### _getBalance

```solidity
function _getBalance() internal view returns (uint256)
```

Retrieves the current balance of the managed asset in the lending pool.

_This function does not perform any conversion to USD._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current balance of the managed asset. |

