# Solidity API

## StrategyLeverage

The Contract is abstract and needs to be extended to implement the
conversion between debt token and the collateral , to integrate a money market

_This contract implements a strategy and could be used to deploy a ERC-20 on a AAVE with
the a recursive staking strategy and receive an amplified yield

The Strategy interacts with :

✅ BalancerFlashLender to request a flash loan from Balancer
✅ Uniswap to convert from collateral token to debt token
✅ Uniswap Quoter to request a precise price token
✅ AAVE as the lending/borrow market

The APY of this strategy depends on the followwin factors:

 ✅ Lido APY
 ✅ AAVE v3 Borrow Rate
 ✅ Target Loan to Value
 ✅ Number of Loops on the recursive Strategy

 Flow Deposit:
 1) Deploy X amount of ETH/ERC20
 2) Borrow Y Amount of ETH/ERC20
 3) Deposit X+Y amount of Collateral in AAVE
 4) Borrow Y ETH/ERC20 From AAVE to pay the flash loan
 5) Ends up with X+Y Amount of Collateral and Y of Debt

 This strategy could work for
 rETH/WETH
 wstETH/WETH
 sUSD/DAI

 ..._

### FlashLoanAction

```solidity
enum FlashLoanAction {
  SUPPLY_BORROW,
  PAY_DEBT_WITHDRAW,
  PAY_DEBT
}
```

### FlashLoanData

```solidity
struct FlashLoanData {
  uint256 originalAmount;
  address receiver;
  enum StrategyLeverage.FlashLoanAction action;
}
```

### InvalidDebtToken

```solidity
error InvalidDebtToken()
```

### InvalidCollateralToken

```solidity
error InvalidCollateralToken()
```

### InvalidOracle

```solidity
error InvalidOracle()
```

### InvalidDeployAmount

```solidity
error InvalidDeployAmount()
```

### InvalidAllowance

```solidity
error InvalidAllowance()
```

### FailedToRunFlashLoan

```solidity
error FailedToRunFlashLoan()
```

### InvalidFlashLoanSender

```solidity
error InvalidFlashLoanSender()
```

### InvalidLoanInitiator

```solidity
error InvalidLoanInitiator()
```

### InvalidFlashLoanAsset

```solidity
error InvalidFlashLoanAsset()
```

### CollateralLowerThanDebt

```solidity
error CollateralLowerThanDebt()
```

### InvalidDeltaDebt

```solidity
error InvalidDeltaDebt()
```

### PriceOutdated

```solidity
error PriceOutdated()
```

### NoCollateralMarginToScale

```solidity
error NoCollateralMarginToScale()
```

### ETHTransferNotAllowed

```solidity
error ETHTransferNotAllowed(address sender)
```

### FailedToAuthenticateArgs

```solidity
error FailedToAuthenticateArgs()
```

### InvalidFlashLoanAction

```solidity
error InvalidFlashLoanAction()
```

### _collateralToken

```solidity
address _collateralToken
```

### _debtToken

```solidity
address _debtToken
```

### _emptySlots

```solidity
uint256[1] _emptySlots
```

### _initializeStrategyLeverage

```solidity
function _initializeStrategyLeverage(address initialOwner, address initialGovernor, address collateralToken, address debtToken, address oracle, address flashLender) internal
```

_Internal function to initialize the AAVEv3 strategy base.

This function is used for the initial setup of the AAVEv3 strategy base contract, including ownership transfer,
service registry initialization, setting oracles, configuring AAVEv3 parameters, and approving allowances._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address to be set as the initial owner of the AAVEv3 strategy base contract. |
| initialGovernor | address |  |
| collateralToken | address | The hash representing the collateral ERC20 token in the service registry. |
| debtToken | address | The hash representing the collateral/ETH oracle in the service registry. |
| oracle | address | The hash representing the collateral ERC20 token in the service registry. |
| flashLender | address | The hash representing the flash lender in the service registry. Requirements: - The caller must be in the initializing state. - The initial owner address must not be the zero address. - The debt/USD oracle and collateral/USD oracle addresses must be valid. - Approval allowances must be successfully set for debt ERC20 and the collateral ERC20 token for UniSwap. |

