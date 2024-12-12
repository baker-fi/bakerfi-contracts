// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
pragma experimental ABIEncoderV2;

import { IOracle } from "../../interfaces/core/IOracle.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseOracle is Initializable {
  IOracle private _oracle;

  error InvalidOracleContract();

  function _initUseOracle(address oracleAddress) internal onlyInitializing {
    _oracle = IOracle(oracleAddress);
    if (address(_oracle) == address(0)) revert InvalidOracleContract();
  }

  function oracle() internal view returns (IOracle) {
    return _oracle;
  }

  function getLastPrice() internal view returns (IOracle.Price memory) {
    return _oracle.getLatestPrice();
  }
}
