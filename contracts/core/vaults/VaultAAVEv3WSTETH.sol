// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Rebase, RebaseLibrary} from "../../libraries/BoringRebase.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import {IStrategyVault} from "../../interfaces/core/IStrategyVault.sol";
import {StrategyAAVEv3WSTETH} from "../strategies/StrategyAAVEv3WSTETH.sol";
import {SafeERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import {PERCENTAGE_PRECISION} from "../Constants.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {UseSettings} from "../hooks/UseSettings.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {VaultBase} from "./VaultBase.sol";

/**
 * @title BakerFi Vault 🏦🧑‍🍳
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 * 
 * @dev The BakerFi vault deployed to any supported chain (Arbitrum One, Optimism, Ethereum,...)
 * 
 * This is smart contract where the users deposit their ETH and receives a share of the pool <x>brETH. 
 * A share of the pool is an ERC-20 Token (transferable) and could be used to later to withdraw their 
 * owned amount of the pool that could contain (Assets + Yield ). This vault could use a customized IStrategy 
 * to deploy the capital and harvest an yield.
 * 
 * The Contract is able to charge a performance and withdraw fee that is send to the treasury 
 * owned account when the fees are set by the deploy owner.
 *
 * The Vault is Pausable by the the governor and is using the settings contract to retrieve base 
 * performance, withdraw fees and other kind of settings.
 * 
 * During the beta phase only whitelisted addresses are able to deposit and withdraw
 *  
 * The Contract is upgradable and can use a BakerProxy in front of.
 * 
 */
contract VaultAAVEv3WSTETH is 
    VaultBase,     
    StrategyAAVEv3WSTETH
{
    using RebaseLibrary for Rebase;
    using SafeERC20Upgradeable for ERC20Upgradeable;
    using AddressUpgradeable for address;
    using AddressUpgradeable for address payable;


    function initialize(
        address initialOwner,
        ServiceRegistry registry,
        uint24 swapFeeTier,
        uint8 eModeCategory
    ) public initializer {
        
        initializeBaseVault(          
            registry
        );   
        initializeStrategy( 
            initialOwner,
            registry, 
            swapFeeTier, 
            eModeCategory
        );
    }
}
