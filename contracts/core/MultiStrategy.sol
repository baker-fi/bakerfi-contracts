// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IStrategy } from "../interfaces/core/IStrategy.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuardUpgradeable } from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

/**
 * @title MultiStrategy

 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice This contract is used to manage multiple strategies. The rebalancing is done based on the weights of the
 * strategies.
 */
abstract contract MultiStrategy is Initializable, ReentrancyGuardUpgradeable {
  /**
   * @notice Emitted when a new strategy is added to the MultiStrategy contract.
   * @param strategy The address of the added strategy.
   */
  event AddStrategy(address indexed strategy);
  /**
   * @notice Emitted when a strategy is removed from the MultiStrategy contract.
   * @param strategy The address of the removed strategy.
   */
  event RemoveStrategy(address indexed strategy);
  /**
   * @notice Emitted when the weights of the strategies are updated.
   * @param weights The new weights to set.
   */
  event WeightsUpdated(uint16[] indexed weights);
  /**x
   * @notice Emitted when the maximum difference is updated.
   * @param maxDifference The new maximum difference to set.
   */
  event MaxDifferenceUpdated(uint256 indexed maxDifference);

  error InvalidStrategy(); // Thrown when an invalid strategy is provided (e.g., address is zero).
  error InvalidStrategyIndex(uint256 index); // Thrown when an invalid strategy index is accessed.
  error InvalidWeightsLength(); // Thrown when the weights array length is not equal to the strategies array length.
  error InvalidDeltasLength(); // Thrown when the deltas array length is not equal to the indexes array length.
  error InvalidStrategies(); // Thrown when the strategies array length is zero.
  error InvalidWeights(); // Thrown when the weights array length is zero.
  error InvalidDeltas(); // Thrown when the deltas array is not sorted with the positive deltas first and the negative deltas last
  uint16 public constant MAX_TOTAL_WEIGHT = 10000;

  /**
   * @notice Array of strategies
   */
  IStrategy[] private _strategies; // Array of strategies
  /**
   * @notice Array of weights
   */
  uint16[] private _weights; // Array of weights
  /**
   * @notice Sum of all weights
   */
  uint16 private _totalWeight;

  /**
   * @notice Initializes the MultiStrategy contract with an array of strategy parameters.
   * @param istrategies An array of StrategyParams containing the strategies and their weights.
   * @dev This function sets the strategies and calculates the total weight of all strategies.
   */
  function _initMultiStrategy(
    IStrategy[] memory istrategies,
    uint16[] memory iweights
  ) internal onlyInitializing {
    if (istrategies.length == 0) revert InvalidStrategies();
    if (iweights.length == 0) revert InvalidWeights();
    if (istrategies.length != iweights.length) revert InvalidWeightsLength();
    _strategies = istrategies;
    _weights = iweights;
    _totalWeight = 0;
    for (uint256 i = 0; i < istrategies.length; i++) {
      _totalWeight += iweights[i];
    }
    if (_totalWeight == 0) revert InvalidWeights();
    if (_totalWeight > 10000) revert InvalidWeights();
  }
  /**
   * @notice Sets the weights of the strategies.
   * @param iweights The new weights to set.
   * @dev Reverts if the weights array length is not equal to the strategies array length.
   */
  function _setWeights(uint16[] memory iweights) internal {
    if (iweights.length != _strategies.length) revert InvalidWeightsLength();
    _weights = iweights;
    _totalWeight = 0;

    for (uint256 i = 0; i < iweights.length; ) {
      _totalWeight += iweights[i];
      unchecked {
        i++;
      }
    }

    if (_totalWeight == 0 || _totalWeight > MAX_TOTAL_WEIGHT) revert InvalidWeights();

    emit WeightsUpdated(iweights);
  }

  /**
   * @notice Adds a new strategy to the MultiStrategy contract.
   * @param strategy The StrategyParams containing the strategy and its weight.
   * @dev Reverts if the strategy address is zero or if the weight is zero.
   */
  function _addStrategy(IStrategy strategy) internal nonReentrant {
    if (address(strategy) == address(0)) revert InvalidStrategy();
    if (strategy.asset() != _asset()) revert InvalidStrategy();

    _strategies.push(strategy);
    _weights.push(0);
    // Approve the strategy to move assets from the vault
    IERC20(strategy.asset()).approve(address(strategy), type(uint256).max);
    emit AddStrategy(address(strategy));
  }

  /**
   * @notice Returns the array of strategies.
   * @return An array of StrategyParams representing the strategies.
   */
  function strategies() external view returns (IStrategy[] memory) {
    return _strategies;
  }

  /**
   * @notice Returns the array of weights.
   * @return An array of uint8 representing the weights.
   */
  function weights() external view returns (uint16[] memory) {
    return _weights;
  }

  /**
   * @notice Returns the total weight of all strategies.
   * @return The total weight as a uint256.
   */
  function totalWeight() public view returns (uint16) {
    return _totalWeight;
  }

  /**
   * @notice Allocates assets to the strategies based on their weights.
   * @param amount The total amount of assets to allocate.
   * @dev This function deploys the calculated fractional amounts to each strategy.
   */
  function _allocateAssets(uint256 amount) internal returns (uint256 totalDeployed) {
    totalDeployed = 0;
    for (uint256 i = 0; i < _strategies.length; ) {
      uint256 fractAmount = (amount * _weights[i]) / _totalWeight;
      if (fractAmount > 0) {
        totalDeployed += IStrategy(_strategies[i]).deploy(fractAmount);
      }
      unchecked {
        i++;
      }
    }
  }
  /**
   * @notice Deallocates assets from the strategies based on their current weights.
   * @param amount The total amount of assets to deallocate.
   * @dev This function undeploys the calculated fractional amounts from each strategy.
   */
  function _deallocateAssets(uint256 amount) internal returns (uint256 totalUndeployed) {
    uint256[] memory currentAssets = new uint256[](_strategies.length);

    uint256 totalAssets = 0;
    uint256 strategiesLength = _strategies.length;

    for (uint256 i = 0; i < strategiesLength; i++) {
      currentAssets[i] = IStrategy(_strategies[i]).totalAssets();
      totalAssets += currentAssets[i];
    }
    totalUndeployed = 0;
    for (uint256 i = 0; i < strategiesLength; ) {
      uint256 fractAmount = (amount * currentAssets[i]) / totalAssets;
      if (fractAmount > 0) {
        totalUndeployed += IStrategy(_strategies[i]).undeploy(fractAmount);
      }
      unchecked {
        i++;
      }
    }
  }

  /**
   * @notice Calculates the total assets managed by all strategies.
   * @return assets The total assets as a uint256.
   */
  function _totalAssets() internal view virtual returns (uint256 assets) {
    for (uint256 i = 0; i < _strategies.length; ) {
      assets += IStrategy(_strategies[i]).totalAssets();
      unchecked {
        i++;
      }
    }
    return assets;
  }

  function _harvestStrategies() internal returns (int256 balanceChange) {
    balanceChange = 0;
    for (uint256 i = 0; i < _strategies.length; i++) {
      balanceChange += IStrategy(_strategies[i]).harvest();
    }
  }

  /**
   * @notice Validates the deltas array.
   * @param deltas The deltas array to validate.
   * @dev This function checks if the deltas are sorted with the positive deltas first and the negative deltas last.
   */
  function _validateDeltas(int256[] memory deltas) internal pure {
    uint256 deltasLen = deltas.length;
    int256 orderCheck = type(int256).min;
    int256 sumDeltas = 0;
    // Check if the first delta is positive
    if (deltas[0] > 0) revert InvalidDeltas();
    // Verify the order of the deltas
    for (uint256 i = 0; i < deltasLen; ) {
      if (deltas[i] < orderCheck) revert InvalidDeltas();
      orderCheck = deltas[i];
      sumDeltas += deltas[i];
      unchecked {
        i++;
      }
    }
    if (sumDeltas != 0) revert InvalidDeltas();
  }
  /**
   * @notice Rebalances the strategies based on their target allocations.
   *  The caller functioin should make sure that the deltas are sorted with the positive deltas first and the negative deltas last
   *  This is to ensure that we deploy the strategies with the highest weights first and then the strategies with the lowest weights
   *  This is to ensure that we undeploy the strategies with the lowest weights first and then the strategies with the highest weights
   *
   * @param indexes The indexes of the strategies to rebalance.
   * @param deltas The delta amounts to rebalance.
   * @dev This function checks if the last allocation was within the minimum reallocation interval
   * and adjusts the allocations of each strategy accordingly.
   */
  function _rebalanceStrategies(uint256[] memory indexes, int256[] memory deltas) internal {
    uint256 totalStrategies = _strategies.length;
    if (deltas.length == 0) return;
    if (deltas.length != indexes.length) revert InvalidDeltasLength();
    if (deltas.length != _strategies.length) revert InvalidDeltasLength();
    // Validate the deltas are sorted and and the sum is 0
    _validateDeltas(deltas);
    // Iterate through each strategy to adjust allocations
    for (uint256 i = 0; i < totalStrategies; i++) {
      // if the delta is 0, we don't need to rebalance the strategy
      if (deltas[i] == 0) continue;

      // if the delta is positive, we need to deploy the strategy
      if (deltas[i] > 0) {
        uint256 balanceOf = IERC20(_strategies[indexes[i]].asset()).balanceOf(address(this));
        uint256 amount = uint256(deltas[i]) > balanceOf ? balanceOf : uint256(deltas[i]);
        IStrategy(_strategies[indexes[i]]).deploy(amount);
        // if the delta is negative, we need to undeploy the strategy
      } else if (deltas[i] < 0) {
        IStrategy(_strategies[indexes[i]]).undeploy(uint256(-deltas[i]));
      }
    }
    // Deploy any dust balance to the highest weight strategy
    uint256 dustBalance = IERC20(_strategies[0].asset()).balanceOf(address(this));
    if (dustBalance > 0) {
      uint256 highestWeightIndex = 0;
      uint16 highestWeight = 0;
      for (uint256 i = 0; i < totalStrategies; i++) {
        if (_weights[i] > highestWeight) {
          highestWeight = _weights[i];
          highestWeightIndex = i;
        }
      }
      IStrategy(_strategies[highestWeightIndex]).deploy(dustBalance);
    }
  }

  /**
   * @notice Removes a strategy from the MultiStrategy contract.
   * @param index The index of the strategy to remove.
   * @dev Reverts if the index is out of bounds. The last strategy is moved to the removed index.
   * This function also handles the undeployment of assets from the strategy being removed and
   * rebalances the remaining strategies.
   */
  function _removeStrategy(uint256 index) internal nonReentrant {
    // Validate the index to ensure it is within bounds
    if (index >= _strategies.length) revert InvalidStrategyIndex(index);
    // If there is only one strategy, we don't allow to remove it for security reasons
    if (_strategies.length == 1) revert InvalidStrategyIndex(index);

    IStrategy strategyToRemove = _strategies[index];
    // Retrieve the total assets managed by the strategy to be removed
    uint256 strategyAssets = strategyToRemove.totalAssets();
    // Remove the approval to move assets for the strategy from the vault, USDT does not support 0 allowance
    IERC20(strategyToRemove.asset()).approve(address(strategyToRemove), 1);
    // Update the total weight and mark the weight of the removed strategy as zero
    _totalWeight -= _weights[index];
    _weights[index] = 0;
    // If the strategy has assets, undeploy them and allocate accordingly
    if (strategyAssets > 0) {
      _allocateAssets(IStrategy(strategyToRemove).undeploy(strategyAssets));
    }

    // Move the last strategy to the index of the removed strategy to maintain array integrity
    uint256 lastIndex = _strategies.length - 1;
    if (index < lastIndex) {
      _strategies[index] = _strategies[lastIndex];
      _weights[index] = _weights[lastIndex];
    }

    emit RemoveStrategy(address(strategyToRemove));
    // Remove the last strategy and weight from the arrays
    _strategies.pop();
    _weights.pop();
  }

  function _asset() internal view virtual returns (address);
}
