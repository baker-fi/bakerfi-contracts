// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Ownable2StepUpgradeable } from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import { IVaultZap } from "../interfaces/core/IVaultZap.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { UseSwapper } from "./hooks/UseSwapper.sol";
import { ServiceRegistry } from "./ServiceRegistry.sol";
import { ISwapHandler } from "../interfaces/core/ISwapHandler.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract VaultZap is IVaultZap , UseSwapper, Ownable2StepUpgradeable  {

  using SafeERC20 for IERC20;
  error VaultZap__CannotZap();

  struct ZapInfo {
    uint8 univ3FeeTier;
  }

  /**
   * @notice Mapping to verify if a token can be used as input or output on a zap and the Uniswap fee tier used.
   * Key is vault The address of the ERC-4626 vault.
   * A token The address of the token to be used as input and output.
   * feeTier The Uniswap fee tier used for the token.
   */
  mapping(IERC4626 => mapping(IERC20 => ZapInfo)) private _zaps;


  constructor() {
    _disableInitializers();
  }

  function initialize(address initialOwner, ServiceRegistry registry) public initializer {
    __Ownable2Step_init();
    _transferOwnership(initialOwner);
    _initUseSwapper(registry);
  }

  /**
   * @notice Adds a new zap configuration for a given vault and token.
   * @param vault The address of the ERC-4626 vault.
   * @param token The address of the token to be used as input and output.
   * @param info The ZapInfo struct containing the Uniswap fee tier for the token.
   */
  function addZapp(IERC4626 vault, IERC20 token, ZapInfo memory info) external onlyOwner {
    _zaps[vault][token] = info;
  }

  /**
   * @notice Removes an existing zap configuration for a given vault and token.
   * @param vault The address of the ERC-4626 vault.
   * @param token The address of the token to remove the zap configuration for.
   */
  function removeZap(IERC4626 vault, IERC20 token) external onlyOwner {
    delete _zaps[vault][token];
  }

  /**
   * @notice Retrieves the zap configuration for a given vault and token.
   * @param vault The address of the ERC-4626 vault.
   * @param token The address of the token to retrieve the zap configuration for.
   * @return info The ZapInfo struct containing the Uniswap fee tier for the token.
   */
  function getZap(IERC4626 vault, IERC20 token) external view returns (ZapInfo memory info) {
    return _zaps[vault][token];
  }

  /**
   * @notice Checks if a zap configuration exists for a given vault and token.
   * @param vault The address of the ERC-4626 vault.
   * @param token The address of the token to check the zap configuration for.
   * @return bool Returns true if a zap configuration exists, otherwise false.
   */
  function canZap(IERC4626 vault, IERC20 token) public view returns (bool) {
    return _zaps[vault][token].univ3FeeTier != 0;
  }


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
    ) external payable returns (uint256 shares) {

        if(!canZap(vault, inputAsset)) revert VaultZap__CannotZap();

        // Transfer the input asset from the caller to the contract
        IERC20(inputAsset).safeTransferFrom(msg.sender, address(this), inputAmount);

        // Convert input asset to target asset if necessary
        IERC20 targetAsset = IERC20(IERC4626(vault).asset());
        uint256 targetAmount = 0;
        if (inputAsset != targetAsset) {
            ( , targetAmount) = _swap(ISwapHandler.SwapParams({
                underlyingIn: address(inputAsset),
                underlyingOut: address(targetAsset),
                mode: ISwapHandler.SwapType.EXACT_INPUT,
                amountIn: inputAmount,
                amountOut: 0,
                feeTier: _zaps[vault][targetAsset].univ3FeeTier,
                payload: bytes("")
            }));
        }

        // Approve the vault to pull target asset for deposit
        IERC20(targetAsset).safeApprove(address(vault), targetAmount);

        // Deposit target asset into ERC-4626 vault
        shares = IERC4626(vault).deposit(targetAmount, receiver);
    }

    function estimateZapInShares(
        IERC4626 vault,
        IERC20 inputAsset,
        uint256 inputAmount
    ) external view returns (uint256 estimatedShares){
        return 0;
    }

    /**
     * @notice Withdraws assets from the ERC-4626 vault and converts the target asset to the output asset.
     * @param vault The address of the ERC-4626 vault.
     * @param vaultShares The number of vault shares to redeem.
     * @param outputAsset The address of the asset to be sent to the receiver.
     * @param receiver The address that will receive the output asset.
     * @return outputAmount The amount of output asset received.
     */
     function zapOut(
        IERC4626 vault,
        uint256 vaultShares,
        IERC20 targetAsset,
        address receiver
    ) external returns (uint256 outputAmount) {
        // Verify if zap is possible
        if(!canZap(vault, targetAsset)) revert VaultZap__CannotZap();

        // Get the output asset
        IERC20 outputAsset = IERC20(IERC4626(vault).asset());

        // Withdraw target asset from ERC-4626 vault
        uint256 reddemedAssets = IERC4626(vault).redeem(vaultShares, address(this), msg.sender);

        // Convert target asset to output asset if necessary
        if (targetAsset != outputAsset) {
           ( , outputAmount) = _swap(ISwapHandler.SwapParams({
                underlyingIn: address(outputAsset),
                underlyingOut: address(targetAsset),
                mode: ISwapHandler.SwapType.EXACT_INPUT,
                amountIn: reddemedAssets,
                amountOut: 0,
                feeTier: _zaps[vault][targetAsset].univ3FeeTier,
                payload: bytes("")
            }));
        } else {
            outputAmount = reddemedAssets;
        }
        // Transfer output asset to the receiver
        IERC20(outputAsset).safeTransfer(receiver, outputAmount);
    }


 function estimateZapOutAmount(
        address vault,
        uint256 vaultShares,
        address outputAsset
    ) external view returns (uint256 estimatedOutput){
        return 0;
    }




  uint256[50] private __gap;
}
