# Solidity API

## AAVEv3StrategyBase

The Contract is abstract and needs to be extended to implement the c
conversion between WETH and the collateral

### FlashLoanAction

```solidity
enum FlashLoanAction {
  SUPPLY_BOORROW,
  PAY_DEBT_WITHDRAW,
  PAY_DEBT
}
```

### StrategyDeploy

```solidity
event StrategyDeploy(address from, uint256 amount)
```

### StrategyUndeploy

```solidity
event StrategyUndeploy(address from, uint256 amount)
```

### StrategyProfit

```solidity
event StrategyProfit(uint256 amount)
```

### StrategyLoss

```solidity
event StrategyLoss(uint256 amount)
```

### StrategyAmountUpdate

```solidity
event StrategyAmountUpdate(uint256 newDeployment)
```

### FlashLoanData

```solidity
struct FlashLoanData {
  uint256 originalAmount;
  address receiver;
  enum AAVEv3StrategyBase.FlashLoanAction action;
}
```

### _pendingAmount

```solidity
uint256 _pendingAmount
```

### _swapFeeTier

```solidity
uint24 _swapFeeTier
```

### __initializeAAVEv3StrategyBase

```solidity
function __initializeAAVEv3StrategyBase(address initialOwner, contract ServiceRegistry registry, bytes32 collateralIERC20, bytes32 collateralOracle, uint24 swapFeeTier, uint8 eModeCategory) internal
```

### receive

```solidity
receive() external payable
```

### getPosition

```solidity
function getPosition() external view returns (uint256 totalCollateralInEth, uint256 totalDebtInEth, uint256 loanToValue)
```

### deployed

```solidity
function deployed() public view returns (uint256 totalOwnedAssets)
```

Current capital owned by Share Holders
The amount of capital is equal to Total Collateral Value - Total Debt Value

### deploy

```solidity
function deploy() external payable returns (uint256 deployedAmount)
```

Deploy new Capital on the pool making it productive on the Lido

### onFlashLoan

```solidity
function onFlashLoan(address initiator, address token, uint256 amount, uint256 fee, bytes callData) external returns (bytes32)
```

Flash Loan Callback

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initiator | address | Flash Loan Requester |
| token | address | Asset requested on the loan |
| amount | uint256 | Amount of the loan |
| fee | uint256 | Fee to be paid to flash lender |
| callData | bytes | Call data passed by the requester |

### undeploy

```solidity
function undeploy(uint256 amount) external returns (uint256 undeployedAmount)
```

The primary purpose of the undeploy method is to allow users to burn shares and receive the attached ETH value to the sahres. 
The method is designed to ensure that the collateralization ratio (collateral value to debt value) remains within acceptable limits. 
It leverages a flash loan mechanism to obtain additional funds temporarily, covering any necessary adjustments required to maintain 
the desired collateralization ratio.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| amount | uint256 | Amount undeployed |

### _adjustDebt

```solidity
function _adjustDebt(uint256 totalCollateralBaseInEth, uint256 totalDebtBaseInEth) internal returns (uint256 deltaDebt)
```

### harvest

```solidity
function harvest() external returns (int256 balanceChange)
```

Harvest a profit when there is a difference between the amount the strategy
predicts that is deployed and the real value

### _getPosition

```solidity
function _getPosition() internal view returns (uint256 totalCollateralInEth, uint256 totalDebtInEth)
```

### _convertFromWETH

```solidity
function _convertFromWETH(uint256 amount) internal virtual returns (uint256)
```

### _convertToWETH

```solidity
function _convertToWETH(uint256 amount) internal virtual returns (uint256)
```

### _toWETH

```solidity
function _toWETH(uint256 amountIn) internal view returns (uint256 amountOut)
```

### _fromWETH

```solidity
function _fromWETH(uint256 amountIn) internal view returns (uint256 amountOut)
```

