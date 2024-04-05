// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

/**
 * @title Bakerfi Settings Interface
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev The Settings contract have to implement this interface
 *
 */
interface ISettings {
    /**
     * @dev Emitted when the maximum allowed loan-to-value ratio is changed.
     *
     * This event provides information about the updated maximum loan-to-value ratio.
     *
     * @param value The new maximum allowed loan-to-value ratio.
     */
    event MaxLoanToValueChanged(uint256 indexed value);

    /**
     * @dev Emitted when the general loan-to-value ratio is changed.
     *
     * This event provides information about the updated loan-to-value ratio.
     *
     * @param value The new general loan-to-value ratio.
     */
    event LoanToValueChanged(uint256 indexed value);

    /**
     * @dev Emitted when the withdrawal fee is changed.
     *
     * This event provides information about the updated withdrawal fee.
     *
     * @param value The new withdrawal fee percentage.
     */
    event WithdrawalFeeChanged(uint256 indexed value);

    /**
     * @dev Emitted when the performance fee is changed.
     *
     * This event provides information about the updated performance fee.
     *
     * @param value The new performance fee percentage.
     */
    event PerformanceFeeChanged(uint256 indexed value);

    /**
     * @dev Emitted when the fee receiver address is changed.
     *
     * This event provides information about the updated fee receiver address.
     *
     * @param value The new fee receiver address.
     */
    event FeeReceiverChanged(address indexed value);

    /**
     * @dev Emitted when the number of loops for a specific process is changed.
     *
     * This event provides information about the updated number of loops.
     *
     * @param value The new number of loops.
     */
    event NrLoopsChanged(uint256 indexed value);

    /**
     * @dev Emitted when an account is added or removed from the whitelist.
     *
     * This event provides information about whether an account is enabled or disabled in the whitelist.
     *
     * @param account The address of the account affected by the whitelist change.
     * @param enabled A boolean indicating whether the account is enabled (true) or disabled (false) in the whitelist.
     */
    event AccountWhiteList(address indexed account, bool enabled);

    /**
     * @dev Emitted when the Maximum Deposit ETH is changed
     * @param value The new amount that is allowed to be deposited
     */
    event RebalancePriceMaxAgeChange(uint256 indexed value);

    event PriceMaxAgeChange(uint256 indexed value);

    /**
     * @dev Emitted when the Maximum Deposit ETH is changed
     * @param value The new amount that is allowed to be deposited
     */
    event MaxDepositInETHChanged(uint256 indexed value);

    /**
     * @dev Sets the maximum allowed loan-to-value ratio.
     *
     * @param maxLoanToValue The new maximum allowed loan-to-value ratio to be set.
     */
    function setMaxLoanToValue(uint256 maxLoanToValue) external;

    /**
     * @dev Retrieves the maximum allowed loan-to-value ratio.
     *
     * @return maxLoanToValue The maximum allowed loan-to-value ratio.
     */
    function getMaxLoanToValue() external view returns (uint256);
    /**
     * @dev Sets the withdrawal fee percentage.
     *     *
     * @param fee The new withdrawal fee percentage to be set.
     */
    function setWithdrawalFee(uint256 fee) external;

    /**
     * @dev Retrieves the withdrawal fee percentage.
     *
     * @return fee The withdrawal fee percentage.
     */
    function getWithdrawalFee() external view returns (uint256);
    /**
     * @dev Sets the general loan-to-value ratio.
     *
     * @param loanToValue The new general loan-to-value ratio to be set.
     */
    function setLoanToValue(uint256 loanToValue) external;
    /**
     * @dev Retrieves the general loan-to-value ratio.
     *
     * @return loanToValue The general loan-to-value ratio.
     */
    function getLoanToValue() external view returns (uint256);
    /**
     * @dev Sets the performance fee percentage.
     *
     * @param fee The new performance fee percentage to be set.
     */
    function setPerformanceFee(uint256 fee) external;

    /**
     * @dev Retrieves the performance fee percentage.
     *
     * @return fee The performance fee percentage.
     */
    function getPerformanceFee() external view returns (uint256);
    /**
     * @dev Sets the fee receiver address.
     *
     * @param receiver The new fee receiver address to be set.
     */
    function setFeeReceiver(address receiver) external;
    /**
     * @dev Retrieves the fee receiver address.
     *
     * @return receiver The fee receiver address.
     */
    function getFeeReceiver() external view returns (address);
    /**
     * @dev Retrieves the number of loops for our Recursive Staking Strategy
     *
     * @return nrLoops The number of loops.
     */
    function getNrLoops() external view returns (uint8);
    /**
     * @dev Sets the number of loops for our Recursive Staking Strategy
     *
     * @param nrLoops The new number of loops to be set.
     */
    function setNrLoops(uint8 nrLoops) external;
    /**
     * @dev Enables or disables an account in the whitelist.
     *
     * @param account The address of the account to be enabled or disabled.
     * @param enabled A boolean indicating whether the account should be enabled (true) or disabled (false) in the whitelist.
     */
    function enableAccount(address account, bool enabled) external;
    /**
     * @dev Checks if an account is enabled in the whitelist.
     *
     * @param account The address of the account to be checked.
     * @return enabled A boolean indicating whether the account is enabled (true) or not (false) in the whitelist.
     */
    function isAccountEnabled(address account) external view returns (bool);

    function getMaxDepositInETH() external view returns (uint256);

    function setMaxDepositInETH(uint256 value) external;

    function setRebalancePriceMaxAge(uint256 value) external;

    function getRebalancePriceMaxAge() external view returns (uint256);

    function setPriceMaxAge(uint256 value) external;

    function getPriceMaxAge() external view returns (uint256);
}
