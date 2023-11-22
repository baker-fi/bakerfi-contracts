# Solidity API

## Rebase

```solidity
struct Rebase {
  uint256 elastic;
  uint256 base;
}
```

## RebaseLibrary

### toBase

```solidity
function toBase(struct Rebase total, uint256 elastic, bool roundUp) internal pure returns (uint256 base)
```

Calculates the base value in relationship to `elastic` and `total`.

### toElastic

```solidity
function toElastic(struct Rebase total, uint256 base, bool roundUp) internal pure returns (uint256 elastic)
```

Calculates the elastic value in relationship to `base` and `total`.

## TestRebaseLibrary

### toBase

```solidity
function toBase(struct Rebase total, uint256 elastic, bool roundUp) public pure returns (uint256)
```

### toElastic

```solidity
function toElastic(struct Rebase total, uint256 base, bool roundUp) public pure returns (uint256 elastic)
```

