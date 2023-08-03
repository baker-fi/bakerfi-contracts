// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/security/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {IVirtualMachine} from "../interfaces/core/IVirtualMachine.sol";
import {InstructionCall} from "../types/Core.sol";
import {Instruction} from "../interfaces/core/Instruction.sol";
import {IInstructionRegistry} from "../interfaces/core/IInstructionRegistry.sol";
import {ServiceRegistry} from "../core/ServiceRegistry.sol";
import {STACK_SERVICE, DS_PROXY_REGISTRY} from "./Constants.sol";
import {Stack} from "./Stack.sol";


contract VirtualMachine is IVirtualMachine, Ownable, Pausable, ReentrancyGuard {
    
    event InstructionExecuted(bytes32 nameHash, bytes data);
    
    ServiceRegistry public immutable _registry;

    constructor(
        address         owner,
        ServiceRegistry registry
    ) Ownable() Pausable() ReentrancyGuard() {
        require(owner != address(0), "Invalid Owner Address");
        _transferOwnership(owner);
        _registry = registry;
    }

    function execute(InstructionCall[] calldata calls) external payable {   
        Stack stack = Stack(_registry.getServiceFromHash(STACK_SERVICE));
        //DSProxyRegistry proxyRegistry = DSProxyRegistry(_registry.getServiceFromHash(DS_PROXY_REGISTRY));
        //require(proxyRegistry.proxies[msg.sender] != address(0), "No DS Proxy found");
        //DSProxy proxy = proxyRegistry.proxies[msg.sender];

        stack.lock();
        bytes32[] memory intructions = new bytes32[](calls.length);
        for (uint256 current = 0; current < calls.length; current++) {
            intructions[current] = calls[current].target;
        }
        stack.setInstructions(intructions);

        for (uint256 current = 0; current < calls.length; current++) {            
            address instructionAddress = _registry.getServiceFromHash(calls[current].target);
            require(instructionAddress!= address(0));
            Instruction target = Instruction(instructionAddress);
            //proxy.execute();
                  
        }
        stack.clearStorage();
        stack.unlock();
    }
}
