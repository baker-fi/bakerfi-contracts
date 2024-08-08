// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IOracle } from "../interfaces/core/IOracle.sol";
import { IChainlinkAggregator } from "../interfaces/chainlink/IChainlinkAggregator.sol";

/**
 * @title Ratio Oracle to create a price based on ETH/USD and WSTETH/STETH Ratio
 * from the Ethereum Contract. This oracle allows more price stability when the ration
 * changes slowly
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice This contract provide safe and unsafe price retrieval functions
 */
contract RatioOracle is IOracle {
  IOracle private immutable _baseOracle;
  uint256 private immutable _basePrecision;
  IChainlinkAggregator private immutable _ratioFeed;
  uint8 private immutable _ratioPriceDecimals;

  uint256 private constant _PRECISION = 1e18;
  uint256 private constant _DECIMALS = 18;

  error InvalidPriceFromOracle();
  error InvalidPriceUpdatedAt();

  constructor(IOracle baseOracle, IChainlinkAggregator ratioFeed) {
    _baseOracle = baseOracle;
    _ratioFeed = IChainlinkAggregator(ratioFeed);
    _ratioPriceDecimals = _ratioFeed.decimals();
    _basePrecision = _baseOracle.getPrecision();
  }

  function getPrecision() public pure override returns (uint256) {
    return _PRECISION;
  }

  /**
   * Get the Internal Price from Pyth Smart Contract
   */
  function _getPriceInternal(
    PriceOptions memory priceOptions
  ) private view returns (IOracle.Price memory outPrice) {
    IOracle.Price memory basePrice = priceOptions.maxAge == 0
      ? _baseOracle.getLatestPrice()
      : _baseOracle.getSafeLatestPrice(priceOptions);

    IOracle.Price memory ratio = getRatio(priceOptions);
    outPrice.price = (ratio.price * basePrice.price) / _basePrecision;
    outPrice.lastUpdate = basePrice.lastUpdate > ratio.lastUpdate
      ? basePrice.lastUpdate
      : ratio.lastUpdate;
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
   *
   * Get the wstETH/ETH Ratio from the External oracle
   *
   * @dev This method is not part of the IOracle interface but it could be usefull
   * to show prices on the frontend
   *
   * */
  function getRatio(
    PriceOptions memory priceOptions
  ) public view returns (IOracle.Price memory ratio) {
    (, int256 answer, uint256 startedAt, uint256 updatedAt, ) = _ratioFeed.latestRoundData();

    if (answer <= 0) revert InvalidPriceFromOracle();
    if (startedAt == 0 || updatedAt == 0) revert InvalidPriceUpdatedAt();

    if (priceOptions.maxAge != 0 && (block.timestamp - updatedAt) > priceOptions.maxAge)
      revert PriceOutdated();

    ratio.price = uint256(answer) * (10 ** (_DECIMALS - _ratioPriceDecimals));
    ratio.lastUpdate = updatedAt;
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
