# Solidity API

## GovernableOwnable

_A Contract that could have an independent owner and governor

This is quite usesufull when you dont need to have more than 2 roles on a contract_

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
function _initializeGovernableOwnable(address initialOwner, address initialGovernor) internal
```

### onlyGovernor

```solidity
modifier onlyGovernor()
```

Modifier that checks if the caller is governor

### governor

```solidity
function governor() public view virtual returns (address)
```

Gets the Governor of the contrat

### transferGovernorship

```solidity
function transferGovernorship(address _newGovernor) public virtual
```

Changes the contract Governor

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newGovernor | address | the new Governor addres |

### _transferGovernorship

```solidity
function _transferGovernorship(address newGovernor) internal virtual
```

