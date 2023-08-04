// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;
import {InstructionCall} from "../../types/Core.sol";

interface IVirtualMachine {
    function execute(InstructionCall[] calldata data) external payable;
}
