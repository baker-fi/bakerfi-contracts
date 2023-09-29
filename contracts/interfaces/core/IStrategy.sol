
// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

interface IStrategy {

    /**
     * Deploy 
     */
    function deploy() external payable returns (uint256 amountAdded);
    function harvest() external returns (int256 balanceChange);
    function undeploy(uint256 amount, address payable receiver) external returns (uint256 actualAmount);   
    function exit() external returns (uint256 actualAmount);   
    function getPosition() external view returns ( uint256 totalCollateralInEth,  uint256 totalDebtInEth);
    function getTargetLTV() external view returns (uint256 target);   
    function setTargetLTV(uint256 target) external;   
}
