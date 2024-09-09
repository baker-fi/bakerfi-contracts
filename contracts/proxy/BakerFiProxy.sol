// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
/**
 * @title
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
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
  ) TransparentUpgradeableProxy(_logic, admin_, _data) {}
}
