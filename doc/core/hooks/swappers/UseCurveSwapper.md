# Solidity API

## UseCurveSwapper

_Abstract contract to integrate Curve Finance NG for token swaps
     Provides functions to initialize, access and swap tokens using Curve NG Router
     It allows any contract to swap an ERC-20 for another ERC-20 with either
     a fixed input amount or a fixed output amount of tokens.
     The Curve NG Router is used for the swap to stableswap pools, metapools and crypto pools_

### InvalidCurveRouterContract

```solidity
error InvalidCurveRouterContract()
```

### FailedToApproveAllowance

```solidity
error FailedToApproveAllowance()
```

### _CURVE_ROUTER_SLOT

```solidity
bytes32 _CURVE_ROUTER_SLOT
```

_Storage slot for the Curve Router NG contract
keccak256("xyz.bakerfi.UseCurveSwapper.curveRouterNG")_

### ETH_ADDRESS

```solidity
address ETH_ADDRESS
```

### _initUseCurveSwapper

```solidity
function _initUseCurveSwapper(contract ICurveRouterNG icurveRouterNG) internal
```

### curveRouter

```solidity
function curveRouter() public view returns (contract ICurveRouterNG)
```

_Returns the Curve Router contract_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | contract ICurveRouterNG | The Curve Router contract |

### curveRouterA

```solidity
function curveRouterA() internal view returns (address)
```

_Returns the Curve Router contract address_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | The Curve Router contract address |

### _allowRouterSpend

```solidity
function _allowRouterSpend(contract IERC20 token, uint256 amount) internal virtual
```

_Approves the Curve Router contract to spend the specified amount of tokens_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The token to approve |
| amount | uint256 | The amount of tokens to approve |

### swap

```solidity
function swap(struct ISwapHandler.SwapParams params) internal virtual returns (uint256 amountIn, uint256 amountOut)
```

Execute a trade on the swap handler

_Executes a token swap using the Curve Router._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | struct defining the requested trade |

## UseCurveSwapperMock

_Mock contract for testing the UseCurveSwapper contract_

### constructor

```solidity
constructor(contract ICurveRouterNG icurveRouterNG) public
```

### test__swap

```solidity
function test__swap(struct ISwapHandler.SwapParams params) external payable returns (uint256, uint256)
```

_Mock function for testing the swap function_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | The swap parameters |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | amountIn The actual amount of input tokens used in the swap |
| [1] | uint256 | amountOut The actual amount of output tokens received from the swap |

