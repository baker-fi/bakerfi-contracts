// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;
import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import  {IChainlinkAggregator} from "../interfaces/chainlink/IChainlinkAggregator.sol";

contract WstETHToETHOracle is IOracle {

    IWStETH private immutable              _wstETH;
    IChainlinkAggregator private immutable _stETHToETHPriceFeed;
    uint256 internal constant _PRECISION = 10 ** 18;

    constructor(
        address stETHToETHPriceFeed, 
        address wstETH
    ) {
        _stETHToETHPriceFeed = IChainlinkAggregator(stETHToETHPriceFeed);
        _wstETH = IWStETH(wstETH);

    }

    function getPrecision() external pure override returns (uint256) {
        return _PRECISION;
    }

    //  WSETH/ETH
    function getLatestPrice() external override view returns (uint256) {
        return uint256(_stETHToETHPriceFeed.latestAnswer());
    }
}