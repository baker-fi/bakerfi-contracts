// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

interface IStrategy {
    /**
     * Deploy
     */
    function deploy() external payable returns (uint256 amountAdded);

    function harvest() external returns (int256 balanceChange);

    function undeploy(
        uint256 amount
    ) external returns (uint256 actualAmount);

    function deployed() external view returns (uint256 assets);    
}
