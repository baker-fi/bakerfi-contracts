// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IMulticall } from "../../interfaces/core/IMulticall.sol";

/**
 * @title Use Multicall
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 * @notice This contract provides a multicall function to execute multiple functions within the current contract.
 */
abstract contract UseMulticall is IMulticall {
  /**
   * @notice Executes multiple functions within the current contract and returns the data from all of them if they all succeed.
   * @dev The `msg.value` should not be trusted for any method callable from multicall.
   * @param data The encoded function data for each of the calls to make to this contract.
   * @return results The results from each of the calls passed in via data.
   */
  function multicall(
    bytes[] calldata data
  ) public payable override returns (bytes[] memory results) {
    results = new bytes[](data.length);
    for (uint256 i = 0; i < data.length; i++) {
      (bool success, bytes memory result) = address(this).delegatecall(data[i]);
      if (!success) {
        // If the transaction failed silently, then revert without a revert message
        if (result.length < 68) revert();
        assembly {
          // Slice the sighash.
          result := add(result, 0x04)
        }
        // All that remains is the revert string
        revert(abi.decode(result, (string)));
      }
      results[i] = result;
    }
  }
}
