# Solidity API

## UseSwapper

_Abstract contract to integrate the use of Uniswap V3 
     Provides functions to initialize, access and swap 
     It allows any contract to swap an ERC-20 for another ERC-20 with a fixed
     input amoun  or a fixed output amount of tokens.

     During the contract initialization it sets the uniswap router address from the 
     service registry_

### Swap

```solidity
event Swap(address assetIn, address assetOut, uint256 assetInAmount, uint256 assetOutAmount)
```

### SwapFailed

```solidity
error SwapFailed()
```

### _initUseSwapper

```solidity
function _initUseSwapper(contract ServiceRegistry registry) internal
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

