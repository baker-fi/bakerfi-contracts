// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.24;

import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IChainlinkAggregator} from "../interfaces/chainlink/IChainlinkAggregator.sol";

/**
 *  WSTETH / ETH Oracle using Lido Stake WSETH/STETH  Contract and STETH/ETH 
 * 
 **/
contract WstETHToETHOracleETH is IOracle {
    
    IWStETH private immutable _wstETH;
    IChainlinkAggregator private immutable _stETHToETHPriceFeed;
    uint256 internal constant _PRECISION = 10 ** 18;

    error InvalidPriceFromOracle();
    error InvalidPriceFromStEth();
    error InvalidPriceUpdatedAt();

    constructor(address stETHToETHPriceFeed, address wstETH) {
        _stETHToETHPriceFeed = IChainlinkAggregator(stETHToETHPriceFeed);
        _wstETH = IWStETH(wstETH);
    }

    function getPrecision() public pure override returns (uint256) {
        return _PRECISION;
    }

    //  WSETH -> STETH -> ETH Price Conversion
    function getLatestPrice() public view override returns (IOracle.Price memory price) {
        uint256 wstETHToStETH = uint256(_wstETH.stEthPerToken());
        if ( wstETHToStETH == 0) revert InvalidPriceFromStEth();
        (, int256 answer, uint256 startedAt, uint256 updatedAt,) = _stETHToETHPriceFeed.latestRoundData();
        if ( answer <= 0 ) revert InvalidPriceFromOracle();        
        if ( startedAt ==0 || updatedAt == 0 ) revert InvalidPriceUpdatedAt();    
        price.price = (wstETHToStETH * uint256(answer)) / _PRECISION;
        price.lastUpdate = updatedAt;
    }

    function getSafeLatestPrice(uint256 age) public view override returns (IOracle.Price memory price) {
        price = getLatestPrice();
        if((block.timestamp - price.lastUpdate) > age) revert  PriceOutdated();
    }
}
