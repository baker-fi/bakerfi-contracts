# Solidity API

## StrategySupplyMorpho

A simple strategy that can deploy or undeploy assets to Morpho

### FailedToApproveAllowanceForMorpho

```solidity
error FailedToApproveAllowanceForMorpho()
```

### InvalidMorphoBlueContract

```solidity
error InvalidMorphoBlueContract()
```

### constructor

```solidity
constructor(address initialOwner, address asset_, address morphoBlue, Id morphoMarketId) public
```

_Reverts if the morphoBlue address is zero or if the Morpho contract is invalid._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the initial owner of the contract. |
| asset_ | address | The address of the asset to be managed. |
| morphoBlue | address | The address of the Morpho protocol contract. |
| morphoMarketId | Id | The market ID for the Morpho market. |

### _deploy

```solidity
function _deploy(uint256 amount) internal returns (uint256)
```

Deploys a specified amount of the managed asset to the Morpho protocol.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of the asset to be deployed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | deployedAmount The amount of the asset that was successfully deployed. |

### _undeploy

```solidity
function _undeploy(uint256 amount) internal returns (uint256)
```

Undeploys a specified amount of the managed asset from the Morpho protocol.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of the asset to be undeployed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | withdrawalValue The amount of the asset that was successfully undeployed. |

### _getBalance

```solidity
function _getBalance() internal view returns (uint256)
```

Retrieves the current balance of the managed asset in the Morpho protocol.

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current balance of the managed asset. |

