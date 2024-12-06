// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Rebase, RebaseLibrary } from "../libraries/RebaseLibrary.sol";
import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { IStrategy } from "../interfaces/core/IStrategy.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { MathLibrary } from "../libraries/MathLibrary.sol";
import { MultiStrategy } from "./MultiStrategy.sol";
import { VaultBase } from "./VaultBase.sol";

/**
 * @title BakerFi Vault 🏦🧑‍🍳
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev The BakerFi vault deployed to any supported chain (Arbitrum One, Optimism, Ethereum,...)
 *
 * This is smart contract where the users deposit their ETH or an ERC-20 and receives a share of the pool <x>brETH.
 * A share of the pool is an ERC-20 Token (transferable) and could be used to later to withdraw their
 * owned amount of the pool that could contain (Assets + Yield). This vault could use a customized IStrategy
 * to deploy the capital and harvest an yield.
 *
 * The Contract is able to charge a performance and withdraw fee that is send to the treasury
 * owned account when the fees are set by the deploy owner.
 *
 * The Vault is Pausable by the the governor and is using the settings contract to retrieve base
 * performance, withdraw fees and other kind of settings.
 *
 * During the beta phase only whitelisted addresses are able to deposit and withdraw
 *
 * The Contract is upgradeable and can use a BakerProxy in front of.
 *
 * The Vault follows the ERC-4626 Specification and can be integrated by any Aggregator
 *
 */
contract MultiStrategyVault is VaultBase, MultiStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  address internal _strategyAsset;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() VaultBase() {
    _disableInitializers(); // Prevents the contract from being initialized more than once
  }

  /**
   * @dev Initializes the contract with specified parameters.
   *
   * This function is designed to be called only once during the contract deployment.
   * It sets up the initial state of the contract, including ERC20 and ERC20Permit
   * initializations, ownership transfer, and configuration of the VaultRegistry
   * and Strategy.
   *
   * @param initialOwner The address that will be set as the initial owner of the contract.
   * @param tokenName The name of the token.
   * @param tokenSymbol The symbol of the token.
   * @param iAsset The asset to be set as the asset for this contract.
   * @param istrategies The IStrategy contracts to be set as the strategies for this contract.
   * @param iweights The weights of the strategies.
   * @param weth The WETH contract to be set as the WETH for this contract.
   *
   * Emits an {OwnershipTransferred} event and initializes ERC20 and ERC20Permit features.
   * It also ensures that the initialOwner is a valid address and sets up the VaultRegistry
   * and Strategy for the contract.
   */
  function initialize(
    address initialOwner,
    string calldata tokenName,
    string calldata tokenSymbol,
    address iAsset,
    IStrategy[] memory istrategies,
    uint16[] memory iweights,
    address weth
  ) public initializer {
    _initializeBase(initialOwner, tokenName, tokenSymbol, weth); // Initializes the base contract with the provided parameters
    _initMultiStrategy(istrategies, iweights); // Initializes the multi-strategy with the provided strategies and weights

    // Check if the asset is valid
    if (iAsset == address(0)) revert InvalidAsset();
    _strategyAsset = iAsset;

    for (uint256 i = 0; i < istrategies.length; i++) {
      // Check if the strategy asset is the same as the asset of the vault
      if (istrategies[i].asset() != iAsset) revert InvalidAsset(); // Reverts if the strategy asset does not match the vault asset
      // Approve the strategies to spend assets that are deposited in the vault
      IERC20Upgradeable(iAsset).safeApprove(address(istrategies[i]), type(uint256).max); // Approves the strategy to spend the maximum amount of the asset
    }
  }

  /**
   * @dev Harvests the yield from the strategies.
   *
   * This function calls the internal _harvestStrategies function to collect yield
   * from all strategies and returns the balance change.
   *
   * @return balanceChange The change in balance after harvesting.
   */
  function _harvest() internal virtual override returns (int256 balanceChange) {
    balanceChange = _harvestStrategies(); // Calls the strategy harvest function and returns the balance change
  }

  /**
   * @dev Executes actions after harvesting.
   *
   * This function is called after the harvest process to rebalance the strategies.
   */
  function _afterHarvest() internal virtual override {
    _rebalanceStrategies(); // Rebalances the strategies after harvesting
  }

  /**
   * @dev Deploys assets to the strategies.
   *
   * This function allocates the specified amount of assets to the strategies
   * and returns the amount that was deployed.
   *
   * @param assets The amount of assets to deploy.
   * @return deployedAmount The amount of assets that were successfully deployed.
   */
  function _deploy(uint256 assets) internal virtual override returns (uint256 deployedAmount) {
    deployedAmount = _allocateAssets(assets); // Allocates assets to the strategies and returns the deployed amount
  }

  /**
   * @dev Undeploys assets from the strategies.
   *
   * This function deallocates the specified amount of assets from the strategies
   * and returns the amount that was undeployed.
   *
   * @param assets The amount of assets to undeploy.
   * @return undeployedAmount The amount of assets that were successfully undeployed.
   */
  function _undeploy(uint256 assets) internal virtual override returns (uint256 undeployedAmount) {
    undeployedAmount = _deallocateAssets(assets); // Deallocates assets from the strategies and returns the undeployed amount
  }

  /**
   * @dev Calculates the total assets managed by the vault.
   *
   * This function overrides the totalAssets function from both VaultBase and MultiStrategy
   * to return the total assets managed by the strategies.
   *
   * @return assets The total assets managed by the vault.
   */
  function _totalAssets()
    internal
    view
    virtual
    override(VaultBase, MultiStrategy)
    returns (uint256 assets)
  {
    assets = MultiStrategy._totalAssets(); // Calls the totalAssets function from MultiStrategy to get the total assets
  }

  function _asset() internal view virtual override returns (address) {
    return _strategyAsset;
  }

  uint256[50] private __gap;
}