### receive

```solidity
receive() external payable
```

_Fallback function to receive Ether.

 This function is automatically called when the contract receives Ether
 without a specific function call.

 It allows the contract to accept incoming Ether fromn the WETH contract_

### getPosition

```solidity
function getPosition(struct IOracle.PriceOptions priceOptions) external view returns (uint256 totalCollateralInAsset, uint256 totalDebtInAsset, uint256 loanToValue)
```

_Retrieves the position details including total collateral, total debt, and loan-to-value ratio.

This function is externally callable and returns the total collateral in Ether, total debt in USD,
and the loan-to-value ratio for the AAVEv3 strategy._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalCollateralInAsset | uint256 | The total collateral in USD. |
| totalDebtInAsset | uint256 | The total debt in USD. |
| loanToValue | uint256 | The loan-to-value ratio calculated as (totalDebtInUSD * PERCENTAGE_PRECISION) / totalCollateralInUSD. Requirements: - The AAVEv3 strategy must be properly configured and initialized. |

### totalAssets

```solidity
function totalAssets() external view returns (uint256 totalOwnedAssetsInDebt)
```

_Retrieves the total owned assets by the Strategy in USD

This function is externally callable and returns the total owned assets in USD, calculated as the difference
between total collateral and total debt. If the total collateral is less than or equal to the total debt, the
total owned assets is set to 0._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalOwnedAssetsInDebt | uint256 | The total owned assets in Debt Token Requirements: - The AAVEv3 strategy must be properly configured and initialized. |

### deploy

```solidity
function deploy(uint256 amount) external returns (uint256 deployedAmount)
```

_Deploys funds in the AAVEv3 strategy

This function is externally callable only by the owner, and it involves the following steps:
1. Transfer the Debt Token to the Strategy
2. Initiates a Debt Token flash loan to leverage the deposited amount._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deployedAmount | uint256 | The amount deployed in the AAVEv3 strategy after leveraging. Requirements: - The caller must be the owner of the contract. - The received Ether amount must not be zero. - The AAVEv3 strategy must be properly configured and initialized. |

### onFlashLoan

```solidity
function onFlashLoan(address initiator, address token, uint256 amount, uint256 fee, bytes callData) external returns (bytes32)
```

_Handles the execution of actions after receiving a flash loan.

This function is part of the IERC3156FlashBorrower interface and is called by the flash lender contract
after a flash loan is initiated. It validates the loan parameters, ensures that the initiator is the
contract itself, and executes specific actions based on the provided FlashLoanAction. The supported actions
include supplying and borrowing funds, repaying debt and withdrawing collateral, and simply repaying debt.
The function returns a bytes32 success message after the actions are executed._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initiator | address | The address that initiated the flash loan. |
| token | address | The address of the token being flash borrowed (should be Debt Token in this case). |
| amount | uint256 | The total amount of tokens being flash borrowed. |
| fee | uint256 | The fee amount associated with the flash loan. |
| callData | bytes | Additional data encoded for specific actions, including the original amount, action type, and receiver address. Requirements: - The flash loan sender must be the expected flash lender contract. - The initiator must be the contract itself to ensure trust. - The contract must be properly configured and initialized. |

### undeploy

```solidity
function undeploy(uint256 amount) external returns (uint256 undeployedAmount)
```

_Initiates the undeployment of a specified amount, sending the resulting ETH to the contract owner.

This function allows the owner of the contract to undeploy a specified amount, which involves
withdrawing the corresponding collateral, converting it to Debt Token, unwrapping Debt Token, and finally
sending the resulting ETH to the contract owner. The undeployment is subject to reentrancy protection.
The function returns the amount of ETH undeployed to the contract owner.
The method is designed to ensure that the collateralization ratio (collateral value to debt value) remains within acceptable limits.
It leverages a flash loan mechanism to obtain additional funds temporarily, covering any necessary adjustments required to maintain
the desired collateralization ratio._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount of collateral to undeploy. Requirements: - The caller must be the owner of the contract. |

