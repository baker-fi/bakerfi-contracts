# Solidity API

## GovernableOwnable

### CallerNotTheGovernor

```solidity
error CallerNotTheGovernor()
```

### InvalidGovernorAddress

```solidity
error InvalidGovernorAddress()
```

### GovernshipTransferred

```solidity
event GovernshipTransferred(address previousGovernor, address newGovernor)
```

### _initializeGovernableOwnable

```solidity
function _initializeGovernableOwnable(address initialOwner, address initialGovernor) public
```

### onlyGovernor

```solidity
modifier onlyGovernor()
```

### governor

```solidity
function governor() public view virtual returns (address)
```

### transferGovernorship

```solidity
function transferGovernorship(address _newGovernor) public virtual
```

### _transferGovernorship

```solidity
function _transferGovernorship(address newGovernor) internal virtual
```

