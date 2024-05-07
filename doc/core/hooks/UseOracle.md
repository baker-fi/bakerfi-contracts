# Solidity API

## UseOracle

### InvalidOracleContract

```solidity
error InvalidOracleContract()
```

### _initUseOracle

```solidity
function _initUseOracle(contract ServiceRegistry registry, bytes32 oracleName) internal
```

### oracle

```solidity
function oracle() public view returns (contract IOracle)
```

### getLastPrice

```solidity
function getLastPrice() public view returns (struct IOracle.Price)
```

