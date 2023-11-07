
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import { FLASH_LENDER } from "../Constants.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC3156FlashLender} from "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


abstract contract UseFlashLender is Initializable{
    
    IERC3156FlashLender private _fLender;

    function __initUseFlashLender(ServiceRegistry registry) internal onlyInitializing {
        _fLender = IERC3156FlashLender(registry.getServiceFromHash(FLASH_LENDER));
        require(address(_fLender) != address(0), "Invalid Flash Lender Contract");
    }

    function flashLender() public view returns (IERC3156FlashLender) {
        return _fLender;
    }

    function flashLenderA() public view returns (address) {
        return address(_fLender);
    }
}

