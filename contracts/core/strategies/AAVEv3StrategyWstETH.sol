// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AAVEv3StrategyBase} from "./AAVEv3StrategyBase.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {UseWETH} from "../hooks/UseWETH.sol";
import {UseStETH} from "../hooks/UseStETH.sol";
import {UseWstETH} from "../hooks/UseWstETH.sol";
import {UseServiceRegistry} from "../hooks/UseServiceRegistry.sol";
import {UseOracle} from "../hooks/UseOracle.sol";
import {UseIERC20} from "../hooks/UseIERC20.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {IWStETH} from "../../interfaces/lido/IWStETH.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { WST_ETH_CONTRACT, WSTETH_ETH_ORACLE_CONTRACT } from "../ServiceRegistry.sol";

/**
 * @title  AAVE v3 Recursive Staking Strategy for awstETH/WETH on EThereum 
 *
 * @author Chef Kenji <chef.kenji@layerx.xyz>
 * @author Chef Kal-EL <chef.kal-el@layerx.xyz>
 *
 * @dev This strategy requires access to for Lido Finance contracts that run 
 * exclusively on Ethereum 
 * 
 * The strategy inherits all the business logic from AAVEv3StrategyBase and overrides the conversion 
 * mechanisms to convert from collateral token to debt token.
 * 
 */
contract AAVEv3StrategyWstETH is Initializable, AAVEv3StrategyBase, UseWstETH, UseStETH {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using AddressUpgradeable for address payable;
    // solhint-disable no-empty-blocks        
    function initialize(
        address initialOwner,
        ServiceRegistry registry,
        uint24 swapFeeTier,
        uint8 eModeCategory
    )  public initializer {
        _initializeAAVEv3StrategyBase(
            initialOwner, 
            registry, 
            WST_ETH_CONTRACT, 
            WSTETH_ETH_ORACLE_CONTRACT, 
            swapFeeTier, 
            eModeCategory
        );
        _initUseWstETH(registry);
        _initUseStETH(registry);
        require(stETH().approve(uniRouterA(), 2**256 - 1));
    }
    // solhint-enable no-empty-blocks    
    /**
     * @dev Internal function to convert the specified amount from WETH to the underlying collateral.
     *
     * This function is virtual and intended to be overridden in derived contracts for customized implementation.
     *
     * @param amount The amount to convert from WETH.
     * @return uint256 The converted amount in the underlying collateral.
     */
    function _convertFromWETH(uint256 amount) internal virtual override returns (uint256) {
        // 1. Unwrap ETH to this account
        wETH().withdraw(amount);
        uint256 wStEthBalanceBefore = wstETH().balanceOf(address(this));
        // 2. Stake and Wrap using the receive function
        payable(wstETHA()).sendValue(amount);
       // require(sent, "Failed to send Ether");
        uint256 wStEthBalanceAfter = wstETH().balanceOf(address(this));
        // 3. Wrap stETH -> wstETH
        return wStEthBalanceAfter - wStEthBalanceBefore;
    }

    /**
     * @dev Internal function to convert the specified amount to WETH from the underlying collateral.
     *
     * This function is virtual and intended to be overridden in derived contracts for customized implementation.
     *
     * @param amount The amount to convert to WETH.
     * @return uint256 The converted amount in WETH.
     */
    function _convertToWETH(uint256 amount) internal virtual override returns (uint256) {
        // Convert from wstETH -> weth directly
        return _swap(
            ISwapHandler.SwapParams(
                wstETHA(),                       // Asset In
                wETHA(),                         // Asset Out
                ISwapHandler.SwapType.EXACT_INPUT,                               // Swap Mode
                amount,                          // Amount In 
                0,                               // Amount Out
                _swapFeeTier,                    // Fee Pair Tier
                bytes("")                        // User Payload
            )
        );
    }
}
