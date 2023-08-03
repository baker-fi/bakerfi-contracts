// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Instruction} from "../../interfaces/core/Instruction.sol";
import {Read, Stack, UseStack} from "../../core/Stack.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {PullTokenData} from "../../types/Core.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PullToken is Instruction, UseStack {
    constructor(address registry) UseStack(registry) {}

    using SafeERC20 for IERC20;

    function run(
        bytes calldata data,
        uint8[] memory
    ) external payable override {
        
        PullTokenData memory pull = parseInputs(data);        
        
        IERC20(pull.asset).safeTransferFrom(
            pull.from,
            address(this),
            pull.amount
        );
    }

    function parseInputs(
        bytes memory _callData
    ) public pure returns (PullTokenData memory params) {
        return abi.decode(_callData, (PullTokenData));
    }
}
