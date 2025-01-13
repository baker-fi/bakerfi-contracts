// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract ERC20Mock is ERC20, ERC20Permit, Ownable {
  uint8 private _decimals;

  constructor(
    string memory name,
    string memory symbol,
    uint256 _cap,
    address owner
  ) ERC20(name, symbol) ERC20Permit(name) Ownable() {
    _mint(owner, _cap);
    _transferOwnership(owner);
    _decimals = 18;
  }

  function decimals() public view override returns (uint8) {
    return _decimals;
  }

  function setDecimals(uint8 decimals_) external {
    _decimals = decimals_;
  }
}
