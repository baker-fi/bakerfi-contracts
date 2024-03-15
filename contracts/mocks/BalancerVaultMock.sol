// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
import {IFlashLoanRecipient, IFlashLoans } from "../interfaces/balancer/IFlashLoan.sol";
import {IProtocolFeesCollector} from "../interfaces/balancer/IProtocolFeesCollector.sol";
import {IVault } from "../interfaces/balancer/IVault.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract BalancerVaultMock is IVault, IProtocolFeesCollector{
    
    IERC20 private immutable _flashLoanToken;

    constructor(
        IERC20 flashLoanToken
    ) {
       _flashLoanToken = flashLoanToken; 
    }

    function getProtocolFeesCollector() external view returns (IProtocolFeesCollector) {
        return this;
    }

     function getFlashLoanFeePercentage() external pure returns (uint256) {
        return 0;
     }

    function flashLoan(
        address recipient,
        address[] memory tokens,
        uint256[] memory amounts,
        bytes memory userData
    ) external override {
        require(tokens.length == 1, "Invalid Tokens Len");
        require(amounts.length == 1, "Invalid Amounts Len");
        require(tokens[0]== address(_flashLoanToken), "Invalid Flash Loan requested");
        uint256 balanceBefore = _flashLoanToken.balanceOf(address(this));        
        require(balanceBefore > amounts[0] , "Not Enough Balance");
        uint256[] memory fees = new uint256[](1);
        _flashLoanToken.transfer(recipient, amounts[0]);
        IFlashLoanRecipient(recipient).receiveFlashLoan(
            tokens,
            amounts,
            fees,
            userData
        );
        uint256 balanceAfter = _flashLoanToken.balanceOf(address(this));        
        require(balanceAfter == balanceBefore, "Flash Loan not returned");
    }
}