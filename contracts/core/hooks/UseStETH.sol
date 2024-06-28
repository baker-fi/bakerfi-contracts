// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
pragma experimental ABIEncoderV2;

import { ServiceRegistry, ST_ETH_CONTRACT } from "../ServiceRegistry.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseStETH is Initializable {
  IERC20 private _stETH;

  error UseStETHInvalidStETHContract();

  function _initUseStETH(ServiceRegistry registry) internal onlyInitializing {
    _stETH = IERC20(registry.getServiceFromHash(ST_ETH_CONTRACT));
    if (address(_stETH) == address(0)) revert UseStETHInvalidStETHContract();
  }

  function stETH() public view returns (IERC20) {
    return _stETH;
  }

  function stETHA() public view returns (address) {
    return address(_stETH);
  }
}
