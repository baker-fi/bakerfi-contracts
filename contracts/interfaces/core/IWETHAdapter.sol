
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

abstract contract IWETHAdapter  {
    function _swapFromWETH(uint256 amount) virtual internal returns (uint256);
    function _swapToWETH(uint256 amount) virtual internal returns (uint256);
    function _toWETH(uint256 amount) virtual internal returns (uint256);
    function _fromWETH(uint256 amount) virtual internal returns (uint256);    
}