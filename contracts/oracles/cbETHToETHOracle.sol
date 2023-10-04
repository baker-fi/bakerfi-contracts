// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;
import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";

interface IChainlinkAggregator {
    function latestAnswer() external view returns (int256);
    function latestTimestamp() external view returns (uint256);
}

contract CbETHToETHOracle is IOracle {

    IChainlinkAggregator private immutable _stCbETHToETHPriceFeed;
    uint256 private constant _PRECISION = 10 ** 18;

    constructor(
        address stCbETHToETHPriceFeed
    ) {
        _stCbETHToETHPriceFeed = IChainlinkAggregator(stCbETHToETHPriceFeed);
    }

    function getPrecision() external pure override returns (uint256) {
        return _PRECISION;
    }

    //  cbETH/ETH
    function getLatestPrice() external override view returns (uint256) {
        return uint256(_stCbETHToETHPriceFeed.latestAnswer());
    }
}