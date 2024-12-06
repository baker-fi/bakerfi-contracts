# Solidity API

## UseUniV3Swapper

_Abstract contract to integrate the use of Uniswap V3
     Provides functions to initialize, access and swap
     It allows any contract to swap an ERC-20 for another ERC-20 with a fixed
     input amoun  or a fixed output amount of tokens.

     During the contract initialization it sets the uniswap router address from the
     service registry_

### InvalidUniRouterContract

```solidity
error InvalidUniRouterContract()
```

### InvalidFeeTier

```solidity
error InvalidFeeTier()
```

### FailedToApproveAllowanceForRouter

```solidity
error FailedToApproveAllowanceForRouter()
```

### _initUseUniV3Swapper

```solidity
function _initUseUniV3Swapper(contract IV3SwapRouter luniRouter) internal
```

### uniRouter

```solidity
function uniRouter() public view returns (contract IV3SwapRouter)
```

### uniRouterA

```solidity
function uniRouterA() internal view returns (address)
```

### _allowRouterSpend

```solidity
function _allowRouterSpend(contract IERC20 token, uint256 amount) internal virtual
```

### swap

```solidity
function swap(struct ISwapHandler.SwapParams params) internal virtual returns (uint256 amountIn, uint256 amountOut)
```

Executes a token swap on Uniswap V3 using the specified parameters.

_This function supports two types of swaps:
     - Exact Input: The user specifies the amount of input tokens to swap, and the function calculates
       the minimum amount of output tokens to receive.
     - Exact Output: The user specifies the desired amount of output tokens, and the function calculates
       the maximum amount of input tokens that can be used for the swap.

Reverts if:
     - The input or output token address is invalid.
     - The fee tier is invalid (zero).
     - The swap fails (i.e., the output amount is zero for exact input swaps)._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | A struct containing the parameters for the swap, including:        - underlyingIn: The address of the token being sold.        - underlyingOut: The address of the token being bought.        - mode: The type of swap (0 for exact input, 1 for exact output).        - amountIn: The amount of the input token to sell (exact value for exact input, maximum for exact output).        - amountOut: The amount of the output token to buy (exact value for exact output, minimum for exact input).        - feeTier: The fee tier for the swap. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The actual amount of input tokens used in the swap. |
| amountOut | uint256 | The actual amount of output tokens received from the swap. |

