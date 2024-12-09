// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/interfaces/IERC20Upgradeable.sol";
import { IERC20MetadataUpgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/IERC20MetadataUpgradeable.sol";
import { IERC4626Upgradeable } from "@openzeppelin/contracts-upgradeable/interfaces/IERC4626Upgradeable.sol";

/**
 * @title BakerFi IVault 🏦🧑‍🍳
 *
 * This vault class follows the ERC4626 standard and allows the support native
 * currencies like ETHEREUM.
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * */
interface IVault is IERC20Upgradeable, IERC20MetadataUpgradeable, IERC4626Upgradeable {
  struct RebalanceCommand {
    uint256 action;
    bytes data;
  }
  /**
   * Deposits ETH or the native currency on the strategy
   *
   * The strategy should support ETH as the deployed asset
   *
   * @param receiver Receiver of the minted shares after deposit
   */
  function depositNative(address receiver) external payable returns (uint256 shares);

  /**
   * @dev Reedemns ETH or the native currency from the strategy
   *
   * The strategy should support ETH as the deployed asset
   *
   * @param assets Receiver of the minted shares after deposit
   */
  function withdrawNative(uint256 assets) external returns (uint256 shares);

  /**
   * @dev Reedemns ETH or the native currency from the strategy
   *
   * The strategy should support ETH as the deployed asset
   *
   * @param shares Receiver of the minted shares after deposit
   */

  function redeemNative(uint256 shares) external returns (uint256 assets);

  /**
   * @dev The Vault Ration between the token price and the shares
   * price. It could be used as price oracle for external entities
   *
   */
  function tokenPerAsset() external view returns (uint256 rate);

  /**
   * @dev Function to rebalance the strategy, prevent a liquidation and pay fees
   * to protocol by minting shares to the fee receiver
   *
   * @param commands The data to be passed to the rebalance function
   * @return success The success of the rebalance operation.
   *
   */
  function rebalance(RebalanceCommand[] calldata commands) external returns (bool success);
}
