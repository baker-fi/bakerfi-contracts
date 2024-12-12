# Solidity API

## Command

A command is a single action to be executed within a sequence of commands.

```solidity
struct Command {
  uint256 action;
  bytes data;
}
```

## MultiCommand

This contract provides a way to execute multiple commands within a single call.
It allows for the execution of a sequence of commands, each with its own action and data.
If any of the commands fail, the entire execution is reverted and an error is thrown.

_This contract is designed to be inherited by other contracts that need to execute multiple commands.
It provides a way to dispatch individual commands and execute a sequence of commands.
The `msg.value` should not be trusted for any method callable from multicall._

### ExecutionFailed

```solidity
error ExecutionFailed(uint256 commandIndex, bytes message)
```

ExecutionFailed

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| commandIndex | uint256 | The index of the command that failed execution. |
| message | bytes | The error message from the failed command execution. |

### InvalidCommand

```solidity
error InvalidCommand(uint256 action)
```

InvalidCommand

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| action | uint256 | The action of the command that is invalid. |

### dispatch

```solidity
function dispatch(uint256 action, bytes data, uint256[] callStack) internal virtual returns (bool success, bytes output)
```

Dispatches a single command for execution.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| action | uint256 | The command to be dispatched. |
| data | bytes | The command to be dispatched. |
| callStack | uint256[] |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| success | bool | A boolean indicating if the command was executed successfully. |
| output | bytes | The output data from the command execution. |

### execute

```solidity
function execute(struct Command[] commands) external payable
```

Executes a sequence of commands within the current contract.

_This function iterates over the array of commands, dispatching each one for execution.
If any command fails, the entire execution is reverted and an error is thrown.

The call stack is reserved space for the call stack that is of 8 slots that could
be used during the execution to pull and push action outputs and inputs._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| commands | struct Command[] | The array of commands to be executed. |

