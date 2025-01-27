// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { IStrategy } from "../interfaces/core/IStrategy.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { VaultBase } from "./VaultBase.sol";
import { IVault } from "../interfaces/core/IVault.sol";
import { MathLibrary } from "../libraries/MathLibrary.sol";
import { VAULT_MANAGER_ROLE } from "./Constants.sol";

/**
 * @title BakerFi Vault 🏦🧑‍🍳
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev The BakerFi vault deployed to any supported chain (Arbitrum One, Optimism, Ethereum,...)
 *
 * This is a smart contract where the users deposit their ETH or an ERC-20 and receive a share of the pool <x>brETH.
 * A share of the pool is an ERC-20 Token (transferable) and could be used to later withdraw their
 * owned amount of the pool that could contain (Assets + Yield). This vault could use a customized IStrategy
 * to deploy the capital and harvest a yield.
 *
 * The Contract is able to charge a performance and withdraw fee that is sent to the treasury
 * owned account when the fees are set by the deploy owner.
 *
 * The Vault is Pausable by a pauser role and is using the settings to retrieve base
 * performance, withdraw fees, and other kinds of settings.
 *
 * During the beta phase, only whitelisted addresses are able to deposit and withdraw.
 *
 * The Contract is upgradeable and can use a BakerProxy in front of it.
 *
 * The Vault follows the ERC-4626 Specification and can be integrated by any Aggregator.
 *
 */
