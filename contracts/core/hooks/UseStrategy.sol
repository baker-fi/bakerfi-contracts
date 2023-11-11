// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;


import {ServiceRegistry, STRATEGY_CONTRACT} from "../ServiceRegistry.sol";
import {IStrategy} from "../../interfaces/core/IStrategy.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseStrategy is Initializable  {
    IStrategy private _strategy;

    function __initUseStrategy(ServiceRegistry registry) internal onlyInitializing {
        _strategy = IStrategy(registry.getServiceFromHash(STRATEGY_CONTRACT));
        require(address(_strategy) != address(0), "Invalid Strategy Contract");
    }

    function strategy() public view returns (IStrategy) {
        return _strategy;
    }
    function strategyA() public view returns (address) {
        return address(_strategy);
    }
}