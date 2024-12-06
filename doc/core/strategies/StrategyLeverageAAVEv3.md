# Solidity API

## StrategyLeverageAAVEv3

_This strategy is used by the bakerfi vault to deploy ETH/ERC20 capital
on aave money market.

The Collateral could be cbETH, wstETH, rETH against and the debt is an ERC20 (example: ETH)

The strategy inherits all the business logic from StrategyLeverage
and could be deployed on Optimism, Arbitrum , Base and Ethereum or any L2 with AAVE markets_

### FailedToApproveAllowanceForAAVE

```solidity
error FailedToApproveAllowanceForAAVE()
```

### InvalidAAVEEMode

```solidity
error InvalidAAVEEMode()
```

### FailedToRepayDebt

```solidity
error FailedToRepayDebt()
```

### InvalidWithdrawAmount

```solidity
error InvalidWithdrawAmount()
```

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address initialOwner, address initialGovernor, address collateralToken, address debtToken, address oracle, address flashLender, address aaveV3Pool, uint8 eModeCategory) public
```

### getBalances

```solidity
function getBalances() public view virtual returns (uint256 collateralBalance, uint256 debtBalance)
```

Get the Current Position on AAVE v3 Money Market

_!Important: No Conversion to USD Done_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateralBalance | uint256 | The Collateral Balance Amount |
| debtBalance | uint256 | The Debt Token Balance Amount |

### _supply

```solidity
function _supply(uint256 amountIn) internal virtual
```

Deposit an asset on the AAVEv3 Pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | the amount to deposit |

### _supplyAndBorrow

```solidity
function _supplyAndBorrow(uint256 collateral, uint256 debt) internal virtual
```

_Supplies an asset and borrows another asset from AAVE v3._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateral | uint256 | The amount of the asset to supply. |
| debt | uint256 | The address of the asset to borrow. |

### _repay

```solidity
function _repay(uint256 amount) internal virtual
```

_Repays a borrowed asset on AAVE v3._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of the borrowed asset to repay. |

### _withdraw

```solidity
function _withdraw(uint256 amount, address to) internal virtual
```

Withdraw an asset from the AAVE pool

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of the asset to withdraw. |
| to | address | The assets receiver account |

