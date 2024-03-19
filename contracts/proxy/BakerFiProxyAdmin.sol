// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import {BakerFiProxy} from "./BakerFiProxy.sol";

/**
 * @title
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 * @notice
 */
contract BakerFiProxyAdmin is ProxyAdmin {
    constructor(address initialOwner) ProxyAdmin() {
        require(initialOwner != address(0), "Invalid Owner Address");
        _transferOwnership(initialOwner);
    }
}
