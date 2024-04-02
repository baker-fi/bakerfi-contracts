// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {ProxyAdmin} from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

/**
 * @title
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 * @notice
 */
contract BakerFiProxyAdmin is ProxyAdmin {
    
    error InvalidOwner();
    
    constructor(address initialOwner) ProxyAdmin() {
        if(initialOwner == address(0)) revert InvalidOwner();
        _transferOwnership(initialOwner);
    }
}
