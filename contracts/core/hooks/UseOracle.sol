
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {IOracle} from "../../interfaces/core/IOracle.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseOracle is Initializable {
    IOracle private _oracle;

    function _initUseOracle(ServiceRegistry registry, bytes32 oracleName ) internal onlyInitializing {
        _oracle = IOracle(registry.getServiceFromHash(oracleName));
        require(address(_oracle) != address(0), "Invalid Oracle Contract");
    }

    function oracle() public view returns (IOracle) {
        return _oracle;
    }

    function getLastPrice() public view returns (uint256) {
        return _oracle.getLatestPrice();
    }
}
