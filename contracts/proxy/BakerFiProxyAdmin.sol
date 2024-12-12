// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ProxyAdmin } from "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

/**
 * @title BakerFiProxyAdmin
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 * @notice This contract serves as the admin for the BakerFi proxy, allowing for the management
 *         of the proxy's implementation contracts. It inherits from OpenZeppelin's ProxyAdmin,
 *         which provides the necessary functionality to upgrade the implementation and manage
 *         ownership.
 */
contract BakerFiProxyAdmin is ProxyAdmin {
  /// @notice Error thrown when the provided owner address is invalid (zero address).
  error InvalidOwner();

  /**
   * @param initialOwner The address of the initial owner of the proxy admin.
   * @dev The constructor initializes the ProxyAdmin with the provided initial owner.
   *      It reverts if the initial owner address is the zero address.
   */
  constructor(address initialOwner) ProxyAdmin() {
    if (initialOwner == address(0)) revert InvalidOwner();
    _transferOwnership(initialOwner);
  }
}
