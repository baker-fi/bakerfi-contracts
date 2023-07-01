// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

/**
 */
interface IInstructionRegistry {
    function register(bytes32 nameHash, address instruction) external;
    function resolve(bytes32 nameHash) external view returns (address instruction);
}
