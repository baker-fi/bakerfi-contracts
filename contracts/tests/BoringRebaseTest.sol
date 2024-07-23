// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import { Rebase, RebaseLibrary } from "../libraries/RebaseLibrary.sol";

contract TestRebaseLibrary {
  using RebaseLibrary for Rebase;

  function toBase(
    Rebase memory total,
    uint256 elastic,
    bool roundUp
  ) public pure returns (uint256) {
    return total.toBase(elastic, roundUp);
  }

  function toElastic(
    Rebase memory total,
    uint256 base,
    bool roundUp
  ) public pure returns (uint256 elastic) {
    return total.toElastic(base, roundUp);
  }
}
