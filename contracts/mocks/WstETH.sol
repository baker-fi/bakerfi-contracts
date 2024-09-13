// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IWStETH } from "../interfaces/lido/IWStETH.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract WstETHMock is IWStETH, ERC20 {
  IERC20 _stETH;

  // StETH -> WSTETH 0.86
  uint256 private _exchangeRate = 8665 * (1e5);
  uint256 public PRICE_PRECISION = 1000 * (1e6);

  constructor(IERC20 stETHToken) ERC20("Wrapped liquid staked Ether 2.0", "wstETH") {
    _stETH = stETHToken;
  }

  receive() external payable {
    uint256 wstETHAmount = (stEthPerToken() * msg.value) / PRICE_PRECISION;
    _mint(msg.sender, wstETHAmount);
  }

  function wrap(uint256 _stETHAmount) external returns (uint256) {
    require(_stETHAmount > 0, "wstETH: can't wrap zero stETH");
    uint256 wstETHAmount = (stEthPerToken() * _stETHAmount) / PRICE_PRECISION;
    _mint(msg.sender, wstETHAmount);
    _stETH.transferFrom(msg.sender, address(this), _stETHAmount);
    return wstETHAmount;
  }
  function unwrap(uint256 _wstETHAmount) external returns (uint256) {
    require(_wstETHAmount > 0, "wstETH: zero amount unwrap not allowed");
    uint256 stETHAmount = (_wstETHAmount / stEthPerToken()) * PRICE_PRECISION;
    _burn(msg.sender, _wstETHAmount);
    _stETH.transfer(msg.sender, stETHAmount);
    return stETHAmount;
  }

  function stETH() external view returns (address) {
    return address(_stETH);
  }

  function stEthPerToken() public view returns (uint256) {
    return _exchangeRate;
  }

  function setExchangeRate(uint256 rate) external {
    _exchangeRate = rate;
  }
}
