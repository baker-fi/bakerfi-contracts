# Solidity API

## UseSwapper

### Swap

```solidity
event Swap(address assetIn, address assetOut, uint256 assetInAmount, uint256 assetOutAmount)
```

### SwapFailed

```solidity
error SwapFailed()
```

### __initUseSwapper

```solidity
function __initUseSwapper(contract ServiceRegistry registry) internal
```

### uniRouter

```solidity
function uniRouter() public view returns (contract IV3SwapRouter)
```

### uniRouterA

```solidity
function uniRouterA() public view returns (address)
```

### _swap

```solidity
function _swap(struct ISwapHandler.SwapParams params) internal returns (uint256 amountOut)
```

Execute a trade on the swap handler

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct ISwapHandler.SwapParams | struct defining the requested trade |

