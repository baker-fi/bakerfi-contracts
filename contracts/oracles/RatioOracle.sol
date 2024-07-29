// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { PERCENTAGE_PRECISION } from "../core/Constants.sol";
import { IOracle } from "../interfaces/core/IOracle.sol";
import { IPyth } from "../interfaces/pyth/IPyth.sol";
import { IChainlinkAggregator } from "../interfaces/chainlink/IChainlinkAggregator.sol";
import { PythStructs } from "../interfaces/pyth/PythStructs.sol";


/**
 * @title Ratio Oracle to  create a price based on ETH/USD and WSTETH/STETH Ratio from the 
 * Ethereum Contract
 * @author 
 * @notice 
 */
contract RatioOracle is IOracle {
  
  IOracle   private immutable              _baseOracle;
  uint256   private  immutable             _basePrecision;
  IChainlinkAggregator private immutable   _ratioFeed;
  uint8 private immutable                  _ratioPriceDecimals;

  uint256 private constant _PRECISION = 18;
  int256 internal constant MIN_EXPONENT = -20;
  int256 internal constant MAX_EXPONENT = 20;

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
    outPrice.price = (ratio.price * basePrice.price) / (10 ** _basePrecision);
    outPrice.lastUpdate = basePrice.lastUpdate > ratio.lastUpdate ? basePrice.lastUpdate : ratio.lastUpdate;
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


  function getRatio(PriceOptions memory priceOptions) public view returns (IOracle.Price memory ratio) {
     (, int256 answer, uint256 startedAt, uint256 updatedAt, ) = _ratioFeed.latestRoundData();

    if (answer <= 0) revert InvalidPriceFromOracle();
    if (startedAt == 0 || updatedAt == 0) revert InvalidPriceUpdatedAt();
    
    if (priceOptions.maxAge != 0 && (block.timestamp - updatedAt) > priceOptions.maxAge)
      revert PriceOutdated();

    ratio.price = uint256(answer) * (10 ** (_PRECISION - _ratioPriceDecimals));
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
