// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IProtocolFeesCollector {
    function getFlashLoanFeePercentage() external view returns (uint256);
}
