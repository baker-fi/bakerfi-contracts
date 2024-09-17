// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import { MathLibrary } from "../libraries/MathLibrary.sol";

contract MathLibraryWrapper {
  function mulDivUp(uint256 x, uint256 y, uint256 denominator) external pure returns (uint256) {
    return MathLibrary.mulDivUp(x, y, denominator);
  }

  function toDecimals(
    uint256 value,
    uint8 from,
    uint8 to
  ) external pure returns (uint256 converted) {
    return MathLibrary.toDecimals(value, from, to);
  }

  function mulDivDown(uint256 x, uint256 y, uint256 denominator) external pure returns (uint256) {
    return MathLibrary.mulDivDown(x, y, denominator);
  }
  function mulDiv(
    uint256 x,
    uint256 y,
    uint256 denominator,
    bool roundUp
  ) external pure returns (uint256) {
    return MathLibrary.mulDiv(x, y, denominator, roundUp);
  }
}
