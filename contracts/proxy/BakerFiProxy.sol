// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
/**
 * @title  
 * @author BakerFi 
 * @notice 
 */
contract BakerFiProxy is TransparentUpgradeableProxy {
    /**
     *
     * @param _logic First Implementation
     * @param admin_ Proxy Admin
     * @param _data  Data to call
     */
    constructor(
        address _logic,
        address admin_,
        bytes memory _data
    ) TransparentUpgradeableProxy(
        _logic, 
        admin_, 
        _data
    ) {}
   
}
