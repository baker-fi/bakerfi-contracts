// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { ExRateOracle } from "./ExRateOracle.sol";
import { IOracle } from "../interfaces/core/IOracle.sol";
import { IChainlinkAggregator } from "../interfaces/chainlink/IChainlinkAggregator.sol";
import { MathLibrary } from "../libraries/MathLibrary.sol";
/**
 * @title ChainLink Exchange Rate Oracle to create a price based on ETH/USD and WSTETH/STETH Ratio
 * from the Ethereum Contract. This oracle allows more price stability when the ration
 * changes slowly
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice This contract provide safe and unsafe price retrieval functions
 */
contract ChainLinkExRateOracle is ExRateOracle {
  using MathLibrary for uint256;

  IChainlinkAggregator private immutable _ratioFeed;

  uint8 private immutable _ratioPriceDecimals;

  constructor(IOracle baseOracle, IChainlinkAggregator ratioFeed) ExRateOracle(baseOracle) {
    _ratioFeed = IChainlinkAggregator(ratioFeed);
    _ratioPriceDecimals = _ratioFeed.decimals();
  }
  /**
   *
   * Get the wstETH/ETH Ratio from the External oracle
   *
   * @dev This method is not part of the IOracle interface but it could be usefull
   * to show prices on the frontend
   *
   * */
  function getRatio() public view virtual override returns (IOracle.Price memory ratio) {
    (, int256 answer, uint256 startedAt, uint256 updatedAt, ) = _ratioFeed.latestRoundData();

    if (answer <= 0) revert InvalidPriceFromOracle();
    if (startedAt == 0 || updatedAt == 0) revert InvalidPriceUpdatedAt();

    ratio.price = uint256(answer).toDecimals(_ratioPriceDecimals, _DECIMALS);
    ratio.lastUpdate = updatedAt;
  }
}
