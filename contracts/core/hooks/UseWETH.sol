// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {WETH_CONTRACT} from "../Constants.sol";
import {IWETH} from "../../interfaces/tokens/IWETH.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


abstract contract UseWETH {
    IWETH immutable _wETH;
    using SafeERC20 for IERC20;

    constructor(ServiceRegistry registry) {
        _wETH = IWETH(registry.getServiceFromHash(WETH_CONTRACT));
    }

    function wETH() internal view returns (IWETH) {
        return _wETH;
    }

    function wETHA() internal view returns (address) {
        return address(_wETH);
    }

    function unwrapWETH(uint256 wETHAmount) internal {
        IERC20(address(_wETH)).safeApprove(address(_wETH), wETHAmount);
        wETH().withdraw(wETHAmount);
    }
}