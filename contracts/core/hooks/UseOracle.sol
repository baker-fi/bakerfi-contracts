
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {IOracle} from "../../interfaces/core/IOracle.sol";

abstract contract UseOracle {
    IOracle immutable _oracle;

    constructor(ServiceRegistry registry, bytes32 oracleName ) {
        _oracle = IOracle(registry.getServiceFromHash(oracleName));
        require(address(_oracle) != address(0), "Invalid Oracle Contract");
    }

    function oracle() internal view returns (IOracle) {
        return _oracle;
    }

    function getLastPrice() internal view returns (uint256) {
        return _oracle.getLatestPrice();
    }
}
