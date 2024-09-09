// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface IProtocolFeesCollector {
  function getFlashLoanFeePercentage() external view returns (uint256);
}
