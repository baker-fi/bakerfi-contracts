
// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

interface IStrategy {

    function deploy() external payable returns (uint256 amountAdded);
    function harvest() external returns (uint256 amountAdded);
    function undeploy(uint256 amount, address payable receiver) external returns (uint256 actualAmount);   
    function getPosition() external view returns ( uint256 totalCollateralInEth,  uint256 totalDebtInEth);
    function updatePositionInfo() external;
}
