// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

library MathLibrary {
  error InvalidDivDenominator();
  error OverflowDetected();

  uint256 private constant MAX_DIFFERENCE_DECIMALS = 64;

  /***
   * Converts Numbers between different decimal representations
   */
  function toDecimals(
    uint256 value,
    uint8 from,
    uint8 to
  ) internal pure returns (uint256 converted) {
    if (from > to) {
      if (from - to >= MAX_DIFFERENCE_DECIMALS) revert OverflowDetected();
      converted = value / (10 ** (from - to));
    } else if (to > from) {
      if (to - from >= MAX_DIFFERENCE_DECIMALS) revert OverflowDetected();
      uint256 factor = 10 ** (to - from);
      if (value > type(uint256).max / factor) revert OverflowDetected();
      converted = value * factor;
    } else {
      converted = value;
    }
  }

  function mulDivUp(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256) {
    uint256 product = x * y;
    // Not Allowed Division by 0
    if (denominator == 0) revert InvalidDivDenominator();

    if (x == 0 || y == 0) {
      return 0;
    } else {
      // The traditional divUp formula is:
      // divUp(x, y) := (x + y - 1) / y
      // To avoid intermediate overflow in the addition, we distribute the division and get:
      // divUp(x, y) := (x - 1) / y + 1
      // Note that this requires x != 0, which we already tested for.
      return 1 + (product - 1) / denominator;
    }
  }
}
