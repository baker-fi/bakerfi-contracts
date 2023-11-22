// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { PERCENTAGE_PRECISION, MAX_LOOPS} from "./Constants.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { ISettings } from "../interfaces/core/ISettings.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title Protocol Settings Contract
 * @author BakerFi
 * @notice The settings could only be Changed by the Owner and could be used by any contract 
 * by the system
 */
contract Settings is OwnableUpgradeable, ISettings {
    
    using EnumerableSet for EnumerableSet.AddressSet;

    uint256 private                  _withdrawalFee;    // 1%
    uint256 private                  _performanceFee;   // 1%
    address private                  _feeReceiver;      // No Fee Receiver
    uint256 private                  _loanToValue;      // 80%
    uint256 private                  _maxLoanToValue;   // 85%     
    uint8   private                  _nrLoops; 
    EnumerableSet.AddressSet private _enabledAccounts;

    event MaxLoanToValueChanged(uint256 indexed value);
    event LoanToValueChanged( uint256 indexed value);
    event WithdrawalFeeChanged(uint256 indexed value);
    event PerformanceFeeChanged( uint256 indexed value);
    event FeeReceiverChanged( address indexed value);
    event NrLoopsChanged( uint256 indexed value);
    event AccountWhiteList( address indexed account, bool enabled );


    function initialize(address initialOwner) public initializer {        
        __Context_init_unchained();
        __Ownable_init_unchained();
        require(initialOwner != address(0), "Invalid Owner Address");
        _transferOwnership(initialOwner);
        _withdrawalFee = 10 * 1e6; // 1%
        _performanceFee = 10* 1e6; // 1%
        _feeReceiver = address(0); // No Fee Receiver
        _loanToValue =  800 * 1e6; // 80%
        _maxLoanToValue = 850 * 1e6; // 85%     
        _nrLoops = 10; 
    }

    function enableAccount(address account, bool enabled ) external onlyOwner {
        if(enabled) {
            require(!_enabledAccounts.contains(account), "Already Enabled");
            require(_enabledAccounts.add(account));
        } else {
            require(_enabledAccounts.contains(account), "Not Enabled");
            require(_enabledAccounts.remove(account));
        }
        emit AccountWhiteList(account, enabled);
    }

    /* When the white list is empty, everybody is allowed */
    function isAccountEnabled(address account) external view returns (bool) {
        return _enabledAccounts.length() == 0 || _enabledAccounts.contains(account);
    }

    function setMaxLoanToValue(uint256 maxLoanToValue) external onlyOwner {
        require(maxLoanToValue > 0 );
        require(maxLoanToValue <  PERCENTAGE_PRECISION, "Invalid percentage value");
        require(maxLoanToValue >= _loanToValue, "Invalid Max Loan");
        _maxLoanToValue = maxLoanToValue;
        emit MaxLoanToValueChanged(_maxLoanToValue);
    }

    function getMaxLoanToValue() external view returns (uint256) {
        return _maxLoanToValue;
    }

    function setLoanToValue(uint256 loanToValue) external onlyOwner {
        require(loanToValue <= _maxLoanToValue, "Invalid LTV could not be higher than max");
        require(loanToValue <  PERCENTAGE_PRECISION, "Invalid percentage value");
        require(loanToValue > 0 );
        _loanToValue = loanToValue;
        emit LoanToValueChanged(_loanToValue);
    }

    function getLoanToValue() external view returns (uint256) {
        return _loanToValue;
    }

    function setWithdrawalFee(uint256 fee) external onlyOwner {
        require(fee <  PERCENTAGE_PRECISION, "Invalid percentage value");
        _withdrawalFee = fee;
        emit WithdrawalFeeChanged(_withdrawalFee);
    }

    function getWithdrawalFee() external view returns (uint256) {
        return _withdrawalFee;
    }

    function setPerformanceFee(uint256 fee) external onlyOwner {
        require(fee <  PERCENTAGE_PRECISION, "Invalid percentage value");
        _performanceFee = fee;
        emit PerformanceFeeChanged(_performanceFee);
    }

    function getPerformanceFee() external view returns (uint256) {
        return _performanceFee;
    }

    function setFeeReceiver(address receiver) external onlyOwner {
        require(receiver != address(0), "Invalid Address");
        _feeReceiver = receiver;
        emit FeeReceiverChanged(_feeReceiver);
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
        emit NrLoopsChanged( _nrLoops);
    }

}