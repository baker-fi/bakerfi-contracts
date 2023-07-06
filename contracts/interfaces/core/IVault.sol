// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

interface IVault {    
    function toAmount(uint256 _share, bool roundUp) external view returns (uint256);
    function toShare(uint256 amount,bool roundUp) external view returns (uint256 share);
    function withdraw(address from, address to, uint256 amount, uint256 share) external returns (uint256, uint256);
    function deposit(address from, address to, uint256 amount, uint256 share) external returns (uint256, uint256);       
}