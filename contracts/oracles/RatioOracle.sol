// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IOracle } from "../interfaces/core/IOracle.sol";
import { MathLibrary } from "../libraries/MathLibrary.sol";

/**
 * @title RatioOracle

 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 *
 * @notice A contract that provides price data based on a ratio calculation
 * @dev This contract implements the IOracle interface
 */
contract RatioOracle is IOracle {
  using MathLibrary for uint256;
  error InvalidPriceFromOracle();

  uint256 private constant _PRECISION = 1e18;
  uint8 private constant _DECIMALS = 18;
  uint8 private immutable _resultDecimals;

  struct Call {
    address target;
    bytes callData;
  }

  /**
   * @dev The target contract and calldata for fetching the ratio
   */
  Call private _call;

  /// @notice Constructs the RatioOracle contract
  /// @param call The target contract and calldata for fetching the ratio
  /// @param resultDecimals The number of decimals in the result
  constructor(Call memory call, uint8 resultDecimals) {
    _call.target = call.target;
    _resultDecimals = resultDecimals;
    _call.callData = call.callData;
  }

  /// @notice Get the price precision
  /// @return The precision of the price (1e18)
  function getPrecision() public pure override returns (uint256) {
    return _PRECISION;
  }

  /// @notice Internal function to get the price
  /// @return outPrice The fetched price data
  function _getPriceInternal(
    PriceOptions memory
  ) private view returns (IOracle.Price memory outPrice) {
    (bool success, bytes memory result) = _call.target.staticcall(_call.callData);

    if (!success) revert InvalidPriceFromOracle();

    uint256 price = abi.decode(result, (uint256));

    outPrice.price = price.toDecimals(_resultDecimals, _DECIMALS);
    outPrice.lastUpdate = block.timestamp;
  }

  /// @notice Get the latest price
  /// @dev This function might return a stale price or a price with lower confidence
  /// @return The latest price data
  function getLatestPrice() public view override returns (IOracle.Price memory) {
    return _getPriceInternal(PriceOptions({ maxAge: 0, maxConf: 0 }));
  }

  /// @notice Get the latest safe price
  /// @dev This function checks the maxAge of the price and the price confidence
  /// @param priceOptions Options for price fetching
  /// @return price The fetched price data
  function getSafeLatestPrice(
    PriceOptions memory priceOptions
  ) public view override returns (IOracle.Price memory price) {
    price = _getPriceInternal(priceOptions);
  }
}
