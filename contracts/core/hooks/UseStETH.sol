// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry, ST_ETH_CONTRACT} from "../ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

abstract contract UseStETH is Initializable  {
    IERC20 private _stETH;

    function _initUseStETH(ServiceRegistry registry) internal onlyInitializing {
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
