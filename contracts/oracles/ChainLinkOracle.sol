// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IOracle } from "../interfaces/core/IOracle.sol";
import { IChainlinkAggregator } from "../interfaces/chainlink/IChainlinkAggregator.sol";

/**
 * Oracle that uses ChainLink feeds to provide up to date prices
 * for further use on the protocol

 * @title Generic Chainlink Oracle Service
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz> * Chainlink General Oracle using chainlink data feeds
 *
 */
contract ChainLinkOracle is IOracle {
  IChainlinkAggregator private immutable _priceFeed;

  uint8 private immutable _extPriceDecimals;

  uint8 private constant _PRICE_DECIMALS = 18;

  uint256 private constant _PRECISION = 10 ** _PRICE_DECIMALS;

  // Price Circuit Breaker to prevent staled and prices from the aggreagator
  // The data feed aggregator includes both minAnswer and maxAnswer values.
  // On most data feeds, these values are no longer used and they do not stop
  // your application from reading the most recent answer.
  // We decided to implement our immutable circuit breakers followin chainlink
  // documentation
  uint256 private immutable _minPrice = 0;
  uint256 private immutable _maxPrice = 0;

  error InvalidPriceFromOracle();
  error InvalidPriceUpdatedAt();

  /**
   * Chainlink Price Feed Address
   *
   * @param priceFeed The Price Feed Chain Address.
   */
  constructor(address priceFeed, uint256 minPrice, uint256 maxPrice) {
    _priceFeed = IChainlinkAggregator(priceFeed);
    _minPrice = minPrice;
    _maxPrice = maxPrice;
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
    (, int256 answer, uint256 startedAt, uint256 updatedAt, ) = _priceFeed.latestRoundData();
    if (answer <= 0) revert InvalidPriceFromOracle();
    if (startedAt == 0 || updatedAt == 0) revert InvalidPriceUpdatedAt();

    price.price = uint256(answer) * (10 ** (_PRICE_DECIMALS - _extPriceDecimals));
    price.lastUpdate = updatedAt;
  }

  function getSafeLatestPrice(
    PriceOptions memory priceOptions
  ) public view override returns (IOracle.Price memory price) {
    price = getLatestPrice();
    if (priceOptions.maxAge != 0 && (block.timestamp - price.lastUpdate) > priceOptions.maxAge)
      revert PriceOutdated();
    if (_minPrice > 0 && price.price <= _minPrice) revert InvalidPriceFromOracle();
    if (_maxPrice > 0 && price.price >= _maxPrice) revert InvalidPriceFromOracle();
  }
}
