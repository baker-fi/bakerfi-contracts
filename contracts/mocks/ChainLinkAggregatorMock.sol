// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.24;

import { IChainlinkAggregator } from "../interfaces/chainlink/IChainlinkAggregator.sol";

contract ChainLinkAggregatorMock is IChainlinkAggregator {
  uint256 internal _exchangeRate;
  uint256 internal _lastUpdate;

  uint8 internal immutable _DECIMALS = 6;

  constructor() {
    _lastUpdate = block.timestamp;
    _exchangeRate = 3500 * (10 ** _DECIMALS);
  }

  function setLatestPrice(uint256 exchangeRate) external {
    _exchangeRate = exchangeRate;
    _lastUpdate = block.timestamp;
  }

  function decimals() external pure override returns (uint8) {
    return _DECIMALS;
  }

  function latestAnswer() external view override returns (int256) {
    return int256(_exchangeRate);
  }

  function latestTimestamp() external view override returns (uint256) {
    return _lastUpdate;
  }

  function latestRound() external view override returns (uint256) {
    return 0;
  }

  function getAnswer(uint256 roundId) external view override returns (int256) {
    return int256(_exchangeRate);
  }

  function getTimestamp(uint256 roundId) external view override returns (uint256) {
    return _lastUpdate;
  }

  function latestRoundData()
    external
    view
    override
    returns (
      uint80 roundId,
      int256 answer,
      uint256 startedAt,
      uint256 updatedAt,
      uint80 answeredInRound
    )
  {
    return (0, int256(_exchangeRate), _lastUpdate, _lastUpdate, 0);
  }
}
