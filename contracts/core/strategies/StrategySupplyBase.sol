// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { MathLibrary } from "../../libraries/MathLibrary.sol";

/**
 * @title Strategy Supply Base is a base contract for strategies that can deploy or
 * undeploy assets
 *
 * @author Chef Nil <duarte@bakerfi.xyz>
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 *
 * @notice A simple strategy that can deploy or undeploy assets to a lending pool
 */
abstract contract StrategySupplyBase is IStrategy, ReentrancyGuard, Ownable {
  using SafeERC20 for ERC20;
  using MathLibrary for uint256;

  error FailedToApproveAllowanceForAAVE();
  error ZeroAddress();
  error ZeroAmount();
  error InsufficientBalance();
  error WithdrawalValueMismatch();

  // The asset being managed
  address internal immutable _asset;

  // The amount of the asset that was successfully deployed
  uint256 private _deployedAmount;

  /**
   * @param asset_ The address of the asset to be managed
   */
  constructor(address initialOwner, address asset_) ReentrancyGuard() Ownable() {
    if (initialOwner == address(0) || asset_ == address(0)) revert ZeroAddress();

    _asset = asset_;
    _transferOwnership(initialOwner);
  }
  /**
   * @notice Deploys a specified amount of the managed asset to the lending pool.
   * @param amount The amount of the asset to be deployed.
   * @return The amount of the asset that was successfully deployed.
   */
  function _deploy(uint256 amount) internal virtual returns (uint256);

  /**
   * @notice Undeploys a specified amount of the managed asset from the lending pool.
   * @param amount The amount of the asset to be undeployed.
   * @return The amount of the asset that was successfully undeployed.
   */
  function _undeploy(uint256 amount) internal virtual returns (uint256);

  /**
   * @notice Retrieves the current balance of the managed asset in the lending pool.
   * @dev This function does not perform any conversion to USD.
   * @return The current balance of the managed asset.
   */
  function _getBalance() internal view virtual returns (uint256);

  /**
   * @inheritdoc IStrategy
   */
  function deploy(uint256 amount) external nonReentrant onlyOwner returns (uint256 deployedAmount) {
    if (amount == 0) revert ZeroAmount();

    // Transfer assets from user
    ERC20(_asset).safeTransferFrom(msg.sender, address(this), amount);

    // Transfer assets from caller to strategy
    deployedAmount = _deploy(amount);

    _deployedAmount += deployedAmount;

    emit StrategyDeploy(msg.sender, deployedAmount);

    emit StrategyAmountUpdate(_deployedAmount);

    return deployedAmount;
  }

  /**
   * @inheritdoc IStrategy
   */
  function harvest() external onlyOwner returns (int256 balanceChange) {
    // Get Balance
    uint256 newBalance = getBalance();

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

    // Get Balance
    uint256 balance = getBalance();
    if (amount > balance) revert InsufficientBalance();

    // Transfer assets back to caller
    uint256 withdrawalValue = _undeploy(amount);

    // Update the deployed amount
    _deployedAmount -= withdrawalValue;

    // Check withdrawal value matches the initial amount
    // Transfer assets to user
    ERC20(_asset).safeTransfer(msg.sender, withdrawalValue);

    balance -= withdrawalValue;
    emit StrategyUndeploy(msg.sender, withdrawalValue);
    emit StrategyAmountUpdate(balance);

    return withdrawalValue;
  }

  /**
   * @inheritdoc IStrategy
   */
  function totalAssets() external view returns (uint256) {
    return getBalance();
  }

  /**
   * @inheritdoc IStrategy
   */
  function asset() external view returns (address) {
    return _asset;
  }

  /**
   * Get the Current Balance on AAVEv3
   *
   * @dev !Important: No Conversion to USD Done
   */
  function getBalance() public view virtual returns (uint256) {
    return _getBalance();
  }
}
