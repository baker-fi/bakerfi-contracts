# Solidity API

## IVault

### deposit

```solidity
function deposit(address receiver) external payable virtual returns (uint256 shares)
```

### withdraw

```solidity
function withdraw(uint256 shares) external virtual returns (uint256 amount)
```

### totalAssets

```solidity
function totalAssets() public view virtual returns (uint256 amount)
```

### convertToShares

```solidity
function convertToShares(uint256 assets) external view virtual returns (uint256 shares)
```

### convertToAssets

```solidity
function convertToAssets(uint256 shares) external view virtual returns (uint256 assets)
```

### tokenPerETH

```solidity
function tokenPerETH() external view virtual returns (uint256)
```

### rebalance

```solidity
function rebalance() external virtual returns (int256 balanceChange)
```

