// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AAVEv3StrategyBase} from "./AAVEv3StrategyBase.sol";
import {CBETH_ERC20, CBETH_ETH_ORACLE} from "../Constants.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {UseWETH} from "../hooks/UseWETH.sol";
import {UseOracle} from "../hooks/UseOracle.sol";
import {UseIERC20} from "../hooks/UseIERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IWStETH} from "../../interfaces/lido/IWStETH.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title
 * @author
 * @notice
 */
contract AAVEv3StrategyAny is AAVEv3StrategyBase {
    using SafeERC20 for IERC20;

    // solhint-disable no-empty-blocks  
    constructor(
        address initialOwner,
        ServiceRegistry registry,
        bytes32 collateral,
        bytes32 oracle
    ) AAVEv3StrategyBase(initialOwner, registry, collateral, oracle) {}
    // solhint-enable no-empty-blocks    

    function _convertFromWETH(uint256 amount) internal virtual override returns (uint256) {
        // 1. Swap WETH -> cbETH
        return _swaptoken(wETHA(), ierc20A(), 0, amount, 0);
    }

    function _convertToWETH(uint256 amount) internal virtual override returns (uint256) {
        // 1.Swap cbETH -> WETH
        return _swaptoken(ierc20A(), wETHA(), 0, amount, 0);
    }
}
