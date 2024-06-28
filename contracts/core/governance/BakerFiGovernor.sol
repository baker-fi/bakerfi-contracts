// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Governor, IGovernor, IERC165 } from "@openzeppelin/contracts/governance/Governor.sol";
import { GovernorCompatibilityBravo } from "@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo.sol";
import { GovernorVotes, IVotes } from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import { GovernorVotesQuorumFraction } from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import { GovernorTimelockControl, TimelockController } from "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract BakerFiGovernor is
  Governor,
  GovernorCompatibilityBravo,
  GovernorVotes,
  GovernorVotesQuorumFraction,
  GovernorTimelockControl
{
  uint8 private constant _MIN_QUORUM = 10; // 4%
  uint256 private constant _VOTING_DELAY = 1 days; // 1 day
  uint256 private constant _VOTING_PERIOD = 1 weeks; // 1 day

  constructor(
    IVotes _token,
    TimelockController _timelock
  )
    Governor("BakerFiGovernor")
    GovernorVotes(_token)
    GovernorVotesQuorumFraction(_MIN_QUORUM)
    GovernorTimelockControl(_timelock)
  {}

  function votingDelay() public pure override returns (uint256) {
    return _VOTING_DELAY; // 1 day
  }

  function votingPeriod() public pure override returns (uint256) {
    return _VOTING_PERIOD; // 1 week
  }

  function proposalThreshold() public pure override returns (uint256) {
    return 0;
  }

  // The functions below are overrides required by Solidity.

  function state(
    uint256 proposalId
  ) public view override(Governor, IGovernor, GovernorTimelockControl) returns (ProposalState) {
    return super.state(proposalId);
  }

  function propose(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    string memory description
  ) public override(Governor, GovernorCompatibilityBravo, IGovernor) returns (uint256) {
    return super.propose(targets, values, calldatas, description);
  }

  function cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) public override(Governor, GovernorCompatibilityBravo, IGovernor) returns (uint256) {
    return super.cancel(targets, values, calldatas, descriptionHash);
  }

  function _execute(
    uint256 proposalId,
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal override(Governor, GovernorTimelockControl) {
    super._execute(proposalId, targets, values, calldatas, descriptionHash);
  }

  function _cancel(
    address[] memory targets,
    uint256[] memory values,
    bytes[] memory calldatas,
    bytes32 descriptionHash
  ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
    return super._cancel(targets, values, calldatas, descriptionHash);
  }

  function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
    return super._executor();
  }

  function supportsInterface(
    bytes4 interfaceId
  ) public view override(Governor, IERC165, GovernorTimelockControl) returns (bool) {
    return super.supportsInterface(interfaceId);
  }
}
