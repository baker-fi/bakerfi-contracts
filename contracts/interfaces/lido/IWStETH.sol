// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

interface IWStETH {    
    function wrap(uint256 _stETHAmount) external returns (uint256);
    function unwrap(uint256 _wstETHAmount) external returns (uint256);
    function stETH() external view returns (address);
    function stEthPerToken() external view returns (uint256);
}