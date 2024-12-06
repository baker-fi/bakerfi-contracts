# Solidity API

## UseWETH

_Abstract contract to integrate the use of Wrapped Ether (WETH).
     Provides functions to initialize, access, and unwrap WETH._

### InvalidWETHContract

```solidity
error InvalidWETHContract()
```

### FailedAllowance

```solidity
error FailedAllowance()
```

### InvalidWETHAmount

```solidity
error InvalidWETHAmount()
```

### InsufficientWETHBalance

```solidity
error InsufficientWETHBalance()
```

### ETHTransferNotAllowed

```solidity
error ETHTransferNotAllowed(address sender)
```

### _initUseWETH

```solidity
function _initUseWETH(address weth) internal
```

_Initializes the UseWETH contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| weth | address | The address of the VaultRegistry contract for accessing WETH. |

### receive

```solidity
receive() external payable virtual
```

_Fallback function to receive Ether.

This function is marked as external and payable. It is automatically called
when Ether is sent to the contract, such as during a regular transfer or as part
of a self-destruct operation.

Only Transfers from the strategy during the withdraw are allowed

Emits no events and allows the contract to accept Ether._

### wETH

```solidity
function wETH() internal view returns (contract IWETH)
```

_Returns the IWETH interface._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | contract IWETH | The IWETH interface. |

### wETHA

```solidity
function wETHA() internal view returns (address)
```

_Returns the address of the WETH contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the WETH contract. |

### unwrapETH

```solidity
function unwrapETH(uint256 wETHAmount) internal virtual
```

_Unwraps a specified amount of WETH to Ether._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| wETHAmount | uint256 | The amount of WETH to unwrap. |

### wrapETH

```solidity
function wrapETH(uint256 amount) internal virtual
```

## UseWETHMock

_This contract is abstract and cannot be deployed directly._

### initialize

```solidity
function initialize(address initialOwner) public
```

### test__unwrapETH

```solidity
function test__unwrapETH(uint256 wETHAmount) external
```

### test__wrapETH

```solidity
function test__wrapETH(uint256 amount) external
```

