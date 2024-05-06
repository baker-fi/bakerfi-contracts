# Solidity API

## StrategyAAVEv3Base

The Contract is abstract and needs to be extended to implement the
conversion between WETH and the collateral

_This contract implements a strategy and could be used to deploy ETH on a AAVE with
the a recursive staking strategy and receive an amplified yield

The Strategy interacts with :

✅ BalancerFlashLender to request a flash loan from Balancer
✅ Uniswap to convert from collateral token to WETH
✅ Uniswap Quoter to reqques a precise price token
✅ AAVE as the lending/borrow market

The APY of this strategy depends on the followwin factors:

 ✅ Lido APY
 ✅ AAVE v3 Borrow Rate
 ✅ Target Loan to Value
 ✅ Number of Loops on the recursive Strategy

 Flow Deposit:
 1) Deploy X amount of ETH
 2) Borrow Y Amount of ETH
 3) Deposit X+Y amount of Collateral in AAVE
 4) Borrow Y ETH From AAVE to pay the flash loan
 5) Ends up with X+Y Amount of Collateral and Y of Debt

 LeverageRatio = LeverageFunc(numberOfLoops, LTV)
 APY ~=  LidoAPY - (LidoAPY-AAVE_Borrow_Rate)*(1-leverateRatio);

 This strategy could work for
 rETH/WETH
 awstETH/WETH_


### Contracts Description Table


|  Contract  |         Type        |       Bases      |                  |                 |
|:----------:|:-------------------:|:----------------:|:----------------:|:---------------:|
|     └      |  **Function Name**  |  **Visibility**  |  **Mutability**  |  **Modifiers**  |
||||||
| **StrategyAAVEv3Base** | Implementation | StrategyLeverageSettings, IStrategy, IERC3156FlashBorrowerUpgradeable, UseWETH, UseIERC20, UseAAVEv3, UseSwapper, UseFlashLender, UseUniQuoter, ReentrancyGuardUpgradeable, UseLeverage, UseSettings |||
| └ | _initializeStrategyAAVEv3Base | Internal 🔒 | 🛑  | onlyInitializing |
| └ | <Receive Ether> | External ❗️ |  💵 |NO❗️ |
| └ | getPosition | External ❗️ |   |NO❗️ |
| └ | deployed | Public ❗️ |   |NO❗️ |
| └ | deploy | External ❗️ |  💵 | onlyOwner nonReentrant |
| └ | _supplyBorrow | Private 🔐 | 🛑  | |
| └ | _payDebt | Private 🔐 | 🛑  | |
| └ | _repayAndWithdraw | Private 🔐 | 🛑  | |
| └ | onFlashLoan | External ❗️ | 🛑  |NO❗️ |
| └ | undeploy | External ❗️ | 🛑  | onlyOwner nonReentrant |
| └ | _adjustDebt | Internal 🔒 | 🛑  | |
| └ | harvest | External ❗️ | 🛑  | onlyOwner nonReentrant |
| └ | _getPosition | Internal 🔒 |   | |
| └ | _undeploy | Private 🔐 | 🛑  | |
| └ | _convertFromWETH | Internal 🔒 | 🛑  | |
| └ | _convertToWETH | Internal 🔒 | 🛑  | |
| └ | _toWETH | Internal 🔒 |   | |
| └ | _fromWETH | Internal 🔒 |   | |
| └ | renounceOwnership | Public ❗️ | 🛑  |NO❗️ |


### FlashLoanAction

```solidity
enum FlashLoanAction {
  SUPPLY_BOORROW,
  PAY_DEBT_WITHDRAW,
  PAY_DEBT
}
```

### FlashLoanData

```solidity
struct FlashLoanData {
  uint256 originalAmount;
  address receiver;
  enum StrategyAAVEv3Base.FlashLoanAction action;
}
```

### InvalidOwner

```solidity
error InvalidOwner()
```

### InvalidDebtOracle

```solidity
error InvalidDebtOracle()
```

### InvalidCollateralOracle

```solidity
error InvalidCollateralOracle()
```

### InvalidAAVEEMode

```solidity
error InvalidAAVEEMode()
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

### InvalidWithdrawAmount

```solidity
error InvalidWithdrawAmount()
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

### OraclePriceOutdated

```solidity
error OraclePriceOutdated()
```

### NoCollateralMarginToScale

```solidity
error NoCollateralMarginToScale()
```

### ETHTransferNotAllowed

```solidity
error ETHTransferNotAllowed(address sender)
```

### _pendingAmount

```solidity
uint256 _pendingAmount
```

### _swapFeeTier

```solidity
uint24 _swapFeeTier
```

### _initializeStrategyAAVEv3Base

```solidity
function _initializeStrategyAAVEv3Base(address initialOwner, address initialGovernor, contract ServiceRegistry registry, bytes32 collateralIERC20, bytes32 collateralOracle, uint24 swapFeeTier, uint8 eModeCategory) internal
```

_Internal function to initialize the AAVEv3 strategy base.

