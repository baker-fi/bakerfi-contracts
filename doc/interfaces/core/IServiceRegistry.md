# Solidity API

## IServiceRegistry

### registerService

```solidity
function registerService(bytes32 serviceNameHash, address serviceAddress) external
```

### unregisterService

```solidity
function unregisterService(bytes32 serviceNameHash) external
```

### getServiceFromHash

```solidity
function getServiceFromHash(bytes32 serviceHash) external view returns (address)
```

### getService

```solidity
function getService(string serviceName) external view returns (address)
```

