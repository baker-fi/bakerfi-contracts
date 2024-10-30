// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
pragma experimental ABIEncoderV2;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseStETH is Initializable {
  IERC20 private _stETH;

  error UseStETHInvalidStETHContract();

  function _initUseStETH(address istETH) internal onlyInitializing {
    _stETH = IERC20(istETH);
    if (address(_stETH) == address(0)) revert UseStETHInvalidStETHContract();
  }

  function stETH() internal view returns (IERC20) {
    return _stETH;
  }

  function stETHA() internal view returns (address) {
    return address(_stETH);
  }
}
