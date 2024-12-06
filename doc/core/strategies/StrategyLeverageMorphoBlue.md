# Solidity API

## StrategyLeverageMorphoBlue

This contract implements a leverage strategy using the Morpho protocol.
It extends the `StrategyLeverage` base contract and interacts with the Morpho protocol for
lending and borrowing operations.

The Collateral could be cbETH, wstETH, rETH against and the debt is an ERC20 (example: ETH)

The strategy inherits all the business logic from StrategyLeverage
and could be deployed on Base and Ethereum.

_This strategy is used by the bakerfi vault to deploy ETH/ERC20 capital
on Morpho Blue Money Markets_

### StrategyLeverageMorphoParams

```solidity
struct StrategyLeverageMorphoParams {
  address collateralToken;
  address debtToken;
  address oracle;
  address flashLender;
  address morphoBlue;
  address morphoOracle;
  address irm;
  uint256 lltv;
}
```

### InvalidMorphoBlueContract

```solidity
error InvalidMorphoBlueContract()
```

### FailedToRepayDebt

```solidity
error FailedToRepayDebt()
```

< Thrown when the Morpho contract address is invalid.

### InvalidMorphoBlueMarket

```solidity
error InvalidMorphoBlueMarket()
```

< Thrown when the debt repayment fails.

### constructor

```solidity
constructor() public
```

Constructor to disable initializers in the implementation contract.

_Prevents the implementation contract from being initialized._

### initialize

```solidity
function initialize(address initialOwner, address initialGovernor, struct StrategyLeverageMorphoBlue.StrategyLeverageMorphoParams params) public
```

Initializes the strategy with the given parameters.

_This function sets up the strategy by initializing the base strategy and configuring Morpho Market parameters._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the initial owner of the strategy. |
| initialGovernor | address | The address of the initial governor of the strategy. |
| params | struct StrategyLeverageMorphoBlue.StrategyLeverageMorphoParams | The parameters required for initializing the strategy. |

### getBalances

```solidity
function getBalances() public view virtual returns (uint256 collateralBalance, uint256 debtBalance)
```

Retrieves the current collateral and debt balances.

_This function fetches the expected supply and borrow assets from Morpho and converts them into system decimals._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateralBalance | uint256 | The current collateral balance of the strategy. |
| debtBalance | uint256 | The current debt balance of the strategy. |

### _supply

```solidity
function _supply(uint256 amountIn) internal virtual
```

Supplies collateral to the Morpho protocol.

_This function approves the Morpho contract to spend the asset and then transfers the asset from the user to the contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The  amount of the asset being supplied. |

### _supplyAndBorrow

```solidity
function _supplyAndBorrow(uint256 collateralAmount, uint256 debtAmount) internal virtual
```

Supplies collateral and borrows a specified amount from Morpho.

_This function supplies the asset and borrows from Morpho in a single transaction._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateralAmount | uint256 | The amount of the asset being supplied. |
| debtAmount | uint256 | The amount to borrow against the supplied collateral. |

### _repay

```solidity
function _repay(uint256 amount) internal virtual
```

Repays debt in the Morpho protocol.

_This function approves Morpho to spend the asset and then repays the debt. If the repayment is insufficient, it reverts._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of the asset being used for repayment. |

### _withdraw

```solidity
function _withdraw(uint256 amount, address to) internal virtual
```

Withdraws collateral from the Morpho protocol.

_This function withdraws collateral from Morpho and sends it to the specified address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of the asset to be withdrawn. |
| to | address | The address to receive the withdrawn asset. |

