// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

/**
 * @title BakerFiProxy
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 * @notice This contract is a proxy based on OpenZeppelin's TransparentUpgradeableProxy.
 *         It allows for the upgrade of the implementation contract while maintaining
 *         the same address for users interacting with the proxy.
 */
contract BakerFiProxy is TransparentUpgradeableProxy {
  /**
   * @param _logic The address of the first implementation contract.
   * @param admin_ The address of the proxy admin who can upgrade the implementation.
   * @param _data The data to call on the implementation contract upon deployment.
   */
  constructor(
    address _logic,
    address admin_,
    bytes memory _data
  ) TransparentUpgradeableProxy(_logic, admin_, _data) {}
}
