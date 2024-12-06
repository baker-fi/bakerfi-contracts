# Solidity API

## StrategyPark

A simple strategy that parks assets without generating yield,
only the owner can deploy or undeploy assets

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

### constructor

```solidity
constructor(address initialOwner, address asset_) public
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address |  |
| asset_ | address | The address of the asset to be managed |

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
function totalAssets() external view returns (uint256 assets)
```

_Retrieves the total owned assets by the Strategy in_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | The total owned assets in the strategy. |

### asset

```solidity
function asset() external view returns (address)
```

The Asset deployed on this strategy

