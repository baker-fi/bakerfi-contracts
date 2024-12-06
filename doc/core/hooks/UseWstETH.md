# Solidity API

## UseWstETH

_Abstract contract to integrate the use of Wrapped stETH (WstETH).
     Provides functions to initialize, access to wstETH interface, unwrap, and wrap WstETH.

🚨 Class optimized to be included on upgradeable contracts_

### InvalidWstETHContract

```solidity
error InvalidWstETHContract()
```

### InvalidStETHContract

```solidity
error InvalidStETHContract()
```

### FailedToApproveWstAllowance

```solidity
error FailedToApproveWstAllowance()
```

### FailedToApproveStAllowance

```solidity
error FailedToApproveStAllowance()
```

### _initUseWstETH

```solidity
function _initUseWstETH(address iwstETH, address istETH) internal
```

Initialize function for upgradeable contracts

### wstETH

```solidity
function wstETH() internal view returns (contract IWStETH)
```

_Returns the IWStETH interface._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | contract IWStETH | The IWStETH interface. |

### wstETHA

```solidity
function wstETHA() internal view returns (address)
```

_Returns the address of the WstETH contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the WstETH contract. |

### _wrapWstETH

```solidity
function _wrapWstETH(uint256 amount) internal returns (uint256 amountOut)
```

_Wraps a specified amount of stETH to obtain wstETH._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of stETH to wrap. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The amount of WstETH obtained after wrapping. |

### _unwrapWstETH

```solidity
function _unwrapWstETH(uint256 amount) internal returns (uint256 stETHAmount)
```

_Unwraps a specified amount of wstETH to stETH._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of WstETH to unwrap. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| stETHAmount | uint256 | The amount of stETH obtained after unwrapping. |

