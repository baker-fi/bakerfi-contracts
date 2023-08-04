// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;
import {Instruction} from "../../interfaces/core/Instruction.sol";
import {Read, Stack, UseStack} from "../../core/Stack.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {IWETH} from "../../interfaces/tokens/IWETH.sol";
import {WrapEthData} from "../../types/Core.sol";


contract WrapETH is Instruction, UseStack {
    using SafeMath for uint256;
    using Read for Stack;

    address private immutable _wethAddress;

    constructor(
        address wethAddress,
        address registry
    ) UseStack(registry) {
        _wethAddress = wethAddress;
    }

    function run(
        bytes calldata data,
        uint8[] memory replaceArgs
    ) external payable override {

        WrapEthData memory wrapData = parseInputs(data);
        wrapData.amount = stack().readUint(bytes32(wrapData.amount), replaceArgs[0], address(this));
        if (wrapData.amount == type(uint256).max) {
            wrapData.amount = address(this).balance;
        }

        IWETH(_wethAddress).deposit{ value: wrapData.amount }();
    }

    function parseInputs(
        bytes memory _callData
    ) public pure returns (WrapEthData memory params) {
        return abi.decode(_callData, (WrapEthData));
    }
}
