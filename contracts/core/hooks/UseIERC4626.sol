// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { GovernableOwnable } from "../GovernableOwnable.sol";

/**
 * @title UseIERC4626
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 *
 * @dev Contract to integrate the use of ERC4626 vaults.
 */
abstract contract UseIERC4626 is GovernableOwnable {
  /**
   * @dev Error thrown when an invalid vault address is provided.
   */
  error InvalidVaultAddress();
  error FailedToApproveAllowanceForVault();
  error SlippageTooHigh();

  mapping(IERC4626 => mapping(IERC20 => bool)) private _approvedVaults;

  function initializeUseIERC4626(address initialOwner) internal onlyInitializing {
    _transferOwnership(initialOwner);
    _transferGovernorship(initialOwner);
  }

  function approveTokenForVault(IERC4626 vault, IERC20 token) public onlyGovernor {
    _approvedVaults[vault][token] = true;
    if (!IERC20(token).approve(address(vault), 2 ** 256 - 1))
      revert FailedToApproveAllowanceForVault();
  }

  function isTokenApprovedForVault(IERC4626 vault, IERC20 token) public view returns (bool) {
    return _approvedVaults[vault][token];
  }

  function unapproveTokenForVault(IERC4626 vault, IERC20 token) public onlyGovernor {
    _approvedVaults[vault][token] = false;
    // Set the allowance to a very small amount, USDT does not support 0 allowance
    if (!IERC20(token).approve(address(vault), 1)) revert FailedToApproveAllowanceForVault();
  }

  /**
   * @dev Converts a specified amount of shares to assets within a vault.
   * @param vault The address of the ERC4626 vault.
   * @param shares The amount of shares to convert.
   * @return The amount of assets equivalent to the shares.
   */
  function convertToVaultAssets(IERC4626 vault, uint256 shares) internal view returns (uint256) {
    // Check if the vault address is valid
    if (address(vault) == address(0)) revert InvalidVaultAddress();
    // Call the convertToAssets function of the vault to convert shares to assets
    return vault.convertToAssets(shares);
  }

  /**
   * @dev Converts a specified amount of assets to shares within a vault.
   * @param vault The address of the ERC4626 vault.
   * @param assets The amount of assets to convert.
   * @return The amount of shares equivalent to the assets.
   */
  function convertToVaultShares(IERC4626 vault, uint256 assets) internal view returns (uint256) {
    // Check if the vault address is valid
    if (address(vault) == address(0)) revert InvalidVaultAddress();
    // Call the convertToShares function of the vault to convert assets to shares
    return vault.convertToShares(assets);
  }

  /**
   * @dev Returns the total amount of assets managed by a vault.
   * @param vault The address of the ERC4626 vault.
   * @return The total amount of assets managed by the vault.
   */
  function totalVaultAssets(IERC4626 vault) internal view virtual returns (uint256) {
    // Check if the vault address is valid
    if (address(vault) == address(0)) revert InvalidVaultAddress();
    // Call the totalAssets function of the vault to get the total assets
    return vault.totalAssets();
  }

  /**
   * @dev Returns the address of the asset token used by a vault.
   * @param vault The address of the ERC4626 vault.
   * @return The address of the asset token.
   */
  function vaultAsset(IERC4626 vault) internal view returns (address) {
    // Check if the vault address is valid
    if (address(vault) == address(0)) revert InvalidVaultAddress();
    // Call the asset function of the vault to get the asset token address
    return vault.asset();
  }

  /**
   * @dev Deposits a specified amount of assets into a vault for a receiver.
   * @param vault The address of the ERC4626 vault.
   * @param assets The amount of assets to deposit.
   * @param receiver The address to receive the shares.
   */
  function depositVault(
    IERC4626 vault,
    uint256 assets,
    address receiver,
    uint256 minShares
  ) internal virtual returns (uint256 shares) {
    // Check if the vault address is valid
    if (address(vault) == address(0)) revert InvalidVaultAddress();
    // Call the deposit function of the vault to deposit assets
    shares = vault.deposit(assets, receiver);
    if (shares < minShares) revert SlippageTooHigh();
  }

  /**
   * @dev Mints a specified amount of shares in a vault for a receiver.
   * @param vault The address of the ERC4626 vault.
   * @param shares The amount of shares to mint.
   * @param receiver The address to receive the shares.
   */
  function mintVault(
    IERC4626 vault,
    uint256 shares,
    address receiver,
    uint256 maxAssets
  ) internal virtual returns (uint256 assets) {
    // Check if the vault address is valid
    if (address(vault) == address(0)) revert InvalidVaultAddress();
    // Call the mint function of the vault to mint shares
    assets = vault.mint(shares, receiver);
    if (assets > maxAssets) revert SlippageTooHigh();
  }

  /**
   * @dev Withdraws a specified amount of assets from a vault to a receiver.
   * @param vault The address of the ERC4626 vault.
   * @param assets The amount of assets to withdraw.
   * @param receiver The address to receive the assets.
   * @param owner The owner of the shares.
   */
  function withdrawVault(
    IERC4626 vault,
    uint256 assets,
    address receiver,
    address owner,
    uint256 maxShares
  ) internal virtual returns (uint256 shares) {
    // Check if the vault address is valid
    if (address(vault) == address(0)) revert InvalidVaultAddress();
    // Call the withdraw function of the vault to withdraw assets
    shares = vault.withdraw(assets, receiver, owner);
    if (shares > maxShares) revert SlippageTooHigh();
  }

  /**
   * @dev Redeems a specified amount of shares in a vault for a receiver.
   * @param vault The address of the ERC4626 vault.
   * @param shares The amount of shares to redeem.
   * @param receiver The address to receive the assets.
   * @param owner The owner of the shares.
   */
  function redeemVault(
    IERC4626 vault,
    uint256 shares,
    address receiver,
    address owner,
    uint256 minAssets
  ) internal virtual returns (uint256 assets) {
    // Check if the vault address is valid
    if (address(vault) == address(0)) revert InvalidVaultAddress();
    // Call the redeem function of the vault to redeem shares
    assets = vault.redeem(shares, receiver, owner);
    if (assets < minAssets) revert SlippageTooHigh();
  }
}

/**
 * @title UseIERC4626Mock
 * @dev Mock implementation of UseIERC4626 for testing purposes.
 */
contract UseIERC4626Mock is UseIERC4626 {
  function initialize(address initialOwner) public initializer {
    initializeUseIERC4626(initialOwner);
  }
  /**
   * @dev Deposits a specified amount of assets into a vault for a receiver.
   * @param vault The address of the ERC4626 vault.
   * @param assets The amount of assets to deposit.
   * @param receiver The address to receive the shares.
   */
  function test__depositVault(
    IERC4626 vault,
    uint256 assets,
    address receiver,
    uint256 minShares
  ) external returns (uint256) {
    return depositVault(vault, assets, receiver, minShares);
  }

  /**
   * @dev Mints a specified amount of shares in a vault for a receiver.
   * @param vault The address of the ERC4626 vault.
   * @param shares The amount of shares to mint.
   * @param receiver The address to receive the shares.
   */
  function test__mintVault(
    IERC4626 vault,
    uint256 shares,
    address receiver,
    uint256 maxAssets
  ) external returns (uint256) {
    return mintVault(vault, shares, receiver, maxAssets);
  }

  /**
   * @dev Withdraws a specified amount of assets from a vault to a receiver.
   * @param vault The address of the ERC4626 vault.
   * @param assets The amount of assets to withdraw.
   * @param receiver The address to receive the assets.
   * @param owner The owner of the shares.
   */
  function test__withdrawVault(
    IERC4626 vault,
    uint256 assets,
    address receiver,
    address owner,
    uint256 maxShares
  ) external returns (uint256) {
    return withdrawVault(vault, assets, receiver, owner, maxShares);
  }

  /**
   * @dev Redeems a specified amount of shares in a vault for a receiver.
   * @param vault The address of the ERC4626 vault.
   * @param shares The amount of shares to redeem.
   * @param receiver The address to receive the assets.
   * @param owner The owner of the shares.
   */
  function test__redeemVault(
    IERC4626 vault,
    uint256 shares,
    address receiver,
    address owner,
    uint256 minAssets
  ) external returns (uint256) {
    return redeemVault(vault, shares, receiver, owner, minAssets);
  }
}
