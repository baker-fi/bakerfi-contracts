// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import { Settings } from "../core/Settings.sol";

contract SettingsFuzzing {

    Settings private settings;

    constructor() {
        settings = new Settings(address(this));
    }

    function changeMaxLTV(uint256  maxValue) public  {
        settings.setMaxLoanToValue(maxValue);
    }

    function changeLTV(uint256  value) public {
        settings.setLoanToValue(value);
    }

    function echidna_maxLTVGreatherThanLtv() public view returns (bool) {
        return settings.getMaxLoanToValue() >=  settings.getLoanToValue();
    }

}