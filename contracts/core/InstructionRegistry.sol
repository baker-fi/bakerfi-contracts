// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IInstructionRegistry} from "../interfaces/core/IInstructionRegistry.sol";

/**
 * Register Instructions that are part of program
 */
contract InstructionRegistry is IInstructionRegistry, Ownable, Pausable, ReentrancyGuard {
    
    mapping(bytes32 => address) private _instructions;
    event InstructionAdded(bytes32 indexed name);

    /**
     */
    constructor(address owner) Ownable() Pausable() ReentrancyGuard() {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
    }

    function register(bytes32 nameHash, address instruction) external override onlyOwner {
        require(nameHash != keccak256(""), "Invalid Instruction address");
        require(instruction != address(0), "Invalid Instruction address");
        _instructions[nameHash] = instruction;
        emit InstructionAdded(nameHash);
    }

    function resolve(bytes32 nameHash) external override view returns (address instruction) {
        require(
            _instructions[nameHash] != address(0),
            "Instruction does not exist"
        );
        return _instructions[nameHash];
    }
}
