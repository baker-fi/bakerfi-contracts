// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

/**
 * @title MathLibrary
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @dev Library for handling mathematical operations
 */
library MathLibrary {
  error InvalidDivDenominator();
  error OverflowDetected();

  uint256 private constant MAX_DIFFERENCE_DECIMALS = 64;

  /**
   * @notice Converts a value from one decimal precision to another.
   * @dev This function converts a `value` from a `from` decimal precision to a `to` decimal precision.
   *      It checks for overflow and reverts if the conversion would cause an overflow.
   * @param value The numerical value to convert.
   * @param from The current decimal precision of the `value`.
   * @param to The target decimal precision to convert to.
   * @return converted The value converted to the target decimal precision.
   * @custom:throws OverflowDetected if the difference between `from` and `to` is greater than or equal to `MAX_DIFFERENCE_DECIMALS`.
   * @custom:throws OverflowDetected if the multiplication required to increase precision would cause an overflow.
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

  /**
   * @dev Multiplies two unsigned integers `x` and `y`, then divides the result by `denominator`
   * and returns the result either rounded up or down based on the `roundUp` flag.
   *
   * @notice This function provides an option to round the division result up or down.
   * If `roundUp` is true, the function rounds up using the `mulDivUp` function;
   * otherwise, it rounds down using the `mulDivDown` function.
   * If `denominator` is zero, the function reverts with an `InvalidDivDenominator` error.
   *
   * @param x The first multiplicand as an unsigned integer.
   * @param y The second multiplicand as an unsigned integer.
   * @param denominator The divisor as an unsigned integer. Must not be zero.
   * @param roundUp A boolean flag indicating whether to round up or down.
   *
   * @return The result of the multiplication and division, rounded up or down based on `roundUp`.
   *
   * @custom:error InvalidDivDenominator Thrown if `denominator` is zero.
   */
  function mulDiv(
    uint256 x,
    uint256 y,
    uint256 denominator,
    bool roundUp
  ) internal pure returns (uint256) {
    return roundUp ? mulDivUp(x, y, denominator) : mulDivDown(x, y, denominator);
  }
  /**
   * @dev Multiplies two unsigned integers `x` and `y`, then divides the result by `denominator`
   * and rounds the result up towards the next integer.
   *
   * @notice This function performs multiplication followed by division and rounds the result up towards
   * the next integer. If either `x` or `y` is zero, the function returns 0.
   * If `denominator` is zero, the function reverts with an `InvalidDivDenominator` error.
   *
   * @param x The first multiplicand as an unsigned integer.
   * @param y The second multiplicand as an unsigned integer.
   * @param denominator The divisor as an unsigned integer. Must not be zero.
   *
   * @return The result of the multiplication and division, rounded up towards the next integer.
   *
   * @custom:error InvalidDivDenominator Thrown if `denominator` is zero.
   */
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

  /**
   * @dev Multiplies two unsigned integers `x` and `y`, then divides the result by `denominator` with truncation towards zero.
   * The function returns the result of the division.
   *
   * @notice This function performs multiplication followed by division. It truncates the result towards zero.
   * If either `x` or `y` is zero, the function returns 0.
   * If `denominator` is zero, the function reverts with an `InvalidDivDenominator` error.
   *
   * @param x The first multiplicand as an unsigned integer.
   * @param y The second multiplicand as an unsigned integer.
   * @param denominator The divisor as an unsigned integer. Must not be zero.
   *
   * @return The result of `(x * y) / denominator`, truncated towards zero.
   *
   * @custom:error InvalidDivDenominator Thrown if `denominator` is zero.
   */
  function mulDivDown(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256) {
    uint256 product = x * y;
    // Not Allowed: Division by 0
    if (denominator == 0) revert InvalidDivDenominator();

    if (x == 0 || y == 0) {
      return 0;
    } else {
      // Division down simply divides the product by the denominator
      // and truncates towards zero (which is the default behavior of division in Solidity).
      return product / denominator;
    }
  }
}
