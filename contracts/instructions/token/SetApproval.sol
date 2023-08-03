// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Instruction} from "../../interfaces/core/Instruction.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {ApprovalData} from "../../types/Core.sol";
import {Read, Stack, UseStack} from "../../core/Stack.sol";

/**
 * @title SetApproval Action contract
 * @notice Transfer token from the calling contract to the destination address
 */
contract SetApproval is Instruction, UseStack {
    
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using Read for Stack;
    
    constructor(address registry) UseStack(registry) {}
    
    /**
     * @dev
     * @param data Encoded calldata that conforms to the SetApprovalData struct
     */
    function run(bytes calldata data, uint8[] memory replaceArgs) external payable override {
        
        ApprovalData memory approval = parseInputs(data);
        
        uint256 finalApprovalAmount = stack().readUint(
            bytes32(approval.amount),
            replaceArgs[2],
            address(this)
        );
        IERC20(approval.asset).safeApprove(
            approval.delegate,
            finalApprovalAmount
        );
    }

    function parseInputs(
        bytes memory _callData
    ) public pure returns (ApprovalData memory params) {
        return abi.decode(_callData, (ApprovalData));
    }
}