# Solidity API

## UseOracle

### InvalidOracleContract

```solidity
error InvalidOracleContract()
```

### _initUseOracle

```solidity
function _initUseOracle(address oracleAddress) internal
```

### oracle

```solidity
function oracle() internal view returns (contract IOracle)
```

### getLastPrice

```solidity
function getLastPrice() internal view returns (struct IOracle.Price)
```

