// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IStETH is IERC20 {
  function getSharesByPooledEth(uint256 _ethAmount) external view returns (uint256);

  function getPooledEthByShares(uint256 _sharesAmount) external view returns (uint256);

  function submit(address referral) external payable returns (uint256 amount);

  function burnShares(
    address _account,
    uint256 _sharesAmount
  ) external returns (uint256 newTotalShares);

  function sharesOf(address account) external view returns (uint256);

  function getTotalShares() external view returns (uint256);

  function getTotalPooledEther() external view returns (uint256);
}
