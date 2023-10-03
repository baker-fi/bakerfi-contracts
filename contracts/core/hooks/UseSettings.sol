// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {SETTINGS} from "../Constants.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {ISettings} from "../../interfaces/core/ISettings.sol";

abstract contract UseSettings {
    ISettings immutable _settings;

    constructor(ServiceRegistry registry) {
        _settings = ISettings(registry.getServiceFromHash(SETTINGS));
    }

    function settings() internal view returns (ISettings) {
        return _settings;
    }
    function settingsA() internal view returns (address) {
        return address(_settings);
    }
}