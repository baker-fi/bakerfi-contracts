// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.24;

//AggregatorInterface is AggregatorV2Interface + AggregatorV3Interface
interface IChainlinkAggregator {
  function decimals() external view returns (uint8);
  function latestAnswer() external view returns (int256);
  function latestTimestamp() external view returns (uint256);
  function latestRound() external view returns (uint256);
  function getAnswer(uint256 roundId) external view returns (int256);
  function getTimestamp(uint256 roundId) external view returns (uint256);
  function latestRoundData()
    external
    view
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    );
}
