// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {Instruction} from "../../interfaces/core/Instruction.sol";
import {IStETH} from "../../interfaces/lido/IStETH.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

struct LidoDepositAndWrapData {
    uint256 amount;
    address receiver;
}

/**
 * @title SetApproval Action contract
 * @notice Transfer token from the calling contract to the destination address
 */
contract LidoDeposit is Instruction {
    
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    IStETH public _stETH;

    bytes32 public constant INSTRUCTION_NAME = keccak256(bytes("LidoDeposit"));

    event Deposit(address sender,uint256 amount, uint256 shares);

    constructor(IStETH stETH) {
        _stETH = stETH;
    }
    
    function execute(bytes calldata data) external payable override {
        LidoDepositAndWrapData memory inputData = parseInputs(data);
        require(msg.value != 0 && inputData.amount == msg.value, "Invalid ETH value");
        require(inputData.receiver != address(this), "Invalid Receiver address");
        uint256 stkETH = _stETH.submit{value: msg.value}(address(0));
        _stETH.transfer(inputData.receiver, stkETH);
        emit Deposit(inputData.receiver, msg.value, stkETH);

    }

    function parseInputs(
        bytes memory _callData
    ) public pure returns (LidoDepositAndWrapData memory params) {
        return abi.decode(_callData, (LidoDepositAndWrapData));
    }
}
