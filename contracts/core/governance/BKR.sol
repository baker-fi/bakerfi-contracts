// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { ERC20Votes } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";

/**
 *
 * @title BKR ERC-20 Token
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev Baker, the BakerFi Governance ERC-20 Token
 *
 * 500M Total Supply
 *
 * No Taxes and no Bullshit
 */
contract BKR is ERC20, Ownable, ERC20Permit, ERC20Votes {
  string private constant _NAME = "BakerFi";
  string private constant _SYMBOL = "BKR";
  uint256 private constant _MAXSUPPLY = 500_000_000 * 1e18; // 500M

  constructor(address initialOwner) ERC20(_NAME, _SYMBOL) ERC20Permit(_NAME) ERC20Votes() {
    _mint(initialOwner, _MAXSUPPLY);
    transferOwnership(initialOwner);
  }

  function _afterTokenTransfer(
    address from,
    address to,
    uint256 amount
  ) internal override(ERC20, ERC20Votes) {
    super._afterTokenTransfer(from, to, amount);
  }

  function _mint(address to, uint256 amount) internal override(ERC20, ERC20Votes) {
    super._mint(to, amount);
  }

  function _burn(address account, uint256 amount) internal override(ERC20, ERC20Votes) {
    super._burn(account, amount);
  }
}
