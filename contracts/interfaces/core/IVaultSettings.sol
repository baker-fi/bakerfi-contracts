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
interface IVaultSettings {
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
  event MaxDepositChanged(uint256 indexed value);
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

  /**
   * @notice Retrieves the maximum deposit allowed in ETH.
   * @return The maximum deposit value in ETH.
   */
  function getMaxDeposit() external view returns (uint256);

  /**
   * @notice Sets the maximum deposit allowed in ETH.
   * @param value The maximum deposit value to be set in ETH.
   */
  function setMaxDeposit(uint256 value) external;
}
