// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IStrategy } from "../interfaces/core/IStrategy.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { Ownable2StepUpgradeable } from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
/**
 * @title MultiStrategy

 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice This contract is used to manage multiple strategies. The rebalancing is done based on the weights of the
 * strategies.
 */
abstract contract MultiStrategy is Initializable, Ownable2StepUpgradeable {
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
  /**
   * @notice Emitted when the maximum difference is updated.
   * @param maxDifference The new maximum difference to set.
   */
  event MaxDifferenceUpdated(uint256 indexed maxDifference);

  error InvalidStrategy(); // Thrown when an invalid strategy is provided (e.g., address is zero).
  error InvalidStrategyIndex(uint256 index); // Thrown when an invalid strategy index is accessed.
  error InvalidMaxDifference(uint256 maxDifference); // Thrown when the maximum difference exceeds allowed limits.
  error InvalidWeightsLength(); // Thrown when the weights array length is not equal to the strategies array length.
  error InvalidStrategies(); // Thrown when the strategies array length is zero.
  error InvalidWeights(); // Thrown when the weights array length is zero.

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
   * @notice Minimum difference between target and current allocation
   */
  uint256 private _maxDifference; // 1%

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
    _maxDifference = 100;
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
  function setWeights(uint16[] memory iweights) external onlyOwner {
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
   * @notice Returns the maximum allowable difference between target and current allocation.
   * @return The maximum difference as a uint256.
   */
  function maxDifference() external view returns (uint256) {
    return _maxDifference;
  }

  /**
   * @notice Sets the maximum allowable difference between target and current allocation.
   * @param imaxDifference The new maximum difference to set.
   * @dev Reverts if the new maximum difference exceeds the defined precision.
   */
  function setMaxDifference(uint256 imaxDifference) external onlyOwner {
    if (imaxDifference > MAX_TOTAL_WEIGHT) revert InvalidMaxDifference(imaxDifference);
    _maxDifference = imaxDifference;

    emit MaxDifferenceUpdated(imaxDifference);
  }

  /**
   * @notice Adds a new strategy to the MultiStrategy contract.
   * @param strategy The StrategyParams containing the strategy and its weight.
   * @dev Reverts if the strategy address is zero or if the weight is zero.
   */
  function addStrategy(IStrategy strategy) external onlyOwner {
    if (address(strategy) == address(0)) revert InvalidStrategy();
    _strategies.push(strategy);
    _weights.push(0);
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
    for (uint256 i = 0; i < strategiesLength; i++) {
      uint256 fractAmount = (amount * currentAssets[i]) / totalAssets;
      totalUndeployed += IStrategy(_strategies[i]).undeploy(fractAmount);
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
   * @notice Rebalances the strategies based on their target allocations.
   * @dev This function checks if the last allocation was within the minimum reallocation interval
   * and adjusts the allocations of each strategy accordingly.
   */
  function _rebalanceStrategies() internal {
    // Calculate the total assets managed by all strategies
    uint256 totalCapital = _totalAssets();
    // Cache the maximum allowable difference and the total number of strategies to save gas in the loop
    uint256 maxDifferenceAllowed = _maxDifference;
    uint256 totalStrategies = _strategies.length;

    int256[] memory deltas = new int256[](totalStrategies);
    uint256[] memory indexes = new uint256[](totalStrategies);

    // Calculate the target allocation for each strategy
    for (uint256 i = 0; i < totalStrategies; ) {
      // Calculate the target allocation for the current strategy
      uint256 targetAllocation = (totalCapital * _weights[i]) / _totalWeight;
      // Get the current allocation of the strategy
      uint256 currentAllocation = IStrategy(_strategies[i]).totalAssets();
      // Calculate the difference between current and target allocations
      deltas[i] = int256(targetAllocation) - int256(currentAllocation);
      indexes[i] = i;

      // Sort strategies by delta in ascending order
      for (uint256 j = i + 1; j < totalStrategies; j++) {
        if (deltas[i] > deltas[j]) {
          (deltas[i], deltas[j]) = (deltas[j], deltas[i]);
          (indexes[i], indexes[j]) = (indexes[j], indexes[i]);
        }
      }
      unchecked {
        i++;
      }
    }

    // Iterate through each strategy to adjust allocations
    for (uint256 i = 0; i < totalStrategies; i++) {
      // If the difference is within the allowed limits, exit to the next strategy
      if (deltas[i] > int256(maxDifferenceAllowed) && deltas[i] < -int256(maxDifferenceAllowed))
        continue;

      if (deltas[i] > 0) {
        uint256 balanceOf = IERC20(_strategies[indexes[i]].asset()).balanceOf(address(this));
        uint256 amount = uint256(deltas[i]) > balanceOf ? balanceOf : uint256(deltas[i]);
        IStrategy(_strategies[indexes[i]]).deploy(amount);
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
   */
  /**
   * @notice Removes a strategy from the MultiStrategy contract.
   * @param index The index of the strategy to remove.
   * @dev Reverts if the index is out of bounds. The last strategy is moved to the removed index.
   * This function also handles the undeployment of assets from the strategy being removed and rebalances the remaining strategies.
   */
  function removeStrategy(uint256 index) external onlyOwner {
    // Validate the index to ensure it is within bounds
    if (index >= _strategies.length) revert InvalidStrategyIndex(index);

    // Retrieve the total assets managed by the strategy to be removed
    uint256 strategyAssets = _strategies[index].totalAssets();

    // Update the total weight and mark the weight of the removed strategy as zero
    _totalWeight -= _weights[index];
    _weights[index] = 0;

    // If the strategy has assets, undeploy them and allocate accordingly
    if (strategyAssets > 0) {
      IStrategy(_strategies[index]).undeploy(strategyAssets);
      _allocateAssets(strategyAssets);
    }

    // Rebalance the remaining strategies to adjust their allocations
    _rebalanceStrategies();

    // Move the last strategy to the index of the removed strategy to maintain array integrity
    uint256 lastIndex = _strategies.length - 1;
    if (index < lastIndex) {
      _strategies[index] = _strategies[lastIndex];
      _weights[index] = _weights[lastIndex];
    }

    emit RemoveStrategy(address(_strategies[lastIndex]));
    // Remove the last strategy and weight from the arrays
    _strategies.pop();
    _weights.pop();
  }
}
