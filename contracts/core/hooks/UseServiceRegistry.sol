
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";

abstract contract UseServiceRegistry {
    
    ServiceRegistry private immutable _registry;

    constructor(ServiceRegistry registry) {
        _registry = registry;
    }

    function registerSvc() public view returns (IServiceRegistry) {
        return _registry;
    }
}