This function is used for the initial setup of the AAVEv3 strategy base contract, including ownership transfer,
service registry initialization, setting oracles, configuring AAVEv3 parameters, and approving allowances._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address to be set as the initial owner of the AAVEv3 strategy base contract. |
| initialGovernor | address |  |
| registry | contract ServiceRegistry | The service registry contract address to be used for initialization. |
| collateralIERC20 | bytes32 | The hash representing the collateral ERC20 token in the service registry. |
| collateralOracle | bytes32 | The hash representing the collateral/ETH oracle in the service registry. |
| swapFeeTier | uint24 | The swap fee tier for Uniswap. |
| eModeCategory | uint8 | The EMode category for the AAVEv3 strategy. Requirements: - The caller must be in the initializing state. - The initial owner address must not be the zero address. - The ETH/USD oracle and collateral/USD oracle addresses must be valid. - The EMode category must be successfully set for the AAVEv3 strategy. - Approval allowances must be successfully set for WETH and the collateral ERC20 token for UniSwap. |

### receive

```solidity
receive() external payable
```

_Fallback function to receive Ether.

 This function is automatically called when the contract receives Ether 
 without a specific function call.
 It allows the contract to accept incoming Ether transactions._

### getPosition

```solidity
function getPosition() external view returns (uint256 totalCollateralInEth, uint256 totalDebtInEth, uint256 loanToValue)
```

_Retrieves the position details including total collateral, total debt, and loan-to-value ratio.

This function is externally callable and returns the total collateral in Ether, total debt in Ether,
and the loan-to-value ratio for the AAVEv3 strategy._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalCollateralInEth | uint256 | The total collateral in Ether. |
| totalDebtInEth | uint256 | The total debt in Ether. |
| loanToValue | uint256 | The loan-to-value ratio calculated as (totalDebtInEth * PERCENTAGE_PRECISION) / totalCollateralInEth. Requirements: - The AAVEv3 strategy must be properly configured and initialized. |

### deployed

```solidity
function deployed(uint256 priceMaxAge) public view returns (uint256 totalOwnedAssets)
```

_Retrieves the total owned assets by the Strategy in ETH

This function is externally callable and returns the total owned assets in Ether, calculated as the difference
between total collateral and total debt. If the total collateral is less than or equal to the total debt, the
total owned assets is set to 0._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalOwnedAssets | uint256 | The total owned assets in Ether. Requirements: - The AAVEv3 strategy must be properly configured and initialized. |

### deploy

```solidity
function deploy() external payable returns (uint256 deployedAmount)
```

_Deploys funds in the AAVEv3 strategy

This function is externally callable only by the owner, and it involves the following steps:
1. Wraps the received Ether into WETH.
2. Initiates a WETH flash loan to leverage the deposited amount._

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
| token | address | The address of the token being flash borrowed (should be WETH in this case). |
| amount | uint256 | The total amount of tokens being flash borrowed. |
| fee | uint256 | The fee amount associated with the flash loan. |
| callData | bytes | Additional data encoded for specific actions, including the original amount, action type, and receiver address. Requirements: - The flash loan sender must be the expected flash lender contract. - The initiator must be the contract itself to ensure trust. - Only WETH flash loans are allowed. - The contract must be properly configured and initialized. |

### undeploy

```solidity
function undeploy(uint256 amount) external returns (uint256 undeployedAmount)
```

_Initiates the undeployment of a specified amount, sending the resulting ETH to the contract owner.

This function allows the owner of the contract to undeploy a specified amount, which involves
withdrawing the corresponding collateral, converting it to WETH, unwrapping WETH, and finally
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
function _adjustDebt(uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) internal returns (uint256 deltaDebt)
```

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

### _getPosition

```solidity
function _getPosition(uint256 priceMaxAge) internal view returns (uint256 totalCollateralInEth, uint256 totalDebtInEth)
```

_Retrieves the current collateral and debt positions of the contract.

This internal function provides a view into the current collateral and debt positions of the contract
by querying the Aave V3 protocol. It calculates the positions in ETH based on the current ETH/USD exchange rate._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| totalCollateralInEth | uint256 | The total collateral position in ETH. |
| totalDebtInEth | uint256 | The total debt position in ETH. |

### _convertFromWETH

```solidity
function _convertFromWETH(uint256 amount) internal virtual returns (uint256)
```

_Internal function to convert the specified amount from WETH to the underlying collateral.

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

### _toWETH

```solidity
function _toWETH(uint256 amountIn) internal view returns (uint256 amountOut)
```

_Internal function to convert the specified amount in the underlying collateral to WETH.

This function calculates the equivalent amount in WETH based on the latest price from the collateral oracle._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount in the underlying collateral. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The equivalent amount in WETH. |

### _fromWETH

```solidity
function _fromWETH(uint256 amountIn) internal view returns (uint256 amountOut)
```

_Internal function to convert the specified amount in WETH to the underlying collateral.

This function calculates the equivalent amount in the underlying collateral based on the latest price from the collateral oracle._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountIn | uint256 | The amount in WETH. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | The equivalent amount in the underlying collateral. |

### renounceOwnership

```solidity
function renounceOwnership() public virtual
```

_Leaves the contract without owner. It will not be possible to call
`onlyOwner` functions. Can only be called by the current owner.

NOTE: Renouncing ownership will leave the contract without an owner,
thereby disabling any functionality that is only available to the owner._

