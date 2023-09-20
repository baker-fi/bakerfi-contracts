// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 *  
 * @title Laundromat Protocol Settings 
 * @author 
 * @notice The settings could only be Changed by the Owner and could be used by any contract 
 * by the system
 */

import { PERCENTAGE_PRECISION } from "./Constants.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISettings } from "../interfaces/core/ISettings.sol";


contract Settings is Ownable {

    uint256 private _withdrawalFee = 10 * 1e6; // 1%
    uint256 private _performanceFee = 10* 1e6; // 1%
    address private _feeReceiver = address(0);
    uint256 private _loanToValue =  800 * 1e6; // 80%
    // The mininum amount of profit to unroll the profit to ETH 
    uint256 private _unrollThreshold = 1e16 wei; 

    constructor(address owner) {
        _transferOwnership(owner);
    }

    function setUnrollThreshold(uint256 loanToValue) external onlyOwner {
        require(loanToValue <  PERCENTAGE_PRECISION);
        _loanToValue = loanToValue;
    }

    function getUnrollThreshold() external view returns (uint256) {
        return _unrollThreshold;
    }

    function setLoanToValue(uint256 loanToValue) external onlyOwner {
        require(loanToValue <  PERCENTAGE_PRECISION);
        _loanToValue = loanToValue;
    }

    function getLoanToValue() external view returns (uint256) {
        return _loanToValue;
    }

    function setWithdrawalFee(uint256 fee) external onlyOwner {
        require(fee <  PERCENTAGE_PRECISION);
        _withdrawalFee = fee;
    }

    function getWithdrawalFee() external view returns (uint256) {
        return _withdrawalFee;
    }

    function setPerformanceFee(uint256 fee) external onlyOwner {
        require(fee <  PERCENTAGE_PRECISION);
        _performanceFee = fee;
    }

    function getPerformanceFee() external view returns (uint256) {
        return _performanceFee;
    }

    function setFeeReceiver(address receiver) external onlyOwner {
        require(receiver != address(0));
        _feeReceiver = receiver;
    }

    function getFeeReceiver() external view returns (address) {
        return _feeReceiver;
    }

}