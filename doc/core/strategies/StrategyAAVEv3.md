# Solidity API

## StrategyAAVEv3

_This strategy is used by the bakerfi vault to deploy ETH capital 
on aave money market.

The Collateral could be cbETH, wstETH, rETH against and the debt is always WETH

The strategy inherits all the business logic from StrategyAAVEv3Base and could be deployed
on Optimism, Arbitrum , Base and Ethereum._

### initialize

```solidity
function initialize(address initialOwner, contract ServiceRegistry registry, bytes32 collateral, bytes32 oracle, uint24 swapFeeTier, uint8 eModeCategory) public
```

### _convertFromWETH

```solidity
function _convertFromWETH(uint256 amount) internal virtual returns (uint256)
```

_Internal function to convert the specified amount from WETH to the underlying assert cbETH, wstETH, rETH.

This function is virtual and intended to be overridden in derived contracts for customized implementation._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount to convert from WETH. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The converted amount in the underlying collateral. |

### _convertToWETH

```solidity
function _convertToWETH(uint256 amount) internal virtual returns (uint256)
```

_Internal function to convert the specified amount to WETH from the underlying collateral.

This function is virtual and intended to be overridden in derived contracts for customized implementation._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount to convert to WETH. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The converted amount in WETH. |

