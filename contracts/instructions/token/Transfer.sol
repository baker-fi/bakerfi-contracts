// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Instruction} from "../../interfaces/core/Instruction.sol";
import {TransferData} from "../../types/Core.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Read, Stack, UseStack} from "../../core/Stack.sol";

/**
 * @title SendToken Action contract
 * @notice Transfer token from the calling contract to the destination address
 */
contract Transfer is Instruction, UseStack {
    
    using SafeERC20 for IERC20;
    using Read for Stack;

    bytes32 public constant INSTRUCTION_NAME = keccak256(bytes("Transfer"));

    constructor(address _registry) UseStack(_registry) {}

    /**
     * @param data Encoded calldata that conforms to the SendTokenData struct
     */
    function run(bytes calldata data, uint8[] memory replaceArgs) external payable override {
        TransferData memory send = parseInputs(data);
        send.amount = stack().readUint(bytes32(send.amount), replaceArgs[2], address(this));
        if (msg.value > 0) {
            payable(send.to).transfer(msg.value);
        } else {
            if (send.amount == type(uint256).max) {
                send.amount = IERC20(send.asset).balanceOf(
                    address(this)
                );
            }
            IERC20(send.asset).safeTransfer(send.to, send.amount);
        }
    }

    function parseInputs(
        bytes memory _callData
    ) public pure returns (TransferData memory params) {
        return abi.decode(_callData, (TransferData));
    }
}
