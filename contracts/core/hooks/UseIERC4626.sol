
// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";

contract UseIERC4626 is Initializable {

    /**
     * @dev Error thrown when an invalid vault address is provided.
     */
    error InvalidVaultAddress();

    /**
     * @dev Converts a specified amount of shares to assets within a vault.
     * @param vault The address of the ERC4626 vault.
     * @param shares The amount of shares to convert.
     * @return The amount of assets equivalent to the shares.
     */
    function _convertToVaultAssets(IERC4626 vault, uint256 shares) internal view returns (uint256) {
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
    function _convertToVaultShares(IERC4626 vault, uint256 assets) internal view returns (uint256) {
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
    function _totalVaultAssets(IERC4626 vault) internal view returns (uint256) {
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
    function _vaultAsset(IERC4626 vault) internal view returns (address) {
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
    function _depositVault(IERC4626 vault, uint256 assets, address receiver) internal {
        // Check if the vault address is valid
        if (address(vault) == address(0)) revert InvalidVaultAddress();
        // Call the deposit function of the vault to deposit assets
        vault.deposit(assets, receiver);
    }

    /**
     * @dev Mints a specified amount of shares in a vault for a receiver.
     * @param vault The address of the ERC4626 vault.
     * @param shares The amount of shares to mint.
     * @param receiver The address to receive the shares.
     */
    function _mintVault(IERC4626 vault, uint256 shares, address receiver) internal {
        // Check if the vault address is valid
        if (address(vault) == address(0)) revert InvalidVaultAddress();
        // Call the mint function of the vault to mint shares
        vault.mint(shares, receiver);
    }

    /**
     * @dev Withdraws a specified amount of assets from a vault to a receiver.
     * @param vault The address of the ERC4626 vault.
     * @param assets The amount of assets to withdraw.
     * @param receiver The address to receive the assets.
     * @param owner The owner of the shares.
     */
    function _withdrawVault(IERC4626 vault, uint256 assets, address receiver, address owner) internal {
        // Call the withdraw function of the vault to withdraw assets
        vault.withdraw(assets, receiver, owner);
    }

    /**
     * @dev Redeems a specified amount of shares in a vault for a receiver.
     * @param vault The address of the ERC4626 vault.
     * @param shares The amount of shares to redeem.
     * @param receiver The address to receive the assets.
     * @param owner The owner of the shares.
     */
    function _redeemVault(IERC4626 vault, uint256 shares, address receiver, address owner) internal {
        // Check if the vault address is valid
        if (address(vault) == address(0)) revert InvalidVaultAddress();
        // Call the redeem function of the vault to redeem shares
        vault.redeem(shares, receiver, owner);
    }
}