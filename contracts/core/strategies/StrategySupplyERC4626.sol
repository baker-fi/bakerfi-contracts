// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { StrategySupplyBase } from "./StrategySupplyBase.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title Strategy Supply ERC4626 implements supply operations for ERC4626 vaults
 *
 * @author Chef Nil <duarte@bakerfi.xyz>
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 *
 * @notice A strategy that can deploy or undeploy assets to an ERC4626 vault
 */
contract StrategySupplyERC4626 is StrategySupplyBase {
  using SafeERC20 for ERC20;

  error InvalidVault();

  // The ERC4626 vault where assets will be deposited
  IERC4626 private immutable _vault;

  /**
   * @param initialOwner The address that will own the strategy
   * @param asset_ The address of the asset to be managed
   * @param vault_ The address of the ERC4626 vault
   */
  constructor(
    address initialOwner,
    address asset_,
    address vault_
  ) StrategySupplyBase(initialOwner, asset_) {
    if (vault_ == address(0)) revert ZeroAddress();
    if (IERC4626(vault_).asset() != asset_) revert InvalidVault();

    _vault = IERC4626(vault_);

    // Approve vault to spend strategy's assets
    ERC20(asset_).safeApprove(vault_, type(uint256).max);
  }

  /**
   * @inheritdoc StrategySupplyBase
   */
  function _deploy(uint256 amount) internal override returns (uint256) {
    return _vault.convertToAssets(_vault.deposit(amount, address(this)));
  }

  /**
   * @inheritdoc StrategySupplyBase
   */
  function _undeploy(uint256 amount) internal override returns (uint256) {
    return _vault.convertToAssets(_vault.withdraw(amount, address(this), address(this)));
  }

  /**
   * @inheritdoc StrategySupplyBase
   */
  function _getBalance() internal view override returns (uint256) {
    return _vault.convertToAssets(_vault.balanceOf(address(this)));
  }
}
