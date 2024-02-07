// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

/**
 * @title IOracle
 * 
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 * 
 * @dev Interface for an Oracle providing price information with a precision.
 */
interface IOracle {
    /**
     * @notice Retrieves the precision of the price information provided by the Oracle.
     * @dev This function is view-only and does not modify the state of the contract.
     * @return The precision of the Oracle's price information as a uint256.
     */
    function getPrecision() external view returns (uint256);

    /**
     * @notice Retrieves the latest price information from the Oracle.
     * @dev This function is view-only and does not modify the state of the contract.
     * @return The latest price from the Oracle as a uint256.
     */
    function getLatestPrice() external view returns (uint256);
}