// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Strategy Park 🅿️ (🚫 Yield)
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice A simple strategy that parks assets without generating yield,
 * only the owner can deploy or undeploy assets
 */
contract StrategyPark is IStrategy, ReentrancyGuard, Ownable {
  using SafeERC20 for IERC20;

  error ZeroAddress();
  error ZeroAmount();
  error InsufficientBalance();

  // The asset being managed
  address private immutable _asset;

  // Track deployed amount
  uint256 private _deployedAmount;

  /**
   * @param asset_ The address of the asset to be managed
   */
  constructor(address initialOwner, address asset_) ReentrancyGuard() Ownable() {
    if (asset_ == address(0)) revert ZeroAddress();
    _asset = asset_;
    _transferOwnership(initialOwner);
  }

  /**
   * @inheritdoc IStrategy
   */
  function deploy(uint256 amount) external nonReentrant onlyOwner returns (uint256 deployedAmount) {
    if (amount == 0) revert ZeroAmount();

    // Transfer assets from caller to strategy
    IERC20(_asset).safeTransferFrom(msg.sender, address(this), amount);

    _deployedAmount += amount;
    emit StrategyDeploy(msg.sender, amount);
    emit StrategyAmountUpdate(_deployedAmount);

    return amount;
  }

  /**
   * @inheritdoc IStrategy
   */
  function harvest() external onlyOwner returns (int256 balanceChange) {
    uint256 newBalance = IERC20(_asset).balanceOf(address(this));
    // No yield generation in parking strategy
    balanceChange = int256(newBalance) - int256(_deployedAmount);

    if (balanceChange > 0) {
      emit StrategyProfit(uint256(balanceChange));
    } else if (balanceChange < 0) {
      emit StrategyLoss(uint256(-balanceChange));
    }

    if (balanceChange != 0) {
      emit StrategyAmountUpdate(newBalance);
    }
    _deployedAmount = newBalance;
  }

  /**
   * @inheritdoc IStrategy
   */
  function undeploy(
    uint256 amount
  ) external nonReentrant onlyOwner returns (uint256 undeployedAmount) {
    if (amount == 0) revert ZeroAmount();
    if (amount > _deployedAmount) revert InsufficientBalance();

    // Transfer assets back to caller
    IERC20(_asset).safeTransfer(msg.sender, amount);

    _deployedAmount -= amount;
    emit StrategyUndeploy(msg.sender, amount);
    emit StrategyAmountUpdate(_deployedAmount);

    return amount;
  }

  /**
   * @inheritdoc IStrategy
   */
  function totalAssets() external view returns (uint256 assets) {
    return IERC20(_asset).balanceOf(address(this));
  }

  /**
   * @inheritdoc IStrategy
   */
  function asset() external view returns (address) {
    return _asset;
  }
}
