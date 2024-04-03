// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.18;

import {StrategyAAVEv3Base} from "./StrategyAAVEv3Base.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {UseStETH} from "../hooks/UseStETH.sol";
import {UseWstETH} from "../hooks/UseWstETH.sol";
import {IERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {WST_ETH_CONTRACT, WSTETH_USD_ORACLE_CONTRACT} from "../ServiceRegistry.sol";

/**
 * @title  AAVE v3 Recursive Staking Strategy for awstETH/WETH on EThereum
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev This strategy requires access to for Lido Finance contracts that run
 * exclusively on Ethereum
 *
 * The strategy inherits all the business logic from StrategyAAVEv3Base and overrides the conversion
 * mechanisms to convert from collateral token to debt token.
 *
 */
contract StrategyAAVEv3WstETH is Initializable, StrategyAAVEv3Base, UseWstETH, UseStETH {
    using SafeERC20Upgradeable for IERC20Upgradeable;
    using AddressUpgradeable for address payable;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // solhint-disable no-empty-blocks
    function initialize(
        address initialOwner,
        ServiceRegistry registry,
        uint24 swapFeeTier,
        uint8 eModeCategory
    ) public initializer {
        _initializeStrategyAAVEv3Base(
            initialOwner,
            registry,
            WST_ETH_CONTRACT,
            WSTETH_USD_ORACLE_CONTRACT,
            swapFeeTier,
            eModeCategory
        );
        _initUseWstETH(registry);
        _initUseStETH(registry);
        if (!stETH().approve(uniRouterA(), 2 ** 256 - 1)) revert FailedToApproveAllowance();
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
        return
            _swap(
                ISwapHandler.SwapParams(
                    wstETHA(), // Asset In
                    wETHA(), // Asset Out
                    ISwapHandler.SwapType.EXACT_INPUT, // Swap Mode
                    amount, // Amount In
                    0, // Amount Out
                    _swapFeeTier, // Fee Pair Tier
                    bytes("") // User Payload
                )
            );
    }
}
