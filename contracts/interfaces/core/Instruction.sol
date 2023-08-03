// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

/**
 * @title Shared Instruction Executable interface
 * @notice Provides a common interface for an execute method to all Action
 */
interface Instruction {
    function execute(bytes calldata args, uint8[] memory replaceArgs) external payable;
}
