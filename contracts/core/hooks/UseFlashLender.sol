
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import { FLASH_LENDER } from "../Constants.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";


abstract contract UseFlashLender {
    IERC3156FlashLender immutable _fLender;

    constructor(ServiceRegistry registry) {
        _fLender = IERC3156FlashLender(registry.getServiceFromHash(FLASH_LENDER));
    }

    function flashLender() internal view returns (IERC3156FlashLender) {
        return _fLender;
    }

    function flashLenderA() internal view returns (address) {
        return address(_fLender);
    }
}

