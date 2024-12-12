// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { PERCENTAGE_PRECISION } from "../Constants.sol";
import { IStrategySettings } from "../../interfaces/core/IStrategySettings.sol";
import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { GovernableOwnable } from "../GovernableOwnable.sol";

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
abstract contract StrategySettings is GovernableOwnable, IStrategySettings {
  error InvalidOwner();
  error InvalidValue();
  error InvalidPercentage();
  error InvalidAddress();

  using EnumerableSet for EnumerableSet.AddressSet;

  /// @dev Storage slot for price max age
  bytes32 private constant PRICE_MAX_AGE_SLOT = keccak256("bakerfi.strategy.price.max.age");

  /// @dev Storage slot for price max confidence
  bytes32 private constant PRICE_MAX_CONF_SLOT = keccak256("bakerfi.strategy.price.max.conf");

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
   * Requirements:
   * - The provided owner address must not be the zero address.
   */
  function _initializeStrategySettings() internal onlyInitializing {
    _setUint256(PRICE_MAX_AGE_SLOT, 60 minutes);
    _setUint256(PRICE_MAX_CONF_SLOT, 0);
  }

  /**
   * Sets the max age for price retrievals
   * @notice Sets the maximum age of the price data.
   *
   * @dev Setting the maxAge to 0 is quite dangerous and the protocol could be working
   * with stale prices
   * @param value The maximum age in seconds.
   */
  function setPriceMaxAge(uint256 value) external onlyGovernor {
    _setUint256(PRICE_MAX_AGE_SLOT, value);
    emit PriceMaxAgeChanged(value);
  }

  /**
   * @notice Retrieves the maximum age of the price data.
   * @return The maximum age in seconds.
   */
  function getPriceMaxAge() public view returns (uint256) {
    return _getUint256(PRICE_MAX_AGE_SLOT);
  }

  /**
   * @notice Sets the maximum confidence level for the price data in percentage
   * @param value The maximum confidence level.
   */
  function setPriceMaxConf(uint256 value) external onlyGovernor {
    if (value > PERCENTAGE_PRECISION) revert InvalidPercentage();
    _setUint256(PRICE_MAX_CONF_SLOT, value);
    emit PriceMaxConfChanged(value);
  }

  /**
   * @notice Retrieves the maximum confidence level for the price data.
   * @return The maximum confidence level.
   */
  function getPriceMaxConf() public view returns (uint256) {
    return _getUint256(PRICE_MAX_CONF_SLOT);
  }

  // Add helper functions for storage slots
  function _setUint256(bytes32 slot, uint256 value) private {
    assembly {
      sstore(slot, value)
    }
  }

  function _getUint256(bytes32 slot) private view returns (uint256 value) {
    assembly {
      value := sload(slot)
    }
  }
}
