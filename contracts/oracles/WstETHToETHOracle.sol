// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;
import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";

interface IChainlinkAggregator {
    function latestAnswer() external view returns (int256);
}

contract WstETHToETHOracle is IOracle {

    IWStETH public immutable              _wstETH;
    IChainlinkAggregator public immutable _stETHToETHPriceFeed;
    uint256 internal constant PRECISION = 10 ** 18;

    constructor(
        address stETHToETHPriceFeed, 
        address wstETH
    ) {
        _stETHToETHPriceFeed = IChainlinkAggregator(stETHToETHPriceFeed);
        _wstETH = IWStETH(wstETH);

    }

    function getPrecision() external pure override returns (uint256) {
        return PRECISION;
    }

    //  WSETH/ETH
    function getLatestPrice() external override view returns (uint256) {
        uint256 wstETHToStETH = uint256(_wstETH.stEthPerToken());
        assert(wstETHToStETH > 0);
        uint256 stETHToETH = uint256(_stETHToETHPriceFeed.latestAnswer());
        return wstETHToStETH * stETHToETH / PRECISION;
    }
}