// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import { Instruction } from "../../interfaces/core/Instruction.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import { ApprovalData } from "../../types/Core.sol";

/**
 * @title SetApproval Action contract
 * @notice Transfer token from the calling contract to the destination address
 */
contract SetApproval is Instruction {
  
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  
  /**
   * @dev 
   * @param data Encoded calldata that conforms to the SetApprovalData struct
   */
  function execute(bytes calldata data) external payable override {
    ApprovalData memory approval = parseInputs(data);
    IERC20(approval.erc20Address).safeApprove(approval.delegate, approval.amount);
  }

  function parseInputs(bytes memory _callData) public pure returns (ApprovalData memory params) {
    return abi.decode(_callData, (ApprovalData));
  }
}
