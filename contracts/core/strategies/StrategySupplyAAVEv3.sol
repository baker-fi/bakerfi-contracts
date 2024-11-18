// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IPoolV3 } from "../../interfaces/aave/v3/IPoolV3.sol";
import { DataTypes } from "../../interfaces/aave/v3/DataTypes.sol";

import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

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
  address private immutable _STRATEGY_LEVERAGE_AAVEV3_ADDRESS;

  uint256 _deployedAmount;

  uint256 _totalAssets; // TODO: set this?

  IPoolV3 private _aavev3;

  /**
   * @param asset_ The address of the asset to be managed
   */
  constructor(address initialOwner, address asset_, address STRATEGY_LEVERAGE_AAVEV3_ADDRESS_) ReentrancyGuard() Ownable() {
   if (asset_ == address(0)) revert ZeroAddress();
    _asset = payable(asset_);
    _STRATEGY_LEVERAGE_AAVEV3_ADDRESS = STRATEGY_LEVERAGE_AAVEV3_ADDRESS_;
    _aavev3 = IPoolV3(STRATEGY_LEVERAGE_AAVEV3_ADDRESS_);
    _transferOwnership(initialOwner);
  }

  /**
   * @inheritdoc IStrategy
   */
  function deploy(uint256 amount) external nonReentrant onlyOwner returns (uint256 deployedAmount) {
    if (amount == 0) revert ZeroAmount();
    
    // Transfer assets from caller to strategy
    _aavev3.supply(_asset, amount, msg.sender, 0);
    

    // TODO: get shares amount and emit amount update
    emit StrategyDeploy(msg.sender, amount);

    // emit StrategyAmountUpdate(shares);

    _deployedAmount += amount;
    
    return amount;
  }

  /**
   * @inheritdoc IStrategy
   */
  function harvest() external returns (int256 balanceChange) {
    uint256 newBalance = _totalAssets;

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
     // TODO: check balance
    uint256 balance = 0;

    if (amount == 0) revert ZeroAmount();
    if (amount > balance) revert InsufficientBalance();

    // Transfer assets back to caller
    _aavev3.withdraw(_asset, amount, msg.sender);

    balance -= amount;
    emit StrategyUndeploy(msg.sender, amount);
    emit StrategyAmountUpdate(balance);

    return amount;
  }

  /**
   * @inheritdoc IStrategy
   */
  function totalAssets() external view returns (uint256 assets) {
   return _totalAssets;
  }

  /**
   * @inheritdoc IStrategy
   */
  function asset() external view returns (address) {
    return _asset;
  }
}
