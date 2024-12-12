// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.24;

import { Commands } from "../core/router/Commands.sol";

/**
 * @notice Mock for the Commands contract
 */
contract CommandMock {
  function pullInputParam(
    uint256[] memory callStack,
    uint256 value,
    uint64 inputMapping,
    uint8 position
  ) external pure returns (uint256) {
    return Commands.pullInputParam(callStack, value, inputMapping, position);
  }

  function pushOutputParam(
    uint256[] memory callStack,
    uint256 value,
    uint64 outputMapping,
    uint8 position
  ) external pure returns (uint256[] memory) {
    Commands.pushOutputParam(callStack, value, outputMapping, position);
    return callStack;
  }
}
