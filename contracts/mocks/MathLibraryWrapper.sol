// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import { MathLibrary } from "../libraries/MathLibrary.sol";

contract MathLibraryWrapper {
  function mulDivUp(uint256 x, uint256 y, uint256 denominator) external pure returns (uint256) {
    return MathLibrary.mulDivUp(x, y, denominator);
  }
}
