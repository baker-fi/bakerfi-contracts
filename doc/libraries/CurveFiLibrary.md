# Solidity API

## CurveFiLibrary

_Library for swapping tokens using Uniswap V2 and V3_

### ETH_ADDRESS

```solidity
address ETH_ADDRESS
```

### InvalidFeeTier

```solidity
error InvalidFeeTier()
```

### InvalidV2RouterContract

```solidity
error InvalidV2RouterContract()
```

### InvalidV3RouterContract

```solidity
error InvalidV3RouterContract()
```

### InsufficientBalance

```solidity
error InsufficientBalance()
```

### UnsupportedSwapType

```solidity
error UnsupportedSwapType()
```

### swapCurveFi

```solidity
function swapCurveFi(contract ICurveRouterNG router, struct ISwapHandler.SwapParams params) internal returns (uint256 amountIn, uint256 amountOut)
```

_Executes a token swap using the Curve Router._

### _executeCurveFiSwap

```solidity
function _executeCurveFiSwap(contract ICurveRouterNG router, address[11] route, uint256[5][5] swapParams, address[5] pools, struct ISwapHandler.SwapParams params) internal returns (uint256 amountIn, uint256 amountOut)
```

_Executes a token swap using the Curve Router.

This function handles two types of swaps:
1. EXACT_INPUT: The user specifies an exact amount of input tokens to swap for a minimum amount of output tokens.
2. EXACT_OUTPUT: The user specifies an exact amount of output tokens to receive, and the function calculates the required input tokens._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| router | contract ICurveRouterNG |  |
| route | address[11] | An array of addresses representing the swap route. |
| swapParams | uint256[5][5] | A 2D array containing parameters for the swap. |
| pools | address[5] | An array of addresses representing the liquidity pools. |
| params | struct ISwapHandler.SwapParams | The swap parameters containing details about the swap. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The actual amount of input tokens used in the swap. |
| amountOut | uint256 | The actual amount of output tokens received from the swap. |

