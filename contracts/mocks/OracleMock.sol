// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IOracle} from "../interfaces/core/IOracle.sol";

contract OracleMock is IOracle {
    
    uint256 internal _exchangeRate = 1130 * (1e6);
    uint256 internal _lastUpdate;
    uint256 internal immutable PRICE_PRECISION = 1e9;


    constructor() {
        _lastUpdate = block.timestamp;
    }

    function getPrecision() public pure override returns (uint256) {
        return PRICE_PRECISION;
    }

    //  WSETH/ETH
    function getLatestPrice() public view override returns (IOracle.Price memory price) {
        price.price = _exchangeRate;
        price.lastUpdate = _lastUpdate;
    }

    function setLatestPrice(uint256 exchangeRate) external {
        _exchangeRate = exchangeRate;
        _lastUpdate = block.timestamp;
    }

     function getSafeLatestPrice(IOracle.PriceOptions memory options) public view override returns (IOracle.Price memory price) {
        price.price = _exchangeRate;
        price.lastUpdate = _lastUpdate;
        if((block.timestamp - price.lastUpdate) > options.maxAge) revert  PriceOutdated();

    }
}
