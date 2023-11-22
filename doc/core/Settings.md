# Solidity API

## Settings

The settings could only be Changed by the Owner and could be used by any contract 
by the system

### MaxLoanToValueChanged

```solidity
event MaxLoanToValueChanged(uint256 value)
```

### LoanToValueChanged

```solidity
event LoanToValueChanged(uint256 value)
```

### WithdrawalFeeChanged

```solidity
event WithdrawalFeeChanged(uint256 value)
```

### PerformanceFeeChanged

```solidity
event PerformanceFeeChanged(uint256 value)
```

### FeeReceiverChanged

```solidity
event FeeReceiverChanged(address value)
```

### NrLoopsChanged

```solidity
event NrLoopsChanged(uint256 value)
```

### AccountWhiteList

```solidity
event AccountWhiteList(address account, bool enabled)
```

### initialize

```solidity
function initialize(address initialOwner) public
```

### enableAccount

```solidity
function enableAccount(address account, bool enabled) external
```

### isAccountEnabled

```solidity
function isAccountEnabled(address account) external view returns (bool)
```

### setMaxLoanToValue

```solidity
function setMaxLoanToValue(uint256 maxLoanToValue) external
```

### getMaxLoanToValue

```solidity
function getMaxLoanToValue() external view returns (uint256)
```

### setLoanToValue

```solidity
function setLoanToValue(uint256 loanToValue) external
```

### getLoanToValue

```solidity
function getLoanToValue() external view returns (uint256)
```

### setWithdrawalFee

```solidity
function setWithdrawalFee(uint256 fee) external
```

### getWithdrawalFee

```solidity
function getWithdrawalFee() external view returns (uint256)
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

