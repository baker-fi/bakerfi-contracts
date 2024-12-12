# Solidity API

## FLASH_LENDER_CONTRACT

```solidity
bytes32 FLASH_LENDER_CONTRACT
```

## AAVE_V3_CONTRACT

```solidity
bytes32 AAVE_V3_CONTRACT
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

## UNISWAP_QUOTER_CONTRACT

```solidity
bytes32 UNISWAP_QUOTER_CONTRACT
```

## STRATEGY_CONTRACT

```solidity
bytes32 STRATEGY_CONTRACT
```

## MORPHO_BLUE_CONTRACT

```solidity
bytes32 MORPHO_BLUE_CONTRACT
```

## VAULT_ROUTER_CONTRACT

```solidity
bytes32 VAULT_ROUTER_CONTRACT
```

## PYTH_CONTRACT

```solidity
bytes32 PYTH_CONTRACT
```

## VaultRegistry

Vault registry that could be used resolve a service address with the
name of the service.

This contract inherits from the `Ownable` contract and implements the `IVaultRegistry` interface.
It serves as a registry for managing various services and dependencies within BakerFI System.

### InvalidOwner

```solidity
error InvalidOwner()
```

### ServiceAlreadySet

```solidity
error ServiceAlreadySet()
```

### ServiceUnknown

```solidity
error ServiceUnknown()
```

### constructor

```solidity
constructor(address ownerToSet) public
```

_Constructor for the VaultRegistry contract.

It sets the initial owner of the contract and emits an {OwnershipTransferred} event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| ownerToSet | address | The address to be set as the initial owner of the contract. |

### registerService

```solidity
function registerService(bytes32 serviceNameHash, address serviceAddress) external
```

_Registers a new service in the VaultRegistry.

This function can only be called by the owner of the contract.
It associates the specified service name hash with its corresponding address in the _services mapping.
Emits a {ServiceRegistered} event upon successful registration._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceNameHash | bytes32 | The hash of the name of the service to be registered. |
| serviceAddress | address | The address of the service to be registered. Requirements: - The service with the specified name hash must not be already registered. |

### unregisterService

```solidity
function unregisterService(bytes32 serviceNameHash) external
```

_Unregisters an existing service from the VaultRegistry.

This function can only be called by the owner of the contract.
It disassociates the specified service name hash from its corresponding address in the _services mapping.
Emits a {ServiceUnregistered} event upon successful unregistration._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceNameHash | bytes32 | The hash of the name of the service to be unregistered. Requirements: - The service with the specified name hash must exist. |

### getServiceNameHash

```solidity
function getServiceNameHash(string name) external pure returns (bytes32)
```

_Computes the name hash for a given service name.

This function is externally callable and returns the keccak256 hash of the provided service name._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | The name of the service for which the name hash is to be computed. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | serviceNameHash The keccak256 hash of the provided service name. |

### getService

```solidity
function getService(string serviceName) external view returns (address)
```

_Retrieves the address of a registered service by its name.

This function is externally callable and returns the address associated with the specified service name._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceName | string | The name of the service for which the address is to be retrieved. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | serviceAddress The address of the registered service. |

### getServiceFromHash

```solidity
function getServiceFromHash(bytes32 serviceHash) external view returns (address)
```

_Retrieves the address of a registered service by its name hash.

This function is externally callable and returns the address associated with the specified service name hash._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| serviceHash | bytes32 | The keccak256 hash of the service name for which the address is to be retrieved. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | serviceAddress The address of the registered service. |

