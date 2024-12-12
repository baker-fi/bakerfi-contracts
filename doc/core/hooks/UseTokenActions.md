# Solidity API

## UseTokenActions

This Hook provides functions to interact with ERC20 tokens and
could be included in other contracts to provide token actions.

### InvalidToken

```solidity
error InvalidToken()
```

_Error thrown when an invalid token address is provided._

### InvalidRecipient

```solidity
error InvalidRecipient()
```

_Error thrown when an invalid recipient address is provided._

### NotEnoughAllowance

```solidity
error NotEnoughAllowance()
```

_Error thrown when the allowance is not enough._

### pullToken

```solidity
function pullToken(contract IERC20 token, uint256 amount) internal virtual
```

_Pulls a specified amount of tokens from the message sender to this contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The ERC20 token to pull. |
| amount | uint256 | The amount of tokens to pull. |

### pullTokenFrom

```solidity
function pullTokenFrom(contract IERC20 token, address from, uint256 amount) internal virtual
```

_Pulls a specified amount of tokens from a specified address to this contract._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The ERC20 token to pull. |
| from | address | The address from which to pull the tokens. |
| amount | uint256 | The amount of tokens to pull. |

### pushToken

```solidity
function pushToken(contract IERC20 token, address to, uint256 amount) internal virtual
```

_Pushes a specified amount of tokens from this contract to a specified address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The ERC20 token to push. |
| to | address | The address to which to push the tokens. |
| amount | uint256 | The amount of tokens to push. |

### pushTokenFrom

```solidity
function pushTokenFrom(contract IERC20 token, address from, address to, uint256 amount) internal virtual
```

_Pushes a specified amount of tokens from a specified address to another specified address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The ERC20 token to push. |
| from | address | The address from which to push the tokens. |
| to | address | The address to which to push the tokens. |
| amount | uint256 | The amount of tokens to push. |

### sweepTokens

```solidity
function sweepTokens(contract IERC20 token, address to) internal virtual returns (uint256 sweptAmount)
```

_Sweeps all tokens from this contract to a specified address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| token | contract IERC20 | The ERC20 token to sweep. |
| to | address | The address to which to sweep the tokens. |

## UseTokenActionsMock

### test__pullToken

```solidity
function test__pullToken(contract IERC20 token, uint256 amount) public
```

### test__pullTokenFrom

```solidity
function test__pullTokenFrom(contract IERC20 token, address from, uint256 amount) public
```

### test__pushToken

```solidity
function test__pushToken(contract IERC20 token, address to, uint256 amount) public
```

### test__pushTokenFrom

```solidity
function test__pushTokenFrom(contract IERC20 token, address from, address to, uint256 amount) public
```

### test__sweepTokens

```solidity
function test__sweepTokens(contract IERC20 token, address to) public returns (uint256)
```

