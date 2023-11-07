// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {SETTINGS} from "../Constants.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {ISettings} from "../../interfaces/core/ISettings.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseSettings is Initializable {
    ISettings private _settings;

    function __initUseSettings(ServiceRegistry registry) internal onlyInitializing {
        _settings = ISettings(registry.getServiceFromHash(SETTINGS));
        require(address(_settings) != address(0), "Invalid Settings Contract");
    }

    function settings() public view returns (ISettings) {
        return _settings;
    }
    function settingsA() public view returns (address) {
        return address(_settings);
    }
}