// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import { IStrategy } from "../interfaces/core/IStrategy.sol";
import { SafeERC20Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC20/utils/SafeERC20Upgradeable.sol";
import { MultiStrategy } from "./MultiStrategy.sol";
import { VaultBase } from "./VaultBase.sol";
import { IVault } from "../interfaces/core/IVault.sol";
import { VAULT_MANAGER_ROLE } from "./Constants.sol";
/**
 * @title MultiStrategyVault 🏦🧑‍🍳
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev The MultiStrategyVault is orchestration vault capable of managing multiple investment strategies.
 *
 * This is smart contract where the users deposit their ETH or an ERC-20 and receives a share of the pool <x>brETH.
 * A share of the pool is an ERC-20 Token (transferable) and could be used to later to withdraw their
 * owned amount of the pool that could contain (Assets + Yield).
 * This vault could use to support multiple strategies and deploy the capital on the strategies based on
 * set of weights defined by the vault manager.
 *
 * The Contract is able to charge a performance and withdraw fee that is send to the treasury
 * owned account when the fees are set by the deploy owner.
 *
 * The Vault is Pausable by a pauser role and is using the settings to retrieve base
 * performance, withdraw fees and other kind of settings.
 *
 * During the beta phase only whitelisted addresses are able to deposit and withdraw
 *
 * The Contract is upgradeable and can use a BakerProxy in front of.
 *
 * The Vault follows the ERC-4626 Specification and can be integrated by any Aggregator
 *
 * The rebalance function is allowing a flexible external management through the vault manager role
 * and could be used to perform a variety of operations such as harvesting yield, rebalancing assets,
 * changing weights, and other strategic actions that could be programmed by an external agent
 * that have access to external information and implement healthy procedures in order to protect the
 * vault or impreove the vault performance.
 */
contract MultiStrategyVault is VaultBase, MultiStrategy {
  using SafeERC20Upgradeable for IERC20Upgradeable;

  // Rebalance commands
  uint8 public constant HARVEST_VAULT = 0x01; //
  uint8 public constant REBALANCE_STRATEGIES = 0x02; //
  uint8 public constant CHANGE_WEIGHTS = 0x03; //

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

  function _asset() internal view virtual override(VaultBase, MultiStrategy) returns (address) {
    return _strategyAsset;
  }

  /**
   * @dev Rebalances the vault's assets.
   *
   * @param commands The commands to rebalance the vault's assets.
   *
   * The commands are an array of RebalanceCommand structs, each containing an action and data.
   * The action is the type of the command and the data is the data of the command.
   *
   * This rebalance support 3 actions:
   *
   * - HARVEST_VAULT: Harvests the yield from the strategies.
   * - REBALANCE_STRATEGIES: Rebalances the strategies based on the deltas.
   * - CHANGE_WEIGHTS: Changes the weights of the strategies.
   *
   * @return success Whether the rebalancing was successful.
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
      } else if (commands[i].action == REBALANCE_STRATEGIES) {
        (uint256[] memory indexes, int256[] memory deltas) = abi.decode(
          commands[i].data,
          (uint256[], int256[])
        );
        _rebalanceStrategies(indexes, deltas);
      } else if (commands[i].action == CHANGE_WEIGHTS) {
        uint16[] memory weights = abi.decode(commands[i].data, (uint16[]));
        _setWeights(weights);
      }
      unchecked {
        i++;
      }
    }
  }
  /**
   * @notice Sets the weights of the strategies.
   * @param iweights The new weights to set.
   * @dev Reverts if the weights array length is not equal to the strategies array length.
   */

  function setWeights(uint16[] memory iweights) external onlyRole(VAULT_MANAGER_ROLE) {
    _setWeights(iweights);
  }
  /**
   * @notice Removes a strategy from the MultiStrategy contract.
   * @param index The index of the strategy to remove.
   * @dev Reverts if the index is out of bounds. The last strategy is moved to the removed index.
   * This function also handles the undeployment of assets from the strategy being removed and
   * rebalances the remaining strategies.
   */
  function removeStrategy(uint256 index) external onlyRole(VAULT_MANAGER_ROLE) {
    _removeStrategy(index);
  }
  /**
   * @notice Adds a new strategy to the MultiStrategy contract.
   * @param strategy The StrategyParams containing the strategy and its weight.
   * @dev Reverts if the strategy address is zero or if the weight is zero.
   */
  function addStrategy(IStrategy strategy) external onlyRole(VAULT_MANAGER_ROLE) {
    _addStrategy(strategy);
  }

  uint256[50] private __gap;
}