### _adjustDebt

```solidity
function _adjustDebt(uint256 totalCollateralInDebt, uint256 totalDebt) internal returns (uint256 deltaAmount)
```

Adjusts the current debt position by calculating the amount of debt to repay and executing a flash loan.

_The function calculates the necessary debt to repay based on the loan-to-value (LTV) ratio and initiates a flash loan
     to cover this amount. The function also handles the approval for the flash loan and manages the flash loan execution._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalCollateralInDebt | uint256 | The total collateral value expressed in debt terms. |
| totalDebt | uint256 | The current total debt amount. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| deltaAmount | uint256 | The total amount of debt adjusted, including any flash loan fees. |

### harvest

```solidity
function harvest() external returns (int256 balanceChange)
```

_Harvests the strategy by rebalancing the collateral and debt positions.

This function allows the owner of the contract to harvest the strategy by rebalancing the collateral
and debt positions. It calculates the current collateral and debt positions, checks if the collateral
is higher than the debt, adjusts the debt if needed to maintain the loan-to-value (LTV) within the specified
range, and logs profit or loss based on changes in the deployed amount. The function returns the balance change
as an int256 value.

Requirements:
- The caller must be the owner of the contract.
- The contract must be properly configured and initialized.

Emits:
- StrategyProfit: If the strategy achieves a profit.
- StrategyLoss: If the strategy incurs a loss.
- StrategyAmountUpdate: Whenever the deployed amount is updated._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in strategy balance as an int256 value. |

### getBalances

```solidity
function getBalances() public view virtual returns (uint256 collateralBalance, uint256 debtBalance)
```

Get the Money Market Position Balances (Collateral, Debt) in Token Balances

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateralBalance | uint256 |  |
| debtBalance | uint256 |  |

### _getPosition

```solidity
function _getPosition(struct IOracle.PriceOptions priceOptions) internal view returns (uint256 totalCollateralInAsset, uint256 totalDebtInAsset)
```

_Retrieves the current collateral and debt positions of the contract.

This internal function provides a view into the current collateral and debt positions of the contract
by querying the Aave V3 protocol. It calculates the positions in ETH based on the current ETH/USD exchange rate._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalCollateralInAsset | uint256 | The total collateral position in ETH. |
| totalDebtInAsset | uint256 | The total debt position in ETH. |

### _payDebt

```solidity
function _payDebt(uint256 debtAmount, uint256 fee) internal
```

_Repays the debt on AAVEv3 strategy, handling the withdrawal and swap operations.

This private function is used internally to repay the debt on the AAVEv3 strategy. It involves repaying
the debt on AAVE, obtaining a quote for the required collateral, withdrawing the collateral from AAVE, and
swapping the collateral to obtain the necessary Debt Token. The leftover Debt Token after the swap is deposited back
into AAVE if there are any. The function emits the `StrategyUndeploy` event after the debt repayment._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| debtAmount | uint256 | The amount of Debt Token to be repaid on AAVE. |
| fee | uint256 | The fee amount in Debt Token associated with the debt repayment. Requirements: - The AAVEv3 strategy must be properly configured and initialized. |

### _convertToCollateral

```solidity
function _convertToCollateral(uint256 amount) internal virtual returns (uint256)
```

_Internal function to convert the specified amount from Debt Token to the underlying collateral asset cbETH, wstETH, rETH.

This function is virtual and intended to be overridden in derived contracts for customized implementation._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount to convert from debtToken. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The converted amount in the underlying collateral. |

### _convertToDebt

```solidity
function _convertToDebt(uint256 amount) internal virtual returns (uint256)
```

_Internal function to convert the specified amount to Debt Token from the underlying collateral.

This function is virtual and intended to be overridden in derived contracts for customized implementation._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount to convert to Debt Token. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 The converted amount in Debt Token. |

### _toDebt

```solidity
function _toDebt(struct IOracle.PriceOptions priceOptions, uint256 amountIn, bool roundUp) internal view returns (uint256 amountOut)
```

