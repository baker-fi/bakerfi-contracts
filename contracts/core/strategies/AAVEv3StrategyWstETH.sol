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
 * @title WST used
 * @author Hélder Vasconcelos
 * @author Henrique Macedo 
 * @notice
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
