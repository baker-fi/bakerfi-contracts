// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Instruction} from "../../interfaces/core/Instruction.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {ReturnFundsData} from "../../types/Core.sol";
import {IDSProxy} from "../../interfaces/ds/IDSProxy.sol";
import {ETH} from "../../core/Constants.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ReturnFunds Action contract
 * @notice Returns funds sitting on a user's proxy to a user's EOA
 */
contract ReturnFunds is Instruction {
    using SafeERC20 for IERC20;

    /**
     * @param data Encoded calldata that conforms to the ReturnFundsData struct
     */
    function run(
        bytes calldata data,
        uint8[] memory
    ) external payable override {
        ReturnFundsData memory returnData = abi.decode(data, (ReturnFundsData));
        address owner = IDSProxy(payable(address(this))).owner();
        uint256 amount;

        if (returnData.asset == ETH) {
            amount = address(this).balance;
            payable(owner).transfer(amount);
        } else {
            amount = IERC20(returnData.asset).balanceOf(address(this));
            IERC20(returnData.asset).safeTransfer(owner, amount);
        }
    }
}
