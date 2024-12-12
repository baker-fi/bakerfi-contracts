// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Commands } from "./router/Commands.sol";
/**
 * @notice A command is a single action to be executed within a sequence of commands.
 */
struct Command {
  // bits (0-32) is the action
  // bits (32-63) is the Input Mapping
  // bits (64-95) are the Output Mapping
  // bits (96-255) are reserved for future use.
  uint256 action;
  // Action Arguments
  // the encoded arguments for the action
  bytes data;
}

/**
 * @title IMultiCommand Inspired in Uniswap's MultiCall
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice This contract provides a way to execute multiple commands within a single call.
 * It allows for the execution of a sequence of commands, each with its own action and data.
 * If any of the commands fail, the entire execution is reverted and an error is thrown.
 *
 * @dev This contract is designed to be inherited by other contracts that need to execute multiple commands.
 * It provides a way to dispatch individual commands and execute a sequence of commands.
 * The `msg.value` should not be trusted for any method callable from multicall.
 */
abstract contract MultiCommand {
  /// @notice The call stack size

  /**
   * @notice ExecutionFailed
   * @param commandIndex The index of the command that failed execution.
   * @param message The error message from the failed command execution.
   */
  error ExecutionFailed(uint256 commandIndex, bytes message);

  /**
   * @notice InvalidCommand
   * @param action The action of the command that is invalid.
   */
  error InvalidCommand(uint256 action);

  /**
   * @notice Dispatches a single command for execution.
   * @param action The command to be dispatched.
   * @param data The command to be dispatched.
   * @return success A boolean indicating if the command was executed successfully.
   * @return output The output data from the command execution.
   */
  function dispatch(
    uint256 action,
    bytes calldata data,
    uint256[] memory callStack
  ) internal virtual returns (bool success, bytes memory output);

  /**
   * @notice Executes a sequence of commands within the current contract.

   * @param commands The array of commands to be executed.
   * @dev This function iterates over the array of commands, dispatching each one for execution.
   * If any command fails, the entire execution is reverted and an error is thrown.
   *
   * @dev The call stack is reserved space for the call stack that is of 8 slots that could
   * be used during the execution to pull and push action outputs and inputs.
    */
  function execute(Command[] calldata commands) external payable {
    bytes memory output;
    bool success;
    uint256 numCommands = commands.length;
    // Reserve space for the call stack that is of 8 slots
    uint256[] memory callStack = new uint256[](Commands.CALL_STACK_SIZE);
    for (uint256 commandIndex = 0; commandIndex < numCommands; ) {
      (success, output) = dispatch(
        commands[commandIndex].action,
        commands[commandIndex].data,
        callStack
      );
      if (!success) {
        revert ExecutionFailed({ commandIndex: commandIndex, message: output });
      }
      unchecked {
        commandIndex++;
      }
    }
  }
}
