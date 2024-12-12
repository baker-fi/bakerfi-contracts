// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC3156FlashLenderUpgradeable } from "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashLenderUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseFlashLender is Initializable {
  IERC3156FlashLenderUpgradeable private _fLender;

  error InvalidFlashLenderContract();

  function _initUseFlashLender(address iflashLender) internal onlyInitializing {
    _fLender = IERC3156FlashLenderUpgradeable(iflashLender);
    if (address(_fLender) == address(0)) revert InvalidFlashLenderContract();
  }

  function flashLender() internal view returns (IERC3156FlashLenderUpgradeable) {
    return _fLender;
  }
  function flashLenderA() internal view returns (address) {
    return address(_fLender);
  }
}
