// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;
import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IChainlinkAggregator} from "../interfaces/chainlink/IChainlinkAggregator.sol";

contract ETHOracle is IOracle {
    IChainlinkAggregator private immutable _ethPriceFeed;
    uint256 private constant _PRECISION = 10 ** 18;

    constructor(address ethPriceFeed) {
        _ethPriceFeed = IChainlinkAggregator(ethPriceFeed);
    }

    function getPrecision() external pure override returns (uint256) {
        return _PRECISION;
    }

    //  cbETH/ETH
    function getLatestPrice() external view override returns (IOracle.Price memory price) {
        price.price = uint256(_ethPriceFeed.latestAnswer() * 1e10);
        price.lastUpdate = _ethPriceFeed.latestTimestamp();
    }
}
