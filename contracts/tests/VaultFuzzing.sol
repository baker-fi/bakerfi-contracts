
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import { BakerFiVault } from "../core/BakerFiVault.sol";
import { ServiceRegistry } from "../core/ServiceRegistry.sol";
import { Settings } from "../core/Settings.sol";
import { StrategyMock } from "../mocks/StrategyMock.sol";
import { SETTINGS } from "../core/Constants.sol";

/**
 * @title 
 * @author 
 * @notice 
 */
contract VaultFuzzing {

    BakerFiVault _vault;
    
    constructor() payable {
        StrategyMock strategy =  new StrategyMock();
        ServiceRegistry register = new ServiceRegistry(address(this));       
        Settings settings = new Settings(address(this));       
        register.registerService(
            SETTINGS,
            address(settings)
        );
        _vault = new BakerFiVault(
            address(this),
            register,
            strategy
        );
        
    }

    function do_deposit() payable public {
        _vault.deposit{value: msg.value}(address(this));
    }

    /** Withdraw Everything */
    function do_withdraw() public {
        _vault.withdraw(_vault.balanceOf(address(this)));        
    }   

    function echidna_totalSupplyEqualZeroAndTotalAssetsNotZero() public view returns (bool) {
       return (_vault.totalAssets() > 0 && _vault.totalSupply() > 0 )
               || (_vault.totalAssets() == 0 && _vault.totalSupply() == 0);
    }

    
}