// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

library MathLibrary {
  error InvalidDivDenominator();

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
