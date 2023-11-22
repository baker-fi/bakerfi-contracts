# Solidity API

## BalancerFlashLender

Balancer Flash Loan Adapter

### CALLBACK_SUCCESS

```solidity
bytes32 CALLBACK_SUCCESS
```

### constructor

```solidity
constructor(contract ServiceRegistry registry) public
```

### maxFlashLoan

```solidity
function maxFlashLoan(address token) external view returns (uint256)
```

_The amount of currency available to be lended._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The loan currency. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The amount of `token` that can be borrowed. |

### flashFee

```solidity
function flashFee(address, uint256) external pure returns (uint256)
```

### flashLoan

```solidity
function flashLoan(contract IERC3156FlashBorrowerUpgradeable borrower, address token, uint256 amount, bytes data) external returns (bool)
```

### receiveFlashLoan

```solidity
function receiveFlashLoan(address[] tokens, uint256[] amounts, uint256[] feeAmounts, bytes userData) external
```

_When `flashLoan` is called on the Vault, it invokes the `receiveFlashLoan` hook on the recipient.

At the time of the call, the Vault will have transferred `amounts` for `tokens` to the recipient. Before this
call returns, the recipient must have transferred `amounts` plus `feeAmounts` for each token back to the
Vault, or else the entire flash loan will revert.

`userData` is the same value passed in the `IVault.flashLoan` call._

