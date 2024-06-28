// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IStrategy } from "../interfaces/core/IStrategy.sol";
import { IOracle } from "../interfaces/core/IOracle.sol";

contract StrategyMock is IStrategy {
  using Address for address payable;
  uint256 internal _debRatio = 50; // 100
  int256 internal _havestPerCall = 0; // 100

  error NoBalance();

  function deploy() external payable override returns (uint256 amountAdded) {
    emit StrategyAmountUpdate(msg.value);
    return msg.value;
  }

  function harvest() external view override returns (int256 balanceChange) {
    return _havestPerCall;
  }

  function undeploy(uint256 amount) external override returns (uint256 actualAmount) {
    if (address(this).balance < amount) revert NoBalance();
    payable(msg.sender).sendValue(amount);
    emit StrategyAmountUpdate(address(this).balance - amount);
    return amount;
  }

  function deployed(
    IOracle.PriceOptions memory
  ) external view override returns (uint256 actualAmount) {
    uint256 col = address(this).balance;
    uint256 deb = (col * _debRatio) / 100;
    actualAmount = col >= deb ? col - deb : 0;
  }

  function getPosition()
    external
    view
    returns (uint256 totalCollateralInEth, uint256 totalDebtInEth, uint256 loanToValue)
  {
    return (address(this).balance, (address(this).balance * _debRatio) / 100, 1e9);
  }

  function setRatio(uint256 ratio) public {
    _debRatio = ratio;
  }

  function setHarvestPerCall(int256 havestPerCall) public {
    _havestPerCall = havestPerCall;
  }
}
