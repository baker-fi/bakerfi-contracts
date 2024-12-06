# Solidity API

## UseUnifiedSwapper

A contract that allows to swap tokens using different implementations of the swapper

Supports Uniswap V3, Uniswap V2, and Aerodrome

Manages authorized routes for swaps acting as a unified swap router for different swap implementations.
Integrating multiple DEX protocols (Uniswap V2, V3, and Aerodrome)

It prevens memory layout collisions on upgrades

### InvalidRouter

```solidity
error InvalidRouter()
```

### RouteAlreadyAuthorized

```solidity
error RouteAlreadyAuthorized()
```

### RouteNotAuthorized

```solidity
error RouteNotAuthorized()
```

### FailedToApproveAllowance

```solidity
error FailedToApproveAllowance()
```

### InvalidProvider

```solidity
error InvalidProvider()
```

### SwapProvider

The provider of the swap

```solidity
enum SwapProvider {
  NONE,
  UNIV3,
  UNIV2,
  AERODROME
}
```

### RouteInfo

The information about a route

```solidity
struct RouteInfo {
  enum UseUnifiedSwapper.SwapProvider provider;
  address router;
  uint24 uniV3Tier;
  uint24 tickSpacing;
}
```

### _key

```solidity
function _key(address tokenA, address tokenB) internal pure returns (bytes32)
```

### enableRoute

```solidity
function enableRoute(address tokenIn, address tokenOut, struct UseUnifiedSwapper.RouteInfo routeInfo) external
```

Enables a route for a given pair of tokens

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIn | address | The input token address |
| tokenOut | address | The output token address |
| routeInfo | struct UseUnifiedSwapper.RouteInfo | The route information |

### disableRoute

```solidity
function disableRoute(address tokenIn, address tokenOut) external
```

Disables a route for a given pair of tokens

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIn | address | The input token address |
| tokenOut | address | The output token address |

### isRouteEnabled

```solidity
function isRouteEnabled(address tokenIn, address tokenOut) public view returns (bool)
```

Checks if a route is authorized for a given pair of tokens

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIn | address | The input token address |
| tokenOut | address | The output token address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true if the route is authorized, false otherwise |

### swap

```solidity
function swap(struct ISwapHandler.SwapParams params) internal virtual returns (uint256 amountIn, uint256 amountOut)
```

The swap function is responsible for executing token swaps based on the authorized routes.
It retrieves the route information, checks if the route is authorized, and then determines
the appropriate swap pro
    -+
    vider to execute the swap. The function handles swaps for Uniswap V2,
Uniswap V3, and Curve, encoding the necessary parameters for the Curve swap.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | struct defining the requested trade |

## UseUnifiedSwapperMock

A mock contract for testing the UseUnifiedSwapper contract

### constructor

```solidity
constructor() public
```

### test__swap

```solidity
function test__swap(struct ISwapHandler.SwapParams params) external returns (uint256 amountIn, uint256 amountOut)
```

Tests the swap function

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | The swap parameters |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount of input tokens used in the swap |
| amountOut | uint256 | The amount of output tokens received from the swap |

