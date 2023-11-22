# Solidity API

## ISettings

### setMaxLoanToValue

```solidity
function setMaxLoanToValue(uint256 maxLoanToValue) external
```

### getMaxLoanToValue

```solidity
function getMaxLoanToValue() external view returns (uint256)
```

### setWithdrawalFee

```solidity
function setWithdrawalFee(uint256 fee) external
```

### getWithdrawalFee

```solidity
function getWithdrawalFee() external view returns (uint256)
```

### setLoanToValue

```solidity
function setLoanToValue(uint256 loanToValue) external
```

### getLoanToValue

```solidity
function getLoanToValue() external view returns (uint256)
```

### setPerformanceFee

```solidity
function setPerformanceFee(uint256 fee) external
```

### getPerformanceFee

```solidity
function getPerformanceFee() external view returns (uint256)
```

### setFeeReceiver

```solidity
function setFeeReceiver(address receiver) external
```

### getFeeReceiver

```solidity
function getFeeReceiver() external view returns (address)
```

### getNrLoops

```solidity
function getNrLoops() external view returns (uint8)
```

### setNrLoops

```solidity
function setNrLoops(uint8 nrLoops) external
```

### enableAccount

```solidity
function enableAccount(address account, bool enabled) external
```

### isAccountEnabled

```solidity
function isAccountEnabled(address account) external view returns (bool)
```

