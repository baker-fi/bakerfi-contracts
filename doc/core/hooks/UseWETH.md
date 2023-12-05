# Solidity API

## UseWETH

_Abstract contract to integrate the use of Wrapped Ether (WETH).
     Provides functions to initialize, access, and unwrap WETH._

### _initUseWETH

```solidity
function _initUseWETH(contract ServiceRegistry registry) internal
```

_Initializes the UseWETH contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| registry | contract ServiceRegistry | The address of the ServiceRegistry contract for accessing WETH. |

### wETH

```solidity
function wETH() public view returns (contract IWETH)
```

_Returns the IWETH interface._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | contract IWETH | The IWETH interface. |

### wETHA

```solidity
function wETHA() public view returns (address)
```

_Returns the address of the WETH contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the WETH contract. |

### _unwrapWETH

```solidity
function _unwrapWETH(uint256 wETHAmount) internal
```

_Unwraps a specified amount of WETH to Ether._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| wETHAmount | uint256 | The amount of WETH to unwrap. |

