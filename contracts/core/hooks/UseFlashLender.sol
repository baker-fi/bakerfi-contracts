
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry, FLASH_LENDER_CONTRACT} from "../ServiceRegistry.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC3156FlashLenderUpgradeable} from "@openzeppelin/contracts-upgradeable/interfaces/IERC3156FlashLenderUpgradeable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseFlashLender is Initializable{
    
    IERC3156FlashLenderUpgradeable private _fLender;

    function _initUseFlashLender(ServiceRegistry registry) internal onlyInitializing {
        _fLender = IERC3156FlashLenderUpgradeable(registry.getServiceFromHash(FLASH_LENDER_CONTRACT));
        require(address(_fLender) != address(0), "Invalid Flash Lender Contract");
    }

    function flashLender() public view returns (IERC3156FlashLenderUpgradeable) {
        return _fLender;
    }
    function flashLenderA() public view returns (address) {
        return address(_fLender);
    }
}

