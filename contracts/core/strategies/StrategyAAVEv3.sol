// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {StrategyAAVEv3Base} from "./StrategyAAVEv3Base.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title  AAVE v3 Recursive Staking Strategy for anyETH/WETH
 * 
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 * 
 * @dev This strategy is used by the bakerfi vault to deploy ETH capital 
 * on aave money market.
 * 
 * The Collateral could be cbETH, wstETH, rETH against and the debt is always WETH
 * 
 * The strategy inherits all the business logic from StrategyAAVEv3Base and could be deployed
 * on Optimism, Arbitrum , Base and Ethereum.
 */
contract StrategyAAVEv3 is Initializable, StrategyAAVEv3Base {
    using SafeERC20 for IERC20;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // solhint-disable no-empty-blocks  
    function initialize(
        address initialOwner,
        ServiceRegistry registry,
        bytes32 collateral,
        bytes32 oracle,
        uint24 swapFeeTier,
        uint8 eModeCategory        
    ) public initializer {
        _initializeStrategyAAVEv3Base(
            initialOwner,
            registry, 
            collateral, 
            oracle, 
            swapFeeTier, 
            eModeCategory
        );
    }
    
    /**
     * @dev Internal function to convert the specified amount from WETH to the underlying assert cbETH, wstETH, rETH.
     *
     * This function is virtual and intended to be overridden in derived contracts for customized implementation.
     *
     * @param amount The amount to convert from WETH.
     * @return uint256 The converted amount in the underlying collateral.
     */
    function _convertFromWETH(uint256 amount) internal virtual override returns (uint256) {
        // 1. Swap WETH -> cbETH/wstETH/rETH
        return _swap(
            ISwapHandler.SwapParams(
            wETHA(),                          // Asset In
            ierc20A(),                        // Asset Out
            ISwapHandler.SwapType.EXACT_INPUT, // Swap Mode
            amount,                           // Amount In 
            0,                                // Amount Out
            _swapFeeTier,                                // Fee Pair Tier
            bytes("")                         // User Payload
            )
        );
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
        // 1.Swap cbETH -> WETH/wstETH/rETH
        return _swap(
            ISwapHandler.SwapParams(
                ierc20A(),                      // Asset In
                wETHA(),                        // Asset Out
                ISwapHandler.SwapType.EXACT_INPUT, // Swap Mode
                amount,                         // Amount In 
                0,                              // Amount Out
                _swapFeeTier,                              // Fee Pair Tier
                bytes("")                       // User Payload
            ));
    }
}
