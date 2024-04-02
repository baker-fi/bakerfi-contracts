// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {IOracle} from "../interfaces/core/IOracle.sol";
import {IChainlinkAggregator} from "../interfaces/chainlink/IChainlinkAggregator.sol";

/**
 *  CBETH/ETH Oracle using chainlink data feeds
 * 
 *  https://data.chain.link/feeds/base/base/cbeth-eth
 */
contract CbETHToETHOracle is IOracle {
    
    IChainlinkAggregator private immutable _stCbETHToETHPriceFeed;
    
    uint256 private constant _PRECISION = 10 ** 18;
    
    error InvalidPriceFromOracle();
    error InvalidPriceUpdatedAt();

    constructor(address stCbETHToETHPriceFeed) {
        _stCbETHToETHPriceFeed = IChainlinkAggregator(stCbETHToETHPriceFeed);
    }

    function getPrecision() external pure override returns (uint256) {
        return _PRECISION;
    }

    //  cbETH/ETH
    function getLatestPrice() external view override returns (IOracle.Price memory price) {
          (, int256 answer, uint256 startedAt ,uint256 updatedAt,) = _stCbETHToETHPriceFeed.latestRoundData();
        if ( answer<= 0 ) revert InvalidPriceFromOracle();        
        if ( startedAt == 0 || updatedAt == 0 ) revert InvalidPriceUpdatedAt();        
    
        price.price = uint256(answer);
        price.lastUpdate = updatedAt;
    }
}
