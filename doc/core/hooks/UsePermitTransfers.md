# Solidity API

## UsePermitTransfers

### pullTokensWithPermit

```solidity
function pullTokensWithPermit(contract IERC20Permit token, uint256 amount, address owner, uint256 deadline, uint8 v, bytes32 r, bytes32 s) internal virtual
```

_Allows the parent contractto pull tokens from the user using ERC20Permit._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20Permit | The address of the ERC20 token. |
| amount | uint256 | The amount of tokens to pull. |
| owner | address | The address of the token owner. |
| deadline | uint256 | The deadline for the permit. |
| v | uint8 | The recovery byte of the signature. |
| r | bytes32 | The output from the signing process (part of the signature). |
| s | bytes32 | The output from the signing process (part of the signature). |

## UsePermitTransfersMock

### test__pullTokensWithPermit

```solidity
function test__pullTokensWithPermit(contract IERC20Permit token, uint256 amount, address owner, uint256 deadline, uint8 v, bytes32 r, bytes32 s) public
```

_This function is a test wrapper for the internal function pullTokensWithPermit.
It allows for external calls to simulate the pulling of tokens using ERC20Permit._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20Permit | The address of the ERC20 token that supports permit. |
| amount | uint256 | The amount of tokens to pull. |
| owner | address | The address of the token owner. |
| deadline | uint256 | The deadline for the permit. |
| v | uint8 | The recovery byte of the signature. |
| r | bytes32 | The output from the signing process (part of the signature). |
| s | bytes32 | The output from the signing process (part of the signature). |