_Internal function to convert the specified amount from Collateral Token to Debt Token.

This function calculates the equivalent amount in Debt Tokeb based on the latest price from the collateral oracle._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| priceOptions | struct IOracle.PriceOptions |  |
| amountIn | uint256 | The amount in the underlying collateral. |
| roundUp | bool |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The equivalent amount in Debt Token. |

### _toCollateral

```solidity
function _toCollateral(struct IOracle.PriceOptions priceOptions, uint256 amountIn, bool roundUp) internal view returns (uint256 amountOut)
```

_Internal function to convert the specified amount from Debt Token to Collateral Token.

This function calculates the equivalent amount in the underlying collateral based on the latest price from the collateral oracle._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| priceOptions | struct IOracle.PriceOptions |  |
| amountIn | uint256 | The amount in Debt Token to be converted. |
| roundUp | bool |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The equivalent amount in the underlying collateral. |

### _supplyBorrow

```solidity
function _supplyBorrow(uint256 amount, uint256 loanAmount, uint256 fee) internal
```

_Executes the supply and borrow operations on AAVE, converting assets from Debt Token.

This function is private and is used internally in the AAVEv3 strategy for depositing collateral
and borrowing ETH on the AAVE platform. It involves converting assets from Debt Tokens to the respective
tokens, supplying collateral, and borrowing ETH. The strategy owned value is logged on the  `StrategyDeploy` event._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amount to be supplied to AAVE (collateral) in Debt Token. |
| loanAmount | uint256 | The amount to be borrowed from AAVE in Debt Token. |
| fee | uint256 | The fee amount in Debt Token associated with the flash loan. Requirements: - The AAVEv3 strategy must be properly configured and initialized. |

### _repayAndWithdraw

```solidity
function _repayAndWithdraw(uint256 withdrawAmount, uint256 repayAmount, uint256 fee, address payable receiver) internal
```

_Repays a specified amount, withdraws collateral, and sends the remaining Debt Token to the specified receiver.

This private function is used internally to repay a specified amount on AAVE, withdraw collateral, and send
the remaining ETH to the specified receiver. It involves checking the available balance, repaying the debt on
AAVE, withdrawing the specified amount of collateral, converting collateral to Debt Token, unwrapping Debt Token, and finally
sending the remaining ETH to the receiver. The function emits the `StrategyUndeploy` event after the operation._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| withdrawAmount | uint256 | The amount of collateral balance to be withdraw. |
| repayAmount | uint256 | The amount of debt balance be repaid on AAVE. |
| fee | uint256 | The fee amount in debt balance to be paid as feed |
| receiver | address payable | The address to receive the remaining debt tokens after debt repayment and withdrawal. Requirements: - The AAVEv3 strategy must be properly configured and initialized. |

### _supply

```solidity
function _supply(uint256 amountIn) internal virtual
```

@dev Deposit an asset assetIn on a money market

### _supplyAndBorrow

```solidity
function _supplyAndBorrow(uint256 amountIn, uint256 borrowOut) internal virtual
```

_Deposit and borrow and asset using the asset deposited as collateral_

### _repay

```solidity
function _repay(uint256 amount) internal virtual
```

@dev Repay any borrow debt

### _withdraw

```solidity
function _withdraw(uint256 amount, address to) internal virtual
```

_Withdraw a deposited asset from a money market_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | The amoun to withdraw |
| to | address | the account that will receive the asset |

### renounceOwnership

```solidity
function renounceOwnership() public virtual
```

@dev

### getCollateralOracle

```solidity
function getCollateralOracle() public view returns (address oracle)
```

### setDebtOracle

```solidity
function setDebtOracle(contract IOracle oracle) public
```

### asset

```solidity
function asset() public view returns (address)
```

The Asset deployed on this strategy

### getCollateralAsset

```solidity
function getCollateralAsset() external view returns (address)
```

_Return the Address of the Asset used as Collatteral_

### getDebAsset

```solidity
function getDebAsset() external view returns (address)
```

_Return the Address of the Debt Asset used as Debt_

