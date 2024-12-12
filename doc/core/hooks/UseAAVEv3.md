# Solidity API

## UseAAVEv3

_Abstract contract to integrate the use of AAVE v3 (Aave Protocol V2).
     Provides functions to initialize, access, supply, and borrow assets._

### InvalidAAVEv3Contract

```solidity
error InvalidAAVEv3Contract()
```

### _initUseAAVEv3

```solidity
function _initUseAAVEv3(address aaveV3Pool) internal
```

_Initializes the UseAAVEv3 contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| aaveV3Pool | address | The address of the AAVE v3 contract. |

### aaveV3

```solidity
function aaveV3() internal view returns (contract IPoolV3)
```

_Returns the IPoolV3 interface._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | contract IPoolV3 | The IPoolV3 interface. |

### aaveV3A

```solidity
function aaveV3A() internal view returns (address)
```

_Returns the address of the AAVE v3 contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the AAVE v3 contract. |

