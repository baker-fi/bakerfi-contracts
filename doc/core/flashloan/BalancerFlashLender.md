# Solidity API

## BalancerFlashLender

_This contract implements the ERC-3156 Flash Lender interface and serves as
"Adapter" contract for the balancer flash loan interface. This approach allows us
to have a static interface independent of the flash loan provider._

### InvalidVaultAddress

```solidity
error InvalidVaultAddress()
```

### InvalidBorrower

```solidity
error InvalidBorrower()
```

### InvalidFlashLoadLender

```solidity
error InvalidFlashLoadLender()
```

### InvalidTokenList

```solidity
error InvalidTokenList()
```

### InvalidAmountList

```solidity
error InvalidAmountList()
```

### InvalidFeesAmount

```solidity
error InvalidFeesAmount()
```

### BorrowerCallbackFailed

```solidity
error BorrowerCallbackFailed()
```

### NoAllowanceToPayDebt

```solidity
error NoAllowanceToPayDebt()
```

### CALLBACK_SUCCESS

```solidity
bytes32 CALLBACK_SUCCESS
```

### constructor

```solidity
constructor(address balancerVault) public
```

### maxFlashLoan

```solidity
function maxFlashLoan(address token) external view returns (uint256)
```

_Function to get the maximum flash loan amount available for a given token._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | address | The address of the token for which the maximum flash loan amount is queried. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | The maximum flash loan amount available for the specified token. |

### flashFee

```solidity
function flashFee(address, uint256 amount) external view returns (uint256)
```

### flashLoan

```solidity
function flashLoan(contract IERC3156FlashBorrowerUpgradeable borrower, address token, uint256 amount, bytes data) external returns (bool)
```

_Function to initiate a flash loan from the Balancer Pool_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| borrower | contract IERC3156FlashBorrowerUpgradeable | The address of the flash loan receiver. |
| token | address | The address of the token being borrowed. |
| amount | uint256 | The amount of tokens to be borrowed. |
| data | bytes | Arbitrary data to be passed to the flash loan recipient. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | The unique identifier for the flash loan operation. |

### receiveFlashLoan

```solidity
function receiveFlashLoan(address[] tokens, uint256[] amounts, uint256[] feeAmounts, bytes userData) external
```

_Function to receive flash loans from the BalancerFlashLender contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokens | address[] | An array of token addresses representing the borrowed tokens. |
| amounts | uint256[] | An array of amounts representing the borrowed token amounts. |
| feeAmounts | uint256[] | An array of fee amounts charged for each flash loan. |
| userData | bytes | Arbitrary data passed from the BalancerFlashLender contract. |

