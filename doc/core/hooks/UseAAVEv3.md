# Solidity API

## UseAAVEv3

_Abstract contract to integrate the use of AAVE v3 (Aave Protocol V2).
     Provides functions to initialize, access, supply, and borrow assets._

### InvalidAAVEv3Contract

```solidity
error InvalidAAVEv3Contract()
```

### FailedToApproveAllowance

```solidity
error FailedToApproveAllowance()
```

### FailedToRepayDebt

```solidity
error FailedToRepayDebt()
```

### _initUseAAVEv3

```solidity
function _initUseAAVEv3(contract ServiceRegistry registry) internal
```

_Initializes the UseAAVEv3 contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| registry | contract ServiceRegistry | The address of the ServiceRegistry contract for accessing AAVE v3. |

### aaveV3

```solidity
function aaveV3() public view returns (contract IPoolV3)
```

_Returns the IPoolV3 interface._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | contract IPoolV3 | The IPoolV3 interface. |

### aaveV3A

```solidity
function aaveV3A() public view returns (address)
```

_Returns the address of the AAVE v3 contract._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The address of the AAVE v3 contract. |

### _supplyAndBorrow

```solidity
function _supplyAndBorrow(address assetIn, uint256 amountIn, address assetOut, uint256 borrowOut) internal
```

_Supplies an asset and borrows another asset from AAVE v3._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assetIn | address | The address of the asset to supply. |
| amountIn | uint256 | The amount of the asset to supply. |
| assetOut | address | The address of the asset to borrow. |
| borrowOut | uint256 | The amount of the asset to borrow. |

### _repay

```solidity
function _repay(address assetIn, uint256 amount) internal
```

_Repays a borrowed asset on AAVE v3._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assetIn | address | The address of the borrowed asset to repay. |
| amount | uint256 | The amount of the borrowed asset to repay. |

