// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry, SETTINGS_CONTRACT} from "../ServiceRegistry.sol";
import {ISettings} from "../../interfaces/core/ISettings.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseSettings is Initializable {
    ISettings private _settings;

    error InvalidSettingsContract();

    function _initUseSettings(ServiceRegistry registry) internal onlyInitializing {
        _settings = ISettings(registry.getServiceFromHash(SETTINGS_CONTRACT));
        if (address(_settings) == address(0)) revert InvalidSettingsContract();
    }

    function settings() public view returns (ISettings) {
        return _settings;
    }
    function settingsA() public view returns (address) {
        return address(_settings);
    }
}
