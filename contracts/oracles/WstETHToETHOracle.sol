// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;
import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import  {IChainlinkAggregator} from "../interfaces/chainlink/IChainlinkAggregator.sol";

contract WstETHToETHOracle is IOracle {

    IChainlinkAggregator private immutable _stETHToETHPriceFeed;
    uint256 internal constant _PRECISION = 10 ** 18;

    constructor(
        address stETHToETHPriceFeed
    ) {
        _stETHToETHPriceFeed = IChainlinkAggregator(stETHToETHPriceFeed);
    }

    function getPrecision() external pure override returns (uint256) {
        return _PRECISION;
    }
    
    //  WSETH/ETH
    function getLatestPrice() external override view returns (IOracle.Price memory price) {
        price.price = uint256(_stETHToETHPriceFeed.latestAnswer());
        price.lastUpdate = _stETHToETHPriceFeed.latestTimestamp();
    }
}