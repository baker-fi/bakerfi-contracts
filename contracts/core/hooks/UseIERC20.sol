// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
pragma experimental ABIEncoderV2;

import { VaultRegistry } from "../VaultRegistry.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UseIERC20 is Initializable {
  IERC20 private _ierc20;

  error InvalidIERC20Contract();

  function _initUseIERC20(VaultRegistry registry, bytes32 name) internal onlyInitializing {
    _ierc20 = IERC20(registry.getServiceFromHash(name));
    if (address(_ierc20) == address(0)) revert InvalidIERC20Contract();
  }

  function ierc20() internal view returns (IERC20) {
    return _ierc20;
  }

  function ierc20A() internal view returns (address) {
    return address(_ierc20);
  }
}
