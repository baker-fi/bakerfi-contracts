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
interface IStrategySettings {
  /**
   * @dev Emitted when the price max age is changed
   * @param value The new price max age
   */
  event PriceMaxAgeChanged(uint256 indexed value);

  /**
   * @dev Emitted when the price max conf is changed
   * @param value The new price max conf
   */
  event PriceMaxConfChanged(uint256 indexed value);

  /**
   * @notice Sets the maximum age of the price data.
   * @param value The maximum age in seconds.
   */
  function setPriceMaxAge(uint256 value) external;

  /**
   * @notice Retrieves the maximum age of the price data.
   * @return The maximum age in seconds.
   */
  function getPriceMaxAge() external view returns (uint256);

  /**
   * @notice Sets the maximum confidence level for the price data in percentage
   * @param value The maximum confidence level.
   */
  function setPriceMaxConf(uint256 value) external;

  /**
   * @notice Retrieves the maximum confidence level for the price data.
   * @return The maximum confidence level.
   */
  function getPriceMaxConf() external view returns (uint256);
}
