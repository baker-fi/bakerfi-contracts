// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

/**
 * @title These are global constants used by other contracts
 */

/**
 * @dev Constant representing the maximum allowed loan-to-value ratio.
 *
 * This constant holds the value 1e9, representing the maximum allowed loan-to-value ratio as 100%.
 * It is used to limit the loan-to-value ratio for specific processes.
 */
uint256 constant MAX_LOAN_TO_VALUE = 1e9; // 100%
/**
 * @dev Constant representing the maximum allowed number of loops.
 *
 * This constant holds the value 20, representing the maximum allowed number of loops.
 * It is used to limit the number of loops for a specific process.
 */
uint8 constant MAX_LOOPS = 20; // 100%
/**
 * @dev Constant representing the precision for percentage values.
 *
 * This constant holds the value 1e9, representing the precision for percentage values.
 * It is used for calculations involving percentage precision.
 */
uint256 constant PERCENTAGE_PRECISION = 1e9;
address constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;
bytes32 constant ADMIN_ROLE = 0x00;
bytes32 constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 constant VAULT_MANAGER_ROLE = keccak256("VAULT_MANAGER_ROLE");
