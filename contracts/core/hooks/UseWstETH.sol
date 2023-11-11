// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import { ServiceRegistry, WST_ETH_CONTRACT, ST_ETH_CONTRACT } from "../ServiceRegistry.sol";
import { IWETH } from "../../interfaces/tokens/IWETH.sol";
import { IWStETH } from "../../interfaces/lido/IWStETH.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


abstract contract UseWstETH is Initializable {
    IWStETH private _wstETH;
    IERC20 private _stETHToken;
    
    using SafeERC20 for IERC20;

    function __initUseWstETH(ServiceRegistry registry) internal onlyInitializing {
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