contract Vault is VaultBase {
  /**
   * @dev The IStrategy contract representing the strategy for deploying/undeploying assets.
   *
   * This private state variable holds the reference to the IStrategy contract,
   * which defines the strategy for managing assets within the current contract.
   */
  IStrategy private _strategy;

  /**
   * @dev The address of the asset being managed by the strategy.
   */
  address internal _strategyAsset;
  uint8 private constant _VAULT_VERSION = 4;

  using MathLibrary for uint256;

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() VaultBase() {
    _disableInitializers(); // Prevents the contract from being initialized again
  }

  uint8 public constant HARVEST_VAULT = 0x01; //

  using SafeERC20Upgradeable for IERC20Upgradeable;

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
   * @param iAsset The address of the asset.
   * @param strategy The IStrategy contract to be set as the strategy for this contract.
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
    IStrategy strategy,
    address weth
  ) public initializer {
    _initializeBase(initialOwner, tokenName, tokenSymbol, weth); // Initializes the base contract
    if (iAsset == address(0)) revert InvalidAsset();
    _strategyAsset = iAsset;
    _strategy = strategy; // Sets the strategy for the vault
  }

  /**
   * @dev Initializes the contract with specified parameters.
   *
   * This function is designed to be called only once during the contract deployment.
   * It sets up the initial state of the contract, including ERC20 and ERC20Permit
   * initializations, ownership transfer, and configuration of the VaultRegistry
   * and Strategy.
   *
   * This initializer function allows the migration from v1.1.1, v1.3.0 to v4.0.0
   *
   * @param initialOwner The address that will be set as the initial owner of the contract.
   * @param tokenName The name of the token.
   * @param tokenSymbol The symbol of the token.
   * @param lstrategyAsset The address of the asset.
   * @param lstrategy The IStrategy contract to be set as the strategy for this contract.
   * @param lfeeReceiver The address of the fee receiver.
   *
   * Emits an {OwnershipTransferred} event and initializes ERC20 and ERC20Permit features.
   * It also ensures that the initialOwner is a valid address and sets up the VaultRegistry
   * and Strategy for the contract.
   */
  function initializeV4(
    address initialOwner,
    string calldata tokenName,
    string calldata tokenSymbol,
    address lstrategyAsset,
    address lstrategy,
    address lfeeReceiver
  ) public reinitializer(_VAULT_VERSION) {
    _initializeBase(initialOwner, tokenName, tokenSymbol, lstrategyAsset);
    _initUseWETH(lstrategyAsset);
    _strategy = IStrategy(lstrategy);
    _strategyAsset = lstrategyAsset;
    _setFeeReceiver(lfeeReceiver);
    _setMaxDeposit(0);
    _setPerformanceFee(0);
    _setWithdrawalFee(0);
  }
  /**
   * @dev Function to rebalance the strategy, prevent a liquidation and pay fees
   * to the protocol by minting shares to the fee receiver.
   *
   * This function is externally callable and is marked as non-reentrant.
   * It triggers the harvest operation on the strategy, calculates the balance change,
   * and applies performance fees if applicable.
   *
   * @return balanceChange The change in balance after the rebalance operation.
   */
  function _harvest() internal virtual override returns (int256 balanceChange) {
    return _strategy.harvest(); // Calls the harvest function of the strategy
  }

  /**
   * @dev Deposits Ether into the contract and mints vault's shares for the specified receiver.
   *
   * This function is externally callable, marked as non-reentrant, and could be restricted
   * to whitelisted addresses. It performs various checks, including verifying that
   * the deposited amount is valid, the Rebase state is initialized, and executes
   * the strategy's `deploy` function to handle the deposit.
   *
   * @param assets The amount of assets to be deployed.
   * @return deployedAmount The number of deployed assets.
   */
  function _deploy(uint256 assets) internal virtual override returns (uint256 deployedAmount) {
    // Approve the strategy to spend assets
    IERC20Upgradeable(_strategyAsset).safeApprove(address(_strategy), assets);
    // Deploy assets via the strategy
    deployedAmount = _strategy.deploy(assets); // Calls the deploy function of the strategy
  }

  /**
   * @dev Withdraws a specified number of vault's shares, converting them to ETH/ERC20 and
   * transferring to the caller.
   *
   * This function is externally callable, marked as non-reentrant, and restricted to whitelisted addresses.
   * It checks for sufficient balance, non-zero share amount, and undeploys the capital from the strategy
   * to handle the withdrawal request. It calculates withdrawal fees, transfers Ether to the caller, and burns the
   * withdrawn shares.
   *
   * @param assets The number of shares to be withdrawn.
   * @return retAmount The amount of ETH/ERC20 withdrawn after fees.
   *
   * Emits a {Withdraw} event after successfully handling the withdrawal.
   */
  function _undeploy(uint256 assets) internal virtual override returns (uint256 retAmount) {
    retAmount = _strategy.undeploy(assets); // Calls the undeploy function of the strategy
  }

  /**
   * @dev Retrieves the total assets controlled/belonging to the vault.
   *
   * This function is publicly accessible and provides a view of the total assets currently
   * deployed in the current strategy. This function uses the latest prices
   * and does not revert on outdated prices.
   *
   * @return amount The total assets under management by the strategy.
   */
  function _totalAssets() internal view virtual override returns (uint256 amount) {
    amount = _strategy.totalAssets(); // Calls the totalAssets function of the strategy
  }

  function _asset() internal view virtual override returns (address) {
    return _strategyAsset;
  }

  /**
   * @dev Rebalances the strategy, prevent a liquidation and pay fees
   * to protocol by minting shares to the fee receiver
   *
   * This rebalance support 1 action:
   *
   * - HARVEST_VAULT: Harvests the yield from the strategy
   *
   * @param commands The data to be passed to the rebalance function
   * @return success The success of the rebalance operation.
   */
  function rebalance(
    IVault.RebalanceCommand[] calldata commands
  )
    external
    override
    nonReentrant
    onlyRole(VAULT_MANAGER_ROLE)
    whenNotPaused
    returns (bool success)
  {
    success = true;
    uint256 numCommands = commands.length;
    for (uint256 i = 0; i < numCommands; ) {
      if (commands[i].action == HARVEST_VAULT) {
        _harvestAndMintFees();
      }
      unchecked {
        i++;
      }
    }
  }

  uint256[50] private __gap;
}
