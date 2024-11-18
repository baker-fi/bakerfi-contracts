// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Vault } from "../Vault.sol";

/**
 * @title Strategy Supply AAVEv3 🅿️
 *
 * @author Chef Nil <duarte@bakerfi.xyz>
 *
 * @notice A simple strategy that can deploy or undeploy assets to AAVEv3
 */
contract StrategySupplyAAVEv3 is IStrategy, ReentrancyGuard, Ownable {

  using SafeERC20 for IERC20;

  error ZeroAddress();
  error ZeroAmount();
  error InsufficientBalance();

  // The asset being managed
  address payable private immutable _asset;

  // Strategy Supply AAVEv3 Address
  address private constant _STRATEGY_LEVERAGE_AAVEV3_ADDRESS = 0xC5Dfa3ebaDD8cf122b2b086e3aC28492Da76a0eE;

  /**
   * @param asset_ The address of the asset to be managed
   */
  constructor(address initialOwner, address asset_) ReentrancyGuard() Ownable() {
   if (asset_ == address(0)) revert ZeroAddress();
    _asset = payable(asset_);
    _transferOwnership(initialOwner);
  }

  /**
   * @inheritdoc IStrategy
   */
  function deploy(uint256 amount) external nonReentrant onlyOwner returns (uint256 deployedAmount) {
    if (amount == 0) revert ZeroAmount();
    
    // Transfer assets from caller to strategy
    uint256 shares = Vault(_asset).deposit(amount, _STRATEGY_LEVERAGE_AAVEV3_ADDRESS);

    emit StrategyDeploy(msg.sender, amount);
    emit StrategyAmountUpdate(shares);

    return amount;
  }

  /**
   * @inheritdoc IStrategy
   */
  function harvest() external returns (int256 balanceChange) {
    // what's harvest in supply ?
    return 0;

  }

  /**
   * @inheritdoc IStrategy
   */
  function undeploy(
    uint256 amount
  ) external nonReentrant onlyOwner returns (uint256 undeployedAmount) {
    
    uint256 balance = Vault(_asset).balanceOf(_STRATEGY_LEVERAGE_AAVEV3_ADDRESS);

    if (amount == 0) revert ZeroAmount();
    if (amount > balance) revert InsufficientBalance();

    // Transfer assets back to caller
    Vault(_asset).withdraw(amount, msg.sender, _STRATEGY_LEVERAGE_AAVEV3_ADDRESS);

    balance -= amount;
    emit StrategyUndeploy(msg.sender, amount);
    emit StrategyAmountUpdate(balance);

    return amount;
  }

  /**
   * @inheritdoc IStrategy
   */
  function totalAssets() external view returns (uint256 assets) {
    uint256 balance = Vault(_asset).balanceOf(_STRATEGY_LEVERAGE_AAVEV3_ADDRESS);
    return balance;
  }

  /**
   * @inheritdoc IStrategy
   */
  function asset() external view returns (address) {
    return _asset;
  }
}
