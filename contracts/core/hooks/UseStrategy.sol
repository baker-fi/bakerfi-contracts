// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
pragma experimental ABIEncoderV2;

import {ServiceRegistry, STRATEGY_CONTRACT} from "../ServiceRegistry.sol";
import {IStrategy} from "../../interfaces/core/IStrategy.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseStrategy is Initializable {
    IStrategy private _strategy;

    error InvalidStrategyContract();

    function _initUseStrategy(ServiceRegistry registry) internal onlyInitializing {
        _strategy = IStrategy(registry.getServiceFromHash(STRATEGY_CONTRACT));
        if (address(_strategy) == address(0)) revert InvalidStrategyContract();
    }

    function strategy() public view returns (IStrategy) {
        return _strategy;
    }
    function strategyA() public view returns (address) {
        return address(_strategy);
    }
}
