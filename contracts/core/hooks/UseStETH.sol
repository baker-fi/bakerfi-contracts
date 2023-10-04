// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {ST_ETH_CONTRACT} from "../Constants.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract UseStETH {
    IERC20 immutable private _stETH;

    constructor(ServiceRegistry registry) {
        _stETH = IERC20(registry.getServiceFromHash(ST_ETH_CONTRACT));
        require(address(_stETH) != address(0), "Invalid St ETH Contract");
    }

    function stETH() public view returns (IERC20) {
        return _stETH;
    }

    function stETHA() public view returns (address) {
        return address(_stETH);
    }
}
