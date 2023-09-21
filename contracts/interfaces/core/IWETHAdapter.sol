
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

abstract contract IWETHAdapter  {
    function _convertFromWETH(uint256 amount) virtual internal returns (uint256);
    function _convertToWETH(uint256 amount) virtual internal returns (uint256);
    function _toWETH(uint256 amount) virtual internal returns (uint256);
    function _fromWETH(uint256 amount) virtual internal returns (uint256);    
}