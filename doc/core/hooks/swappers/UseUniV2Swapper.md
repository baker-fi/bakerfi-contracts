# Solidity API

## UseUniV2Swapper

_Abstract contract to integrate the use of Uniswap V2
     Provides functions to initialize, access and swap
     It allows any contract to swap an ERC-20 for another ERC-20 with a fixed
     input amount or a fixed output amount of tokens._

### InvalidV2RouterContract

```solidity
error InvalidV2RouterContract()
```

### FailedToApproveAllowance

```solidity
error FailedToApproveAllowance()
```

### _initUseUniV2Swapper

```solidity
function _initUseUniV2Swapper(contract IUniswapV2Router02 iV2UniRouter) internal
```

_Initialize the Uniswap V2 Swapper_

### v2UniRouter

```solidity
function v2UniRouter() internal view returns (contract IUniswapV2Router02)
```

Returns the Uniswap V2 Router from the storage slot

### swap

```solidity
function swap(struct ISwapHandler.SwapParams params) internal virtual returns (uint256 amountIn, uint256 amountOut)
```

Executes a token swap on Uniswap V2 using the Uniswap V2 Router

_This function allows for two types of swaps:
     - Exact Input: The user specifies the amount of input tokens to swap, and the function calculates
       the minimum amount of output tokens to receive.
     - Exact Output: The user specifies the desired amount of output tokens, and the function calculates
       the maximum amount of input tokens that can be used for the swap.

Reverts if:
     - The input or output token address is invalid.
     - The swap fails (i.e., the output amount is zero)._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | A struct containing the parameters for the swap, including:        - underlyingIn: The address of the token being sold.        - underlyingOut: The address of the token being bought.        - mode: The type of swap (0 for exact input, 1 for exact output).        - amountIn: The amount of the input token to sell (exact value for exact input, maximum for exact output).        - amountOut: The amount of the output token to buy (exact value for exact output, minimum for exact input). |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The actual amount of input tokens used in the swap. |
| amountOut | uint256 | The actual amount of output tokens received from the swap. |

### _allowRouterSpend

```solidity
function _allowRouterSpend(contract IERC20 token, uint256 amount) internal virtual
```

_Allow the router to spend the input token_

## UseUniV2SwapperMock

_Mock contract to test the UseUniV2Swapper_

### constructor

```solidity
constructor(contract IUniswapV2Router02 iV2UniRouter) public
```

_Initialize the UseUniV2SwapperMock_

### test__swap

```solidity
function test__swap(struct ISwapHandler.SwapParams params) external returns (uint256 amountIn, uint256 amountOut)
```

Mock function to test the swap function

