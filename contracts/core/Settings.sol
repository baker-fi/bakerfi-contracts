// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {PERCENTAGE_PRECISION, MAX_LOOPS} from "./Constants.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {ISettings} from "../interfaces/core/ISettings.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
/**
 * @title BakerFI Settings(⚙️) Contract
 *
 * @notice The settings could only be changed by the Owner and could be used by any contract by the system.
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev The `Settings` contract is used to manage protocol settings.
 * It extends the `OwnableUpgradeable` contract and implements the `ISettings` interface.
 * The settings can only be changed by the owner and can be utilized by any contract within the system.
 *
 * This contract is going to be used by any service on the Bakerfi system to retrieve
 * the fees, basic configuration parameters and the list of whitelisted adresess that can
 * interact with the system
 */
contract Settings is OwnableUpgradeable, ISettings {
    error InvalidOwner();
    error WhiteListAlreadyEnabled();
    error WhiteListFailedToAdd();
    error WhiteListNotEnabled();
    error WhiteListFailedToRemove();
    error InvalidValue();
    error InvalidPercentage();
    error InvalidMaxLoanToValue();
    error InvalidAddress();
    error InvalidLoopCount();

    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @dev The withdrawal fee percentage
     *
     * This private state variable holds the withdrawal fee percentage, represented as an integer.
     *
     * Default is 1%
     */
    uint256 private _withdrawalFee; // %

    /**
     * @dev The performance fee percentage.
     *
     * This private state variable holds the performance fee percentage, represented as an integer.
     */
    uint256 private _performanceFee; // 1%

    /**
     * @dev The address of the fee receiver.
     *
     * This private state variable holds the address of the fee receiver.
     * If set to the zero address, there is no fee receiver.
     */
    address private _feeReceiver; // No Fee Receiver

    /**
     * @dev The loan-to-value ratio for managing loans.
     *
     * This private state variable holds the loan-to-value ratio, represented as an integer.
     */
    uint256 private _loanToValue; // 80%

    /**
     * @dev The maximum allowed loan-to-value ratio.
     *
     * This private state variable holds the maximum allowed loan-to-value ratio, represented as an integer.
     */
    uint256 private _maxLoanToValue; // 85%

    /**
     * @dev The number of loops for a specific process.
     *
     * This private state variable holds the number of loops for a specific process, represented as an unsigned integer.
     */
    uint8 private _nrLoops;

    /**
     * @dev The set of enabled accounts.
     *
     * This private state variable is an EnumerableSet of addresses representing the set of enabled accounts.
     */
    EnumerableSet.AddressSet private _enabledAccounts;

    /**
     * @dev Max Allowed ETH Deposit per Wallet
     */
    uint256 private _maxDepositInETH;

    /**
     * @dev Max Age for sensitive price operations
     */
    uint256 private _oraclePriceMaxAge;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializes the contract.
     *
     * This function is used for the initial setup of the contract, setting the owner, withdrawal fee,
     * performance fee, fee receiver, loan-to-value ratio, maximum loan-to-value ratio, and the number of loops.
     *
     * @param initialOwner The address to be set as the initial owner of the contract.
     *
     * Requirements:
     * - The provided owner address must not be the zero address.
     */
    function initialize(address initialOwner) public initializer {
        __Context_init_unchained();
        __Ownable_init_unchained();
        if (initialOwner == address(0)) revert InvalidOwner();
        _transferOwnership(initialOwner);
        _withdrawalFee = 10 * 1e6; // 1%
        _performanceFee = 10 * 1e6; // 1%
        _feeReceiver = address(0); // No Fee Receiver
        _loanToValue = 800 * 1e6; // 80%
        _maxLoanToValue = 850 * 1e6; // 85%
        _nrLoops = 10;
        _maxDepositInETH = 0;
        _oraclePriceMaxAge = 300; // 5 Minutes Prices
    }

    /**
     * @dev Enables or disables an account in the whitelist.
     *
     * This function can only be called by the owner and is used to enable or disable an account
     * in the whitelist. Emits an {AccountWhiteList} event upon successful update.
     *
     * @param account The address of the account to be enabled or disabled.
     * @param enabled A boolean indicating whether the account should be enabled (true) or disabled (false) in the whitelist.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     */
    function enableAccount(address account, bool enabled) external onlyOwner {
        if (enabled) {
            if (_enabledAccounts.contains(account)) revert WhiteListAlreadyEnabled();
            if (!_enabledAccounts.add(account)) revert WhiteListFailedToAdd();
        } else {
            if (!_enabledAccounts.contains(account)) revert WhiteListNotEnabled();
            if (!_enabledAccounts.remove(account)) revert WhiteListFailedToRemove();
        }
        emit AccountWhiteList(account, enabled);
    }

    /**
     * @dev Checks if an account is enabled in the whitelist.
     *
     * This function is externally callable and returns a boolean indicating whether the specified account
     * is enabled in the whitelist.
     *
     * @param account The address of the account to be checked.
     * @return enabled A boolean indicating whether the account is enabled (true) or not (false) in the whitelist.
     */
    function isAccountEnabled(address account) external view returns (bool) {
        return _enabledAccounts.length() == 0 || _enabledAccounts.contains(account);
    }

    /**
     * @dev Sets the maximum allowed loan-to-value ratio.
     *
     * This function can only be called by the owner and is used to update the maximum allowed loan-to-value ratio.
     * Emits a {MaxLoanToValueChanged} event upon successful update.
     *
     * @param maxLoanToValue The new maximum allowed loan-to-value ratio to be set.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     */
    function setMaxLoanToValue(uint256 maxLoanToValue) external onlyOwner {
        if (maxLoanToValue == 0) revert InvalidValue();
        if (maxLoanToValue > PERCENTAGE_PRECISION) revert InvalidPercentage();
        if (maxLoanToValue < _loanToValue) revert InvalidMaxLoanToValue();
        _maxLoanToValue = maxLoanToValue;
        emit MaxLoanToValueChanged(_maxLoanToValue);
    }

    /**
     * @dev Retrieves the maximum allowed loan-to-value ratio.
     *
     * This function is externally callable and returns the maximum allowed loan-to-value ratio.
     *
     * @return maxLoanToValue The maximum allowed loan-to-value ratio.
     */
    function getMaxLoanToValue() external view returns (uint256) {
        return _maxLoanToValue;
    }

    /**
     * @dev Sets the general loan-to-value ratio.
     *
     * This function can only be called by the owner and is used to update the general loan-to-value ratio.
     * Emits a {LoanToValueChanged} event upon successful update.
     *
     * @param loanToValue The new general loan-to-value ratio to be set.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     * - The new loan-to-value ratio must be less than or equal to the maximum allowed loan-to-value ratio.
     * - The new loan-to-value ratio must be a valid percentage value.
     * - The new loan-to-value ratio must be greater than 0.
     */
    function setLoanToValue(uint256 loanToValue) external onlyOwner {
        if (loanToValue > _maxLoanToValue) revert InvalidValue();
        if (loanToValue > PERCENTAGE_PRECISION) revert InvalidPercentage();
        if (loanToValue == 0) revert InvalidValue();
        _loanToValue = loanToValue;
        emit LoanToValueChanged(_loanToValue);
    }

    /**
     * @dev Retrieves the general loan-to-value ratio.
     *
     * This function is externally callable and returns the general loan-to-value ratio.
     *
     * @return loanToValue The general loan-to-value ratio.
     */
    function getLoanToValue() external view returns (uint256) {
        return _loanToValue;
    }

    /**
     * @dev Sets the withdrawal fee percentage.
     *
     * This function can only be called by the owner and is used to update the withdrawal fee percentage.
     * Emits a {WithdrawalFeeChanged} event upon successful update.
     *
     * @param fee The new withdrawal fee percentage to be set.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     * - The new withdrawal fee percentage must be a valid percentage value.
     */
    function setWithdrawalFee(uint256 fee) external onlyOwner {
        if (fee > PERCENTAGE_PRECISION) revert InvalidPercentage();
        _withdrawalFee = fee;
        emit WithdrawalFeeChanged(_withdrawalFee);
    }

    /**
     * @dev Retrieves the withdrawal fee percentage.
     *
     * This function is externally callable and returns the withdrawal fee percentage.
     *
     * @return fee The withdrawal fee percentage.
     */
    function getWithdrawalFee() external view returns (uint256) {
        return _withdrawalFee;
    }

    /**
     * @dev Sets the performance fee percentage.
     *
     * This function can only be called by the owner and is used to update the performance fee percentage.
     * Emits a {PerformanceFeeChanged} event upon successful update.
     *
     * @param fee The new performance fee percentage to be set.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     * - The new performance fee percentage must be a valid percentage value.
     */
    function setPerformanceFee(uint256 fee) external onlyOwner {
        if (fee > PERCENTAGE_PRECISION) revert InvalidPercentage();
        _performanceFee = fee;
        emit PerformanceFeeChanged(_performanceFee);
    }

    /**
     * @dev Retrieves the performance fee percentage.
     *
     * This function is externally callable and returns the performance fee percentage.
     *
     * @return fee The performance fee percentage.
     */
    function getPerformanceFee() external view returns (uint256) {
        return _performanceFee;
    }
    /**
     * @dev Sets the fee receiver address.
     *
     * This function can only be called by the owner and is used to update the fee receiver address.
     * Emits a {FeeReceiverChanged} event upon successful update.
     *
     * @param receiver The new fee receiver address to be set.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     * - The new fee receiver address must not be the zero address.
     */
    function setFeeReceiver(address receiver) external onlyOwner {
        if (receiver == address(0)) revert InvalidAddress();
        _feeReceiver = receiver;
        emit FeeReceiverChanged(_feeReceiver);
    }

    /**
     * @dev Retrieves the fee receiver address.
     *
     * This function is externally callable and returns the fee receiver address.
     *
     * @return receiver The fee receiver address.
     */
    function getFeeReceiver() external view returns (address) {
        return _feeReceiver;
    }

    /**
     * @dev Retrieves the number of loops for our Recursive Staking Strategy
     *
     * This function is externally callable and returns the number of loops configured.
     *
     * @return nrLoops The number of loops.
     */
    function getNrLoops() external view returns (uint8) {
        return _nrLoops;
    }

    /**
     * @dev Sets the number of loops for our Recursive Staking Strategy
     *
     * This function can only be called by the owner and is used to update the number of loops.
     * Emits an {NrLoopsChanged} event upon successful update.
     *
     * @param nrLoops The new number of loops to be set.
     *
     * Requirements:
     * - The caller must be the owner of the contract.
     * - The new number of loops must be less than the maximum allowed number of loops.
     */
    function setNrLoops(uint8 nrLoops) external onlyOwner {
        if (nrLoops > MAX_LOOPS) revert InvalidLoopCount();
        _nrLoops = nrLoops;
        emit NrLoopsChanged(_nrLoops);
    }

    function getMaxDepositInETH() external view returns (uint256) {
        return _maxDepositInETH;
    }

    function setMaxDepositInETH(uint256 value) external onlyOwner {
        _maxDepositInETH = value;
        emit MaxDepositInETHChanged(value);
    }

    function setOraclePriceMaxAge(uint256 value) external onlyOwner {
        _oraclePriceMaxAge = value;
        emit OraclePriceMaxAgeChanged(value);
    }

    function getOraclePriceMaxAge() external view returns (uint256) {
        return _oraclePriceMaxAge;
    }
}
