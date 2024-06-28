// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IWETH is IERC20 {
  function allowance(address, address) external view returns (uint256);

  function balanceOf(address) external view returns (uint256);

  function approve(address, uint256) external returns (bool success);

  function transfer(address, uint256) external returns (bool);

  function transferFrom(address, address, uint256) external returns (bool);

  function deposit() external payable;

  function withdraw(uint256) external;
}
