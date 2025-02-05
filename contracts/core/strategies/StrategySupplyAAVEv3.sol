// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IPoolV3 } from "../../interfaces/aave/v3/IPoolV3.sol";
import { DataTypes } from "../../interfaces/aave/v3/DataTypes.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { MathLibrary } from "../../libraries/MathLibrary.sol";
import { StrategySupplyBase } from "./StrategySupplyBase.sol";

/**
 * @title Strategy Supply AAVEv3 🅿️
 *
 * @author Chef Nil <duarte@bakerfi.xyz>
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 *
 * @notice A simple strategy that can deploy or undeploy assets to AAVEv3
 */
contract StrategySupplyAAVEv3 is StrategySupplyBase {
  using SafeERC20 for ERC20;

  using MathLibrary for uint256;

  IPoolV3 private immutable _aavev3;

  /// @param initialOwner The address of the initial owner of the contract.
  /// @param asset_ The address of the asset to be managed
  /// @param aavev3Address The address of AAVEV3 Address
  /// @dev Reverts if the morphoBlue address is zero
  constructor(
    address initialOwner,
    address asset_,
    address aavev3Address
  ) StrategySupplyBase(initialOwner, asset_) {
    if (aavev3Address == address(0)) revert ZeroAddress();

    _aavev3 = IPoolV3(aavev3Address);

    // Allowance approval
    if (!ERC20(asset_).approve(aavev3Address, type(uint256).max)) {
      revert FailedToApproveAllowanceForAAVE();
    }
  }

  function _deploy(uint256 amount) internal virtual override returns (uint256) {
    _aavev3.supply(_asset, amount, address(this), 0);
    return amount;
  }

  function _undeploy(uint256 amount) internal virtual override returns (uint256 undeployedAmount) {
    // Transfer assets back to caller
    undeployedAmount = _aavev3.withdraw(_asset, amount, address(this));
    return undeployedAmount;
  }
  /**
   * Get the Current Balance on AAVEv3
   *
   * @dev !Important: No Conversion to USD Done
   */
  function _getBalance() internal view virtual override returns (uint256) {
    DataTypes.ReserveData memory reserve = (_aavev3.getReserveData(_asset));
    return ERC20(reserve.aTokenAddress).balanceOf(address(this));
  }
}
