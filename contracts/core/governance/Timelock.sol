// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { TimelockController } from "@openzeppelin/contracts/governance/TimelockController.sol";

contract Timelock is TimelockController {
  constructor(
    uint256 _minDelay,
    address[] memory _proposers,
    address[] memory _executors
  ) TimelockController(_minDelay, _proposers, _executors, msg.sender) {}
}
