// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IVirtualMachine} from "../interfaces/core/IVirtualMachine.sol";
import {InstructionCall} from "../types/Core.sol";
import {Instruction} from "../interfaces/core/Instruction.sol";
import {IInstructionRegistry} from "../interfaces/core/IInstructionRegistry.sol";

contract VirtualMachine is IVirtualMachine, Ownable, Pausable, ReentrancyGuard {
    address private _instructionRegistry;

    event InstructionExecuted(bytes32 nameHash, bytes data);

    constructor(
        address owner,
        address instructionRegistry
    ) Ownable() Pausable() ReentrancyGuard() {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
        _instructionRegistry = instructionRegistry;
    }

    function execute(InstructionCall[] calldata calls) external payable {
        for (uint256 current = 0; current < calls.length; current++) {
            IInstructionRegistry registry = IInstructionRegistry(_instructionRegistry);
            address instructionAddress = registry.resolve(calls[current].instruction);
            require(instructionAddress!= address(0));
            Instruction target = Instruction(instructionAddress);
            target.execute(calls[current].args);            
        }
    }
}
