# Solidity API

## StrategySupplyAAVEv3

A simple strategy that can deploy or undeploy assets to AAVEv3

### constructor

```solidity
constructor(address initialOwner, address asset_, address aavev3Address) public
```

_Reverts if the morphoBlue address is zero_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the initial owner of the contract. |
| asset_ | address | The address of the asset to be managed |
| aavev3Address | address | The address of AAVEV3 Address |

### _deploy

```solidity
function _deploy(uint256 amount) internal virtual returns (uint256)
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
function _undeploy(uint256 amount) internal virtual returns (uint256 undeployedAmount)
```

Undeploys a specified amount of the managed asset from the lending pool.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of the asset to be undeployed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| undeployedAmount | uint256 | The amount of the asset that was successfully undeployed. |

### _getBalance

```solidity
function _getBalance() internal view virtual returns (uint256)
```

Get the Current Balance on AAVEv3

_!Important: No Conversion to USD Done_

