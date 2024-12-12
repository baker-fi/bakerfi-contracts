# Solidity API

## StrategySupplyBase

A simple strategy that can deploy or undeploy assets to a lending pool

### FailedToApproveAllowanceForAAVE

```solidity
error FailedToApproveAllowanceForAAVE()
```

### ZeroAddress

```solidity
error ZeroAddress()
```

### ZeroAmount

```solidity
error ZeroAmount()
```

### InsufficientBalance

```solidity
error InsufficientBalance()
```

### WithdrawalValueMismatch

```solidity
error WithdrawalValueMismatch()
```

### _asset

```solidity
address _asset
```

### constructor

```solidity
constructor(address initialOwner, address asset_) internal
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address |  |
| asset_ | address | The address of the asset to be managed |

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
function _undeploy(uint256 amount) internal virtual returns (uint256)
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
function _getBalance() internal view virtual returns (uint256)
```

Retrieves the current balance of the managed asset in the lending pool.

_This function does not perform any conversion to USD._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The current balance of the managed asset. |

### deploy

```solidity
function deploy(uint256 amount) external returns (uint256 deployedAmount)
```

_Deploys funds in the AAVEv3 strategy_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deployedAmount | uint256 | The amount deployed in the AAVEv3 strategy after leveraging. |

### harvest

```solidity
function harvest() external returns (int256 balanceChange)
```

Harvests the strategy by yield and rebalances the strategy

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in strategy balance as an int256 value. |

### undeploy

```solidity
function undeploy(uint256 amount) external returns (uint256 undeployedAmount)
```

_Initiates the undeployment process by adjusting the contract's position and performing a flash loan._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of ETH to undeploy. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| undeployedAmount | uint256 | The actual undeployed amount of ETH. |

### totalAssets

```solidity
function totalAssets() external view returns (uint256)
```

_Retrieves the total owned assets by the Strategy in_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 |  |

### asset

```solidity
function asset() external view returns (address)
```

The Asset deployed on this strategy

### getBalance

```solidity
function getBalance() public view virtual returns (uint256)
```

Get the Current Balance on AAVEv3

_!Important: No Conversion to USD Done_

