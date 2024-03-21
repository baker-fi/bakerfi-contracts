// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {Settings} from "../core/Settings.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract SettingsV2 is Settings {
    function getNumber() public pure returns (uint256) {
        return 10;
    }
}
