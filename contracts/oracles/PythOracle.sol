// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IPyth } from "../interfaces/pyth/IPyth.sol";
import { PythStructs } from "../interfaces/pyth/PythStructs.sol";
import { IOracle } from "../interfaces/core/IOracle.sol";
import { PERCENTAGE_PRECISION } from "../core/Constants.sol";

/**
 * Oracle that uses Pyth feeds to provide up to date prices
 * for further use on the protocol

 * @title Generic Pyth Oracle Service
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice This contract provide safe and unsafe price retrieval functions
 *
 */
contract PythOracle is IOracle {
  error InvalidPriceUpdate();
  error InvalidPriceAnswer();
  error NoEnoughFee();
  error InvalidPriceOption();

  IPyth private immutable _pyth;
  bytes32 private immutable _priceID;
  uint256 private constant _PRECISION = 1e18;
  uint256 private constant _DECIMALS = 18;
  int256 internal constant _MIN_EXPONENT = -20;
  int256 internal constant _MAX_EXPONENT = 20;
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
  function getPrecision() public pure override returns (uint256) {
    return _PRECISION;
  }

  /**
   * Get the Internal Price from Pyth Smart Contract
   */
  function _getPriceInternal(
    PriceOptions memory priceOptions
  ) private view returns (IOracle.Price memory outPrice) {
    PythStructs.Price memory price = priceOptions.maxAge == 0
      ? _pyth.getPriceUnsafe(_priceID)
      : _pyth.getPriceNoOlderThan(_priceID, priceOptions.maxAge);

    // Pyth Oracle Answer Sanity Checks
    if (
      price.price < 0 ||
      // Validate Max confidence when required
      (priceOptions.maxConf != 0 &&
        price.conf > 0 &&
        price.conf > (uint64(price.price) * priceOptions.maxConf) / PERCENTAGE_PRECISION) ||
      price.expo > _MAX_EXPONENT ||
      price.expo < _MIN_EXPONENT
    ) {
      revert InvalidPriceAnswer();
    }

    if (price.expo >= 0) {
      outPrice.price = uint64(price.price) * uint256(10 ** (_DECIMALS + uint32(price.expo)));
    } else {
      outPrice.price = uint64(price.price) * uint256(10 ** (_DECIMALS - uint32(-price.expo)));
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
    if (priceUpdateData.length == 0) revert InvalidPriceUpdate();
    bytes[] memory priceUpdates = new bytes[](1);
    priceUpdates[0] = priceUpdateData;
    uint256 fee = _pyth.getUpdateFee(priceUpdates);
    if (msg.value < fee) revert NoEnoughFee();

    _pyth.updatePriceFeeds{ value: fee }(priceUpdates);

    uint256 excessETH = msg.value - fee;
    if (excessETH != 0) {
      payable(msg.sender).transfer(excessETH);
    }
    return _getPriceInternal(PriceOptions({ maxAge: 0, maxConf: 0 }));
  }

  /**
   * Get the Latest Price.
   *
   * @dev This function might return a stale price or a price with lower confidence.
   * Warning: This oracle is unsafe to use on price sensitive operations.
   */
  function getLatestPrice() public view override returns (IOracle.Price memory) {
    return _getPriceInternal(PriceOptions({ maxAge: 0, maxConf: 0 }));
  }

  /**
   * Get the Latest Price from the Pyth Feed
   * @dev This function checks the maxAge of the price and the price confidence specified
   * on the input parameters.
   */
  function getSafeLatestPrice(
    PriceOptions memory priceOptions
  ) public view override returns (IOracle.Price memory price) {
    price = _getPriceInternal(priceOptions);
  }
}
