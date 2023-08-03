// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Instruction} from "../../interfaces/core/Instruction.sol";
import {Read, Stack, UseStack} from "../../core/Stack.sol";

struct LidoUnWrapData {
    uint256 amount;
    address receiver;
}

contract LidoUnWrap is Instruction, UseStack  {

    constructor(address registry) UseStack(registry) {}
    

    function run(bytes calldata data, uint8[] memory replaceArgs) external payable override {
        LidoUnWrapData memory inputData = parseInputs(data);       

    }

    function parseInputs(
        bytes memory _callData
    ) public pure returns (LidoUnWrapData memory params) {
        return abi.decode(_callData, (LidoUnWrapData));
    }
}