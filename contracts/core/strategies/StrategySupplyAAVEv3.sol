// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IPoolV3 } from "../../interfaces/aave/v3/IPoolV3.sol";
import { DataTypes } from "../../interfaces/aave/v3/DataTypes.sol";
import { SYSTEM_DECIMALS } from "../../core/Constants.sol";
import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { MathLibrary } from "../../libraries/MathLibrary.sol";


/**
 * @title Strategy Supply AAVEv3 🅿️
 *
 * @author Chef Nil <duarte@bakerfi.xyz>
 *
 * @notice A simple strategy that can deploy or undeploy assets to AAVEv3
 */
contract StrategySupplyAAVEv3 is IStrategy, ReentrancyGuard, Ownable {

  using SafeERC20 for ERC20;

  using MathLibrary for uint256;

  error FailedToApproveAllowanceForAAVE();
  error ZeroAddress();
  error ZeroAmount();
  error InsufficientBalance();
  error WithdrawalValueMismatch();

  // The asset being managed
  address payable private immutable _asset;

  uint256 private _deployedAmount;

  IPoolV3 private immutable _aavev3;

  /**
   * @param asset_ The address of the asset to be managed
   */
  constructor(address initialOwner, address asset_, address aavev3Address) ReentrancyGuard() Ownable() {
    if (initialOwner == address(0) || asset_ == address(0) || aavev3Address == address(0)) revert ZeroAddress();
    
    _asset = payable(asset_);
    _aavev3 = IPoolV3(aavev3Address);
    _transferOwnership(initialOwner);
    if(!ERC20(_asset).approve(aavev3Address, type(uint256).max)){
      revert FailedToApproveAllowanceForAAVE();
    }
  }

  /**
   * @inheritdoc IStrategy
   */
  function deploy(uint256 amount) external nonReentrant onlyOwner returns (uint256) {
    if (amount == 0) revert ZeroAmount();

    // Transfer assets from user
    ERC20(_asset).safeTransferFrom(msg.sender, address(this), amount);

    // Transfer assets from caller to strategy
    _aavev3.supply(_asset, amount, address(this), 0);  

    _deployedAmount += amount;

    emit StrategyDeploy(msg.sender, amount);

    emit StrategyAmountUpdate(_deployedAmount);
    
    return _deployedAmount;
  }

  /**
   * @inheritdoc IStrategy
   */
  function harvest() external returns (int256 balanceChange) {
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

    uint256 balance = getBalance();

    if (amount == 0) revert ZeroAmount();
    if (amount > balance) revert InsufficientBalance();

    // Transfer assets back to caller
    uint256 withdrawalValue = _aavev3.withdraw(_asset, amount, address(this));

    // Check withdrawal value matches the initial amount
    if(withdrawalValue != amount) revert WithdrawalValueMismatch();

    // Transfer assets to user
    ERC20(_asset).safeTransfer(msg.sender, amount);

    balance -= amount;
    emit StrategyUndeploy(msg.sender, amount);
    emit StrategyAmountUpdate(balance);

    return amount;
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
  function getBalance()
    public
    view
    virtual
    returns (uint256)
  {
    DataTypes.ReserveData memory reserve = (_aavev3.getReserveData(_asset));
    uint8 reserveDecimals = ERC20(reserve.aTokenAddress).decimals();
    uint256 reserveBalance = ERC20(reserve.aTokenAddress).balanceOf(address(this));

    reserveBalance = reserveBalance.toDecimals(reserveDecimals, SYSTEM_DECIMALS);
    return reserveBalance;
  }

/**
   * @dev Returns the address of the AAVE v3 contract.
   * @return The address of the AAVE v3 contract.
   */
  function aaveV3A() internal view returns (address) {
    return address(_aavev3);
  }
}
