// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Instruction} from "../../interfaces/core/Instruction.sol";
import {Read, Stack, UseStack} from "../../core/Stack.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IERC3156FlashLender} from "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {IERC3156FlashBorrower} from "@openzeppelin/contracts/interfaces/IERC3156FlashBorrower.sol";
import {FlashloanData, FlashloanProvider} from "../../types/Core.sol";

contract FlashLoan is Instruction, UseStack {
    using SafeMath for uint256;
    using Read for Stack;

    constructor(address registry) UseStack(registry) {}

    function run(bytes calldata data, uint8[] memory replaceArgs) external payable override {
        
    }

    function parseInputs(bytes memory _callData) public pure returns (FlashloanData memory params) {
        return abi.decode(_callData, (FlashloanData));
    }
}
