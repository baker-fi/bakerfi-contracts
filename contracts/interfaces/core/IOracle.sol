// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

/**
 * @title IOracle
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev Interface for an Oracle providing price information with a precision.
 */
abstract contract IOracle {
  struct Price {
    uint256 price;
    uint256 lastUpdate;
  }

  struct PriceOptions {
    uint256 maxAge;
    uint256 maxConf;
  }

  error PriceOutdated();

  /**
   * @notice Retrieves the precision of the price information provided by the Oracle.
   * @dev This function is view-only and does not modify the state of the contract.
   * @return The precision of the Oracle's price information as a uint256.
   */
  function getPrecision() public view virtual returns (uint256);

  /**
   * @notice Retrieves the latest price information from the Oracle.
   * @dev This function is view-only and does not modify the state of the contract.
   * @return The latest price from the Oracle as a uint256.
   */
  function getLatestPrice() public view virtual returns (Price memory);

  /**
   * @notice Retrieves the latest price information from the Oracle and reverts whern the price
   * is outdated
   * @dev This function is view-only and does not modify the state of the contract.
   * @return The latest price from the Oracle as a uint256.
   */
  function getSafeLatestPrice(
    PriceOptions memory priceOptions
  ) public view virtual returns (Price memory);
}
