// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {OwnableUpgradeable2Step} from "../core/OwnableUpgradeable2Step.sol";

contract OwnableUpgradeable2StepMock is OwnableUpgradeable2Step {

    function initialize(
        address initialOwner       
    ) public initializer {    
        _Ownable2Step_init(initialOwner);
    }
}
