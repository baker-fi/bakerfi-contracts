// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

abstract contract IVault{
    function deposit(address receiver) external virtual payable returns (uint256 shares);
    function withdraw(uint256 shares) external virtual returns (uint256 amount);
    function totalAssets() public view virtual returns (uint256 amount);
    function convertToShares(uint256 assets) external virtual view returns (uint256 shares);
    function convertToAssets(uint256 shares) external virtual view returns (uint256 assets);
    function tokenPerETh() external view virtual returns (uint256);
    function rebalance() external virtual returns (int256 balanceChange);
}