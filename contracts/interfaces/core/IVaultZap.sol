// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
/**
 * @title IVaultZap
 *
 * This interface defines the functions for a VaultZap contract, which enables the
 * conversion of an input asset to a target asset and deposits it into an ERC-4626 vault.
 * It also includes functions for estimating the number of vault shares that would be minted
 * for a given input amount of the input asset and for withdrawing assets from the vault.
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 */
interface IVaultZap {
  /**
   * @notice Converts an input asset to the target asset and deposits it into an ERC-4626 vault.
   * @param vault The address of the ERC-4626 vault.
   * @param inputAsset The address of the asset to be converted.
   * @param inputAmount The amount of the input asset to convert and deposit.
   * @param receiver The address that will receive the vault shares.
   * @return shares The amount of ERC-4626 vault shares minted to the receiver.
   */
  function zapIn(
    IERC4626 vault,
    IERC20 inputAsset,
    uint256 inputAmount,
    address receiver
  ) external payable returns (uint256 shares);

  /**
   * @notice Estimates the number of vault shares that would be minted for a given input amount of the input asset.
   * @param vault The address of the ERC-4626 vault.
   * @param inputAsset The address of the asset to convert.
   * @param inputAmount The amount of the input asset.
   * @return estimatedShares The estimated amount of ERC-4626 vault shares.
   */
  function estimateZapInShares(
    IERC4626 vault,
    IERC20 inputAsset,
    uint256 inputAmount
  ) external returns (uint256 estimatedShares);

  /**
   * @notice Zap out function to withdraw assets from the vault
   * @param vault The ERC4626 Vault Address
   * @param vaultShares The Vault Shares
   * @param targetAsset The Output Asset Address
   * @param receiver The Receiver of the output amount
   * @return outputAmount The output amount
   */
  function zapOut(
    IERC4626 vault,
    uint256 vaultShares,
    IERC20 targetAsset,
    address receiver
  ) external returns (uint256 outputAmount);

  /**
   * @notice Estimates the output amount after withdrawing from the ERC-4626 vault and converting the target asset to the output asset.
   * @param vault The address of the ERC-4626 vault.
   * @param vaultShares The number of vault shares to redeem.
   * @param outputAsset The address of the asset to be sent to the receiver.
   * @return estimatedOutput The estimated output amount after conversion.
   */
  function estimateZapOutAmount(
    IERC4626 vault,
    uint256 vaultShares,
    IERC20 outputAsset
  ) external returns (uint256 estimatedOutput);
}
