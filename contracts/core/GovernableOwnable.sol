// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

/**
 * @title An Upgradable GovernableOwnable Contract
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev A Contract that could have an independent owner and governor
 *
 * This is quite usesufull when you dont need to have more than 2 roles on a contract
 *
 */
contract GovernableOwnable is OwnableUpgradeable {
  address private _governor;

  error CallerNotTheGovernor();
  error InvalidGovernorAddress();

  event GovernshipTransferred(address indexed previousGovernor, address indexed newGovernor);

  function _initializeGovernableOwnable(
    address initialOwner,
    address initialGovernor
  ) internal onlyInitializing {
    _transferOwnership(initialOwner);
    _transferGovernorship(initialGovernor);
  }

  /**
   * Modifier that checks if the caller is governor
   */
  modifier onlyGovernor() {
    if (msg.sender != governor()) revert CallerNotTheGovernor();
    _;
  }

  /**
   * Gets the Governor of the contrat
   */
  function governor() public view virtual returns (address) {
    return _governor;
  }

  /**
   * Changes the contract Governor
   * @param _newGovernor the new Governor addres
   */
  function transferGovernorship(address _newGovernor) public virtual onlyGovernor {
    if (_newGovernor == address(0)) revert InvalidGovernorAddress();
    _transferGovernorship(_newGovernor);
  }

  function _transferGovernorship(address newGovernor) internal virtual {
    emit GovernshipTransferred(_governor, newGovernor);
    _governor = newGovernor;
  }
}
