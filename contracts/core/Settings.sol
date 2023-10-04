// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 *  
 * @title BakerFi Protocol Settings 
 * @author 
 * @notice The settings could only be Changed by the Owner and could be used by any contract 
 * by the system
 */

import { PERCENTAGE_PRECISION, MAX_LOOPS} from "./Constants.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ISettings } from "../interfaces/core/ISettings.sol";


contract Settings is Ownable, ISettings {

    uint256 private _withdrawalFee = 10 * 1e6; // 1%
    uint256 private _performanceFee = 10* 1e6; // 1%
    address private _feeReceiver = address(0); // No Fee Receiver
    uint256 private _loanToValue =  800 * 1e6; // 80%
    uint256 private _maxLoanToValue =  850 * 1e6; // 85%     
    uint8   private _nrLoops = 10; 

    constructor(address owner) {
        _transferOwnership(owner);
    }

    function setMaxLoanToValue(uint256 maxLoanToValue) external onlyOwner {
        require(maxLoanToValue <  PERCENTAGE_PRECISION, "Invalid percentage value");
        require(maxLoanToValue >= _loanToValue, "Invalid Max Loan");
        _maxLoanToValue = maxLoanToValue;
    }

    function getMaxLoanToValue() external view returns (uint256) {
        return _maxLoanToValue;
    }

    function setLoanToValue(uint256 loanToValue) external onlyOwner {
        require(loanToValue <  PERCENTAGE_PRECISION, "Invalid percentage value");
        _loanToValue = loanToValue;
    }

    function getLoanToValue() external view returns (uint256) {
        return _loanToValue;
    }

    function setWithdrawalFee(uint256 fee) external onlyOwner {
        require(fee <  PERCENTAGE_PRECISION, "Invalid percentage value");
        _withdrawalFee = fee;
    }

    function getWithdrawalFee() external view returns (uint256) {
        return _withdrawalFee;
    }

    function setPerformanceFee(uint256 fee) external onlyOwner {
        require(fee <  PERCENTAGE_PRECISION, "Invalid percentage value");
        _performanceFee = fee;
    }

    function getPerformanceFee() external view returns (uint256) {
        return _performanceFee;
    }

    function setFeeReceiver(address receiver) external onlyOwner {
        require(receiver != address(0), "Invalid Address");
        _feeReceiver = receiver;
    }

    function getFeeReceiver() external view returns (address) {
        return _feeReceiver;
    }


     function getNrLoops() external view returns (uint8) {
        return _nrLoops;
    }

    function setNrLoops(uint8 nrLoops) external onlyOwner {
        require(nrLoops <  MAX_LOOPS, "Invalid Number of Loops");
        _nrLoops = nrLoops;
    }

}