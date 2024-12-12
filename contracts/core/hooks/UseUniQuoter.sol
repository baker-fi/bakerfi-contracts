// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IQuoterV2 } from "../../interfaces/uniswap/v3/IQuoterV2.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UseUniQuoter is Initializable {
  IQuoterV2 private _quoter;

  error UseUniQuoter_InvalidUniQuoterContract();

  function _initUseUniQuoter(IQuoterV2 quoter) internal onlyInitializing {
    _quoter = quoter;
    if (address(_quoter) == address(0)) revert UseUniQuoter_InvalidUniQuoterContract();
  }

  function uniQuoter() internal view returns (IQuoterV2) {
    return _quoter;
  }

  function uniQuoterA() internal view returns (address) {
    return address(_quoter);
  }
}
