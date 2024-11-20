// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import { IFlashLoanRecipient } from "../interfaces/balancer/IFlashLoan.sol";
import { IProtocolFeesCollector } from "../interfaces/balancer/IProtocolFeesCollector.sol";
import { IVault } from "../interfaces/balancer/IVault.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BalancerVaultMock is IVault, IProtocolFeesCollector {
  IERC20 private immutable _flashLoanToken;

  error InvalidTokenList();
  error InvalidAmountList();
  error InvalidToken();
  error NoEnoughBalance();
  error LoanNotPaid();

  constructor(IERC20 flashLoanToken) {
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
    if (tokens.length != 1) revert InvalidTokenList();
    if (amounts.length != 1) revert InvalidAmountList();
    if (tokens[0] != address(_flashLoanToken)) revert InvalidToken();
    uint256 balanceBefore = _flashLoanToken.balanceOf(address(this));
    if (balanceBefore <= amounts[0]) revert NoEnoughBalance();
    uint256[] memory fees = new uint256[](1);
    _flashLoanToken.transfer(recipient, amounts[0]);
    IFlashLoanRecipient(recipient).receiveFlashLoan(tokens, amounts, fees, userData);
    uint256 balanceAfter = _flashLoanToken.balanceOf(address(this));
    if (balanceAfter < balanceBefore) revert LoanNotPaid();
  }

  function swap(
    SingleSwap memory,
    FundManagement memory,
    uint256,
    uint256
  ) external payable returns (uint256) {
    return 0;
  }

  function querySwap(SingleSwap memory, FundManagement memory) external pure returns (uint256) {
    return 0;
  }
}
