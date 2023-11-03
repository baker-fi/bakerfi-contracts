// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {ST_ETH_CONTRACT, WST_ETH_CONTRACT} from "../Constants.sol";
import {IWETH} from "../../interfaces/tokens/IWETH.sol";
import {IWStETH} from "../../interfaces/lido/IWStETH.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


abstract contract UseWstETH {
    IWStETH immutable private _wstETH;
    IERC20 immutable private _stETHToken;
    
    using SafeERC20 for IERC20;

    constructor(ServiceRegistry registry) {
        _wstETH = IWStETH(registry.getServiceFromHash(WST_ETH_CONTRACT));
        _stETHToken = IERC20(registry.getServiceFromHash(ST_ETH_CONTRACT));
        require(address(_wstETH) != address(0), "Invalid WstETH Contract");
        require(address(_stETHToken) != address(0), "Invalid StETH Contract");
    }

    function wstETH() public view returns (IWStETH) {
        return _wstETH;
    }

    function wstETHA() public view returns (address) {
        return address(_wstETH);
    }

    function _unwrapWstETH(uint256 amount) internal returns (uint256 stETHAmount) {
        require(IERC20(wstETHA()).approve(wstETHA(), amount));
        stETHAmount = wstETH().unwrap(amount);
    }

    function _wrapWstETH(uint256 amount) internal returns (uint256 amountOut) {
        require(_stETHToken.approve(wstETHA(), amount));
        amountOut = IWStETH(wstETHA()).wrap(amount);
    }
}
