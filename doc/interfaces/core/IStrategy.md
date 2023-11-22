# Solidity API

## IStrategy

### deploy

```solidity
function deploy() external payable returns (uint256 amountAdded)
```

Deploy

### harvest

```solidity
function harvest() external returns (int256 balanceChange)
```

### undeploy

```solidity
function undeploy(uint256 amount) external returns (uint256 actualAmount)
```

### deployed

```solidity
function deployed() external view returns (uint256 assets)
```

