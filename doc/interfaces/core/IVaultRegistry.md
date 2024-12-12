# Solidity API

## IVaultRegistry

### ServiceUnregistered

```solidity
event ServiceUnregistered(bytes32 nameHash)
```

_Emitted when a service is unregistered from the VaultRegistry.

This event provides the name hash of the unregistered service._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| nameHash | bytes32 | The hash of the name of the unregistered service. |

### ServiceRegistered

```solidity
event ServiceRegistered(bytes32 nameHash, address service)
```

_Emitted when a service is registered in the VaultRegistry.

This event provides the name hash of the registered service and its address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| nameHash | bytes32 | The hash of the name of the registered service. |
| service | address | The address of the registered service. |

### registerService

```solidity
function registerService(bytes32 serviceNameHash, address serviceAddress) external
```

_Registers a new service in the VaultRegistry._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceNameHash | bytes32 | The hash of the name of the service to be registered. |
| serviceAddress | address | The address of the service to be registered. |

### unregisterService

```solidity
function unregisterService(bytes32 serviceNameHash) external
```

_Unregisters an existing service from the VaultRegistry._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceNameHash | bytes32 | The hash of the name of the service to be unregistered. |

### getServiceFromHash

```solidity
function getServiceFromHash(bytes32 serviceHash) external view returns (address)
```

_Retrieves the address of a registered service by its name hash._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceHash | bytes32 | The keccak256 hash of the service name for which the address is to be retrieved. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | serviceAddress The address of the registered service. |

### getService

```solidity
function getService(string serviceName) external view returns (address)
```

_Retrieves the address of a registered service by its name._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceName | string | The name of the service for which the address is to be retrieved. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | serviceAddress The address of the registered service. |

