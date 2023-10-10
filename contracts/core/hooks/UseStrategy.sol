// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;


import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {IStrategy} from "../../interfaces/core/IStrategy.sol";
import {STRATEGY} from "../Constants.sol";

abstract contract UseStrategy {
    IStrategy immutable private _strategy;

    constructor(IServiceRegistry registry) {
        _strategy = IStrategy(registry.getServiceFromHash(STRATEGY));
        require(address(_strategy) != address(0), "Invalid Strategy Contract");
    }

    function strategy() public view returns (IStrategy) {
        return _strategy;
    }
    function strategyA() public view returns (address) {
        return address(_strategy);
    }
}