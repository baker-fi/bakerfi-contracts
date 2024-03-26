// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {IOracle} from "../interfaces/core/IOracle.sol";
import {IChainlinkAggregator} from "../interfaces/chainlink/IChainlinkAggregator.sol";

/**
 *  WSTETH/ETH Oracle using chainlink data feeds
 * 
 *  For more information about the feed go to 
 *  https://data.chain.link/feeds/arbitrum/mainnet/wsteth-eth
 * 
 **/
contract WstETHToETHOracle is IOracle {
    
    IChainlinkAggregator private immutable _stETHToETHPriceFeed;
    
    uint256 internal constant _PRECISION = 10 ** 18;

    error InvalidPriceFromOracle();
    error InvalidPriceUpdatedAt();

    constructor(address stETHToETHPriceFeed) {
        _stETHToETHPriceFeed = IChainlinkAggregator(stETHToETHPriceFeed);
    }

    function getPrecision() external pure override returns (uint256) {
        return _PRECISION;
    }

    //  WSETH/ETH
    function getLatestPrice() external view override returns (IOracle.Price memory price) {
        (, int256 answer, uint256 startedAt, uint256 updatedAt,) = _stETHToETHPriceFeed.latestRoundData();
        if ( answer <= 0 ) revert InvalidPriceFromOracle();        
        if ( startedAt ==0 || updatedAt == 0 ) revert InvalidPriceUpdatedAt();    
        price.price = uint256(answer);
        price.lastUpdate = updatedAt;
    }
}
