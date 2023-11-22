# Solidity API

## FLASH_LENDER_CONTRACT

```solidity
bytes32 FLASH_LENDER_CONTRACT
```

## WETH_CONTRACT

```solidity
bytes32 WETH_CONTRACT
```

## ST_ETH_CONTRACT

```solidity
bytes32 ST_ETH_CONTRACT
```

## WST_ETH_CONTRACT

```solidity
bytes32 WST_ETH_CONTRACT
```

## AAVE_V3_CONTRACT

```solidity
bytes32 AAVE_V3_CONTRACT
```

## WSTETH_ETH_ORACLE_CONTRACT

```solidity
bytes32 WSTETH_ETH_ORACLE_CONTRACT
```

## CBETH_ETH_ORACLE_CONTRACT

```solidity
bytes32 CBETH_ETH_ORACLE_CONTRACT
```

## ETH_USD_ORACLE_CONTRACT

```solidity
bytes32 ETH_USD_ORACLE_CONTRACT
```

## CBETH_ERC20_CONTRACT

```solidity
bytes32 CBETH_ERC20_CONTRACT
```

## UNISWAP_ROUTER_CONTRACT

```solidity
bytes32 UNISWAP_ROUTER_CONTRACT
```

## SWAPPER_HANDLER_CONTRACT

```solidity
bytes32 SWAPPER_HANDLER_CONTRACT
```

## BALANCER_VAULT_CONTRACT

```solidity
bytes32 BALANCER_VAULT_CONTRACT
```

## SETTINGS_CONTRACT

```solidity
bytes32 SETTINGS_CONTRACT
```

## UNISWAP_QUOTER_CONTRACT

```solidity
bytes32 UNISWAP_QUOTER_CONTRACT
```

## STRATEGY_CONTRACT

```solidity
bytes32 STRATEGY_CONTRACT
```

## ServiceRegistry

### ServiceUnregistered

```solidity
event ServiceUnregistered(bytes32 nameHash)
```

### ServiceRegistered

```solidity
event ServiceRegistered(bytes32 nameHash, address service)
```

### constructor

```solidity
constructor(address ownerToSet) public
```

### registerService

```solidity
function registerService(bytes32 serviceNameHash, address serviceAddress) external
```

Register a Service contrat

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceNameHash | bytes32 | Service Name's Keccak256 |
| serviceAddress | address | Contract Address |

### unregisterService

```solidity
function unregisterService(bytes32 serviceNameHash) external
```

Unregister a service name

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceNameHash | bytes32 | Service Name keccak256 |

### getServiceNameHash

```solidity
function getServiceNameHash(string name) external pure returns (bytes32)
```

Gets the Contract address for the service name provided

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | Service Name |

### getService

```solidity
function getService(string serviceName) external view returns (address)
```

### getServiceFromHash

```solidity
function getServiceFromHash(bytes32 serviceHash) external view returns (address)
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceHash | bytes32 | Service Name keccak256 |

