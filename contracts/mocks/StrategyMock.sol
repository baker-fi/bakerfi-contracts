// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IStrategy } from "../interfaces/core/IStrategy.sol";
import { IOracle } from "../interfaces/core/IOracle.sol";
import { IOracle } from "../interfaces/core/IOracle.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

contract StrategyMock is IStrategy {
  using Address for address payable;
  uint256 internal _debRatio = 50; // 100
  int256 internal _havestPerCall = 0; // 100

  address _asset;

  error NoBalance();

  constructor(address assetSt) {
    _asset = assetSt;
  }

  function deploy(uint256 amount) external returns (uint256 amountAdded) {
    emit StrategyAmountUpdate(amount);
    IERC20Upgradeable(_asset).transferFrom(msg.sender, address(this), amount);
    return amount;
  }

  function harvest() external view returns (int256 balanceChange) {
    return _havestPerCall;
  }

  function undeploy(uint256 amount) external returns (uint256 actualAmount) {
    if (IERC20Upgradeable(_asset).balanceOf(address(this)) < amount) revert NoBalance();
    IERC20Upgradeable(_asset).transfer(msg.sender, amount);
    emit StrategyAmountUpdate(address(this).balance - amount);
    return amount;
  }

  function totalAssets() external view override returns (uint256 actualAmount) {
    uint256 col = IERC20Upgradeable(_asset).balanceOf(address(this));
    uint256 deb = (col * _debRatio) / 100;
    actualAmount = col >= deb ? col - deb : 0;
  }

  function getPosition()
    external
    view
    returns (uint256 totalCollateralInEth, uint256 totalDebtInEth, uint256 loanToValue)
  {
    uint256 balance = IERC20Upgradeable(_asset).balanceOf(address(this));
    return (balance, (balance * _debRatio) / 100, 1e9);
  }

  function setRatio(uint256 ratio) public {
    _debRatio = ratio;
  }

  function setHarvestPerCall(int256 havestPerCall) public {
    _havestPerCall = havestPerCall;
  }

  function asset() external view returns (address) {
    return _asset;
  }
}
