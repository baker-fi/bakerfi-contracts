// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry, FLASH_LENDER_CONTRACT} from "../ServiceRegistry.sol";
import {IERC3156FlashLenderUpgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashLenderUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseFlashLender is Initializable {
    IERC3156FlashLenderUpgradeable private _fLender;

    error InvalidFlashLenderContract();

    function _initUseFlashLender(ServiceRegistry registry) internal onlyInitializing {
        _fLender = IERC3156FlashLenderUpgradeable(
            registry.getServiceFromHash(FLASH_LENDER_CONTRACT)
        );
        if (address(_fLender) == address(0)) revert InvalidFlashLenderContract();
    }

    function flashLender() public view returns (IERC3156FlashLenderUpgradeable) {
        return _fLender;
    }
    function flashLenderA() public view returns (address) {
        return address(_fLender);
    }
}
