// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.24;

import {IOracle} from "../interfaces/core/IOracle.sol";
import {IChainlinkAggregator} from "../interfaces/chainlink/IChainlinkAggregator.sol";

/**
 * Chainlink General Oracle using chainlink data feeds
 */
contract ChainLinkOracle is IOracle {
    
    IChainlinkAggregator private immutable  _priceFeed;
    uint8                private immutable  _extPriceDecimals;    
    uint8                private constant   _PRICE_DECIMALS = 18;
    uint256              private constant   _PRECISION = 10 ** _PRICE_DECIMALS;
    
    error InvalidPriceFromOracle();
    error InvalidPriceUpdatedAt();

    /**
     * Chainlink Price Feed Address
     * 
     * @param priceFeed The Price Feed Chain Address.
     */
    constructor(address priceFeed) {
        _priceFeed = IChainlinkAggregator(priceFeed);
        // From the reference documentation the decimals does not change for any 
        // for any price feed.
        _extPriceDecimals = _priceFeed.decimals();
    }

    function getPrecision() public pure override returns (uint256) {
        return _PRECISION;
    }

    /**
     * Get the Latest price from the Chainlink aggregator and convert the price taking into account
     * the price decimals.
     */
    function getLatestPrice() public view override returns (IOracle.Price memory price) {
          (, int256 answer, uint256 startedAt ,uint256 updatedAt,) = _priceFeed.latestRoundData();
        if ( answer<= 0 ) revert InvalidPriceFromOracle();        
        if ( startedAt == 0 || updatedAt == 0 ) revert InvalidPriceUpdatedAt();    

        price.price = uint256(answer)*(10**(_PRICE_DECIMALS-_extPriceDecimals));
        price.lastUpdate = updatedAt;
    }

    function getSafeLatestPrice(uint256 age) public view override returns (IOracle.Price memory price) {
        price = getLatestPrice();
        if ( (block.timestamp - price.lastUpdate) > age) revert  PriceOutdated();
    }
}
