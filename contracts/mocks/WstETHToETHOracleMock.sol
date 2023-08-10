// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";

contract WstETHToETHOracleMock is IOracle {


    uint256 internal immutable _exchangeRate = 1130*(1e6);
    uint256 internal immutable PRICE_PRECISION = 1e9;
 

    function getPrecision() external view override returns (uint256) {
        return PRICE_PRECISION;
    }

    //  WSETH/ETH
    function getLatestPrice() external override view returns (uint256) {
       return _exchangeRate;
    }

}