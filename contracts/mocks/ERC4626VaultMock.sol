// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";

contract ERC4626VaultMock is IERC4626, ERC20 {
    using SafeERC20 for IERC20;

    IERC20 public immutable underlyingAsset;
    uint256 public totalAssetsInVault;

    constructor(address _underlyingAsset)
        ERC20("Mock Vault Share", "MVS")
    {
        underlyingAsset = IERC20(_underlyingAsset);
    }

    /// @notice Simulates depositing an asset and minting vault shares.
    /// @param assets Amount of underlying asset to deposit.
    /// @param receiver Address to receive the minted vault shares.
    /// @return shares The amount of vault shares minted.
    function deposit(uint256 assets, address receiver) external override returns (uint256 shares) {
        require(assets > 0, "Cannot deposit 0");

        // Transfer assets from the user to the vault
        underlyingAsset.safeTransferFrom(msg.sender, address(this), assets);

        // Mint vault shares equivalent to deposited assets (1:1 for simplicity)
        shares = assets;

        // Mint shares to the receiver
        _mint(receiver, shares);

        // Increase the total assets tracked in the vault
        totalAssetsInVault += assets;

        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /// @notice Simulates withdrawing assets from the vault by burning shares.
    /// @param shares Number of vault shares to redeem.
    /// @param receiver Address to receive the withdrawn assets.
    /// @param owner The address that owns the vault shares to be redeemed.
    /// @return assets The amount of underlying assets withdrawn.
    function redeem(uint256 shares, address receiver, address owner) external override returns (uint256 assets) {
        require(shares > 0, "Cannot redeem 0");

        if (msg.sender != owner) {
            _spendAllowance(owner, msg.sender, shares);
        }

        // Burn the shares
        _burn(owner, shares);

        // Simulate a 1:1 asset withdrawal for simplicity
        assets = shares;

        // Transfer underlying assets to the receiver
        underlyingAsset.safeTransfer(receiver, assets);

        // Decrease the total assets tracked in the vault
        totalAssetsInVault -= assets;

        emit Withdraw(msg.sender, receiver, owner, assets, shares);
    }

    /// @notice Simulates preview of a deposit (1:1 ratio for simplicity).
    /// @param assets Amount of underlying asset to deposit.
    /// @return shares The number of vault shares that would be minted.
    function previewDeposit(uint256 assets) external pure override returns (uint256 shares) {
        return assets; // 1:1 mock ratio of assets to shares
    }

    /// @notice Simulates preview of a redeem (1:1 ratio for simplicity).
    /// @param shares Number of vault shares to redeem.
    /// @return assets The amount of underlying assets that would be withdrawn.
    function previewRedeem(uint256 shares) external pure override returns (uint256 assets) {
        return shares; // 1:1 mock ratio of shares to assets
    }

    /// @notice Returns the total amount of underlying assets held in the vault.
    /// @return totalAssets The total underlying assets in the vault.
    function totalAssets() external view override returns (uint256 totalAssets) {
        return totalAssetsInVault;
    }

    /// @notice Returns the maximum amount of assets that can be deposited for a given address.
    /// @param receiver Address to receive the vault shares.
    /// @return maxAssets The maximum amount of underlying assets that can be deposited.
    function maxDeposit(address receiver) external pure override returns (uint256 maxAssets) {
        return type(uint256).max; // Unlimited for mock purposes
    }

    /// @notice Returns the maximum amount of shares that can be minted for a given address.
    /// @param receiver Address to receive the vault shares.
    /// @return maxShares The maximum amount of vault shares that can be minted.
    function maxMint(address receiver) external pure override returns (uint256 maxShares) {
        return type(uint256).max; // Unlimited for mock purposes
    }

    /// @notice Returns the maximum amount of assets that can be withdrawn by an owner.
    /// @param owner Address that owns the vault shares.
    /// @return maxAssets The maximum amount of underlying assets that can be withdrawn.
    function maxWithdraw(address owner) external view override returns (uint256 maxAssets) {
        return balanceOf(owner); // Can withdraw up to balance in vault shares
    }

    /// @notice Returns the maximum amount of vault shares that can be redeemed by an owner.
    /// @param owner Address that owns the vault shares.
    /// @return maxShares The maximum amount of vault shares that can be redeemed.
    function maxRedeem(address owner) external view override returns (uint256 maxShares) {
        return balanceOf(owner); // Can redeem up to balance of shares
    }

    // Placeholder functions to match the IERC4626 interface
    function convertToShares(uint256 assets) external pure override returns (uint256 shares) {
        return assets; // 1:1 mock ratio
    }

    function convertToAssets(uint256 shares) external pure override returns (uint256 assets) {
        return shares; // 1:1 mock ratio
    }

    function mint(uint256 shares, address receiver) external override returns (uint256 assets) {
        revert("Minting not implemented in mock");
    }

    function withdraw(uint256 assets, address receiver, address owner) external override returns (uint256 shares) {
        revert("Withdraw not implemented in mock");
    }
}
