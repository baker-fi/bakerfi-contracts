// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {WETH_CONTRACT} from "../Constants.sol";
import {IWETH} from "../../interfaces/tokens/IWETH.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


abstract contract UseWETH {
    IWETH immutable private _wETH;
    using SafeERC20 for IERC20;

    constructor(ServiceRegistry registry) {
        _wETH = IWETH(registry.getServiceFromHash(WETH_CONTRACT));
        require(address(_wETH) != address(0), "Invalid Wrapped ETH Contract");
    }

    function wETH() public view returns (IWETH) {
        return _wETH;
    }

    function wETHA() public view returns (address) {
        return address(_wETH);
    }

    function _unwrapWETH(uint256 wETHAmount) internal {
        require(IERC20(address(_wETH)).approve(address(_wETH), wETHAmount));
        wETH().withdraw(wETHAmount);
    }
}