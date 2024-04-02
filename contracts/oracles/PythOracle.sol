// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

import {IPyth} from "../interfaces/pyth/IPyth.sol";
import {PythStructs} from "../interfaces/pyth/PythStructs.sol";
import {IOracle} from "../interfaces/core/IOracle.sol";

contract PythOracle is IOracle {

    error InvalidPriceUpdate();
    error NoEnoughFee();

    IPyth private immutable _pyth;
    bytes32 private immutable _priceID;
    uint256 private constant _PRECISION = 18;

    /**
     *
     * @param priceID The Pyth Oracle identifier
     * @param pythContract The Pyth Central Point
     */
    constructor(bytes32 priceID, address pythContract) {
        _pyth = IPyth(pythContract);
        _priceID = priceID;
    }

    /**
     * Get the Price precision
     */
    function getPrecision() public pure returns (uint256) {
        return _PRECISION;
    }

    /**
     * Get the Internal Price from Pyth Smart Contract
     */
    function _getPriceInternal() private view returns (IOracle.Price memory outPrice) {
        PythStructs.Price memory price = _pyth.getPriceUnsafe(_priceID);

        if (price.expo >= 0) {
            outPrice.price =
                uint64(price.price) *
                uint256(10 ** (_PRECISION + uint32(price.expo)));
        } else {
            outPrice.price =
                uint64(price.price) *
                uint256(10 ** (_PRECISION - uint32(-price.expo)));
        }
        outPrice.lastUpdate = price.publishTime;
    }

    /**
     * Update the Price and return the Price
     * @param priceUpdateData Price Update for Pyth
     */
    function getAndUpdatePrice(
        bytes calldata priceUpdateData
    ) external payable returns (IOracle.Price memory) {
        if ( priceUpdateData.length == 0 ) revert InvalidPriceUpdate();
        bytes[] memory priceUpdates = new bytes[](1);
        priceUpdates[0] = priceUpdateData;
        uint256 fee = _pyth.getUpdateFee(priceUpdates);
        if (msg.value < fee) revert NoEnoughFee();
        _pyth.updatePriceFeeds{value: fee}(priceUpdates);
        return _getPriceInternal();
    }

    /**
     * Get the Latest Price
     */
    function getLatestPrice() public view returns (IOracle.Price memory) {
        return _getPriceInternal();
    }
}
