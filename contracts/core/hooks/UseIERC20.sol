// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UseIERC20 is Initializable {
    IERC20 private _ierc20;

    function _initUseIERC20(ServiceRegistry registry, bytes32 name) internal onlyInitializing {
        _ierc20 = IERC20(registry.getServiceFromHash(name));
        require(address(_ierc20) != address(0), "Invalid IERC20 Contract");
    }

    function ierc20() public view returns (IERC20) {
        return _ierc20;
    }

    function ierc20A() public view returns (address) {
        return address(_ierc20);
    }
}
