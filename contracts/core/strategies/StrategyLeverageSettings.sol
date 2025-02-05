// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { GovernableOwnable } from "../GovernableOwnable.sol";
import { PERCENTAGE_PRECISION, MAX_LOOPS } from "../Constants.sol";
import { StrategySettings } from "./StrategySettings.sol";

contract StrategyLeverageSettings is StrategySettings {
  error InvalidMaxLoanToValue();
  error InvalidLoopCount();

  /**
   * @dev Emitted when the maximum allowed loan-to-value ratio is changed.
   *
   * This event provides information about the updated maximum loan-to-value ratio.
   *
   * @param value The new maximum allowed loan-to-value ratio.
   */
  event MaxLoanToValueChanged(uint256 indexed value);

  /**
   * @dev Emitted when the general loan-to-value ratio is changed.
   *
   * This event provides information about the updated loan-to-value ratio.
   *
   * @param value The new general loan-to-value ratio.
   */
  event LoanToValueChanged(uint256 indexed value);

  /**
   * @dev Emitted when the number of loops for a specific process is changed.
   *
   * This event provides information about the updated number of loops.
   *
   * @param value The new number of loops.
   */
  event NrLoopsChanged(uint256 indexed value);

  event MaxSlippageChanged(uint256 indexed value);

  /**
   * @dev The loan-to-value ratio for managing loans.
   *
   * This private state variable holds the loan-to-value ratio, represented as an integer.
   */
  uint256 private _loanToValue; // 80%

  /**
   * @dev The maximum allowed loan-to-value ratio.
   *
   * This private state variable holds the maximum allowed loan-to-value ratio, represented as an integer.
   */
  uint256 private _maxLoanToValue; // 85%

  /**
   * @dev The number of loops for a specific process.
   *
   * This private state variable holds the number of loops for a specific process, represented as an unsigned integer.
   */
  uint8 private _nrLoops;

  /**
   * @dev
   */
  uint256 private _maxSlippage;

  function _initLeverageSettings(
    address initialOwner,
    address initialGovernor
  ) internal onlyInitializing {
    _initializeGovernableOwnable(initialOwner, initialGovernor);
    _initializeStrategySettings();
    _loanToValue = 800 * 1e6; // 80%
    _maxLoanToValue = 850 * 1e6; // 85%
    _nrLoops = 10;
    _maxSlippage = 0; // By Default there is no slippage protection
  }

  /**
   * @dev Sets the maximum allowed loan-to-value ratio.
   *
   * This function can only be called by the owner and is used to update the maximum allowed loan-to-value ratio.
   * Emits a {MaxLoanToValueChanged} event upon successful update.
   *
   * @param maxLoanToValue The new maximum allowed loan-to-value ratio to be set.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   */
  function setMaxLoanToValue(uint256 maxLoanToValue) external onlyGovernor {
    if (maxLoanToValue == 0) revert InvalidValue();
    if (maxLoanToValue > PERCENTAGE_PRECISION) revert InvalidPercentage();
    if (maxLoanToValue < _loanToValue) revert InvalidMaxLoanToValue();
    _maxLoanToValue = maxLoanToValue;
    emit MaxLoanToValueChanged(_maxLoanToValue);
  }
  /**
   * @dev Retrieves the maximum allowed loan-to-value ratio.
   *
   * This function is externally callable and returns the maximum allowed loan-to-value ratio.
   *
   * @return maxLoanToValue The maximum allowed loan-to-value ratio.
   */
  function getMaxLoanToValue() public view returns (uint256) {
    return _maxLoanToValue;
  }

  /**
   * @dev Sets the general loan-to-value ratio.
   *
   * This function can only be called by the owner and is used to update the general loan-to-value ratio.
   * Emits a {LoanToValueChanged} event upon successful update.
   *
   * @param loanToValue The new general loan-to-value ratio to be set.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   * - The new loan-to-value ratio must be less than or equal to the maximum allowed loan-to-value ratio.
   * - The new loan-to-value ratio must be a valid percentage value.
   * - The new loan-to-value ratio must be greater than 0.
   */
  function setLoanToValue(uint256 loanToValue) external onlyGovernor {
    if (loanToValue > _maxLoanToValue) revert InvalidValue();
    if (loanToValue > PERCENTAGE_PRECISION) revert InvalidPercentage();
    if (loanToValue == 0) revert InvalidValue();
    _loanToValue = loanToValue;
    emit LoanToValueChanged(_loanToValue);
  }

  /**
   * @dev Retrieves the general loan-to-value ratio.
   *
   * This function is externally callable and returns the general loan-to-value ratio.
   *
   * @return loanToValue The general loan-to-value ratio.
   */
  function getLoanToValue() public view returns (uint256) {
    return _loanToValue;
  }

  /**
   * @dev Retrieves the number of loops for our Recursive Staking Strategy
   *
   * This function is externally callable and returns the number of loops configured.
   *
   * @return nrLoops The number of loops.
   */
  function getNrLoops() public view returns (uint8) {
    return _nrLoops;
  }

  /**
   * @dev Sets the number of loops for our Recursive Staking Strategy
   *
   * This function can only be called by the owner and is used to update the number of loops.
   * Emits an {NrLoopsChanged} event upon successful update.
   *
   * @param nrLoops The new number of loops to be set.
   *
   * Requirements:
   * - The caller must be the owner of the contract.
   * - The new number of loops must be less than the maximum allowed number of loops.
   */
  function setNrLoops(uint8 nrLoops) external onlyGovernor {
    if (nrLoops > MAX_LOOPS) revert InvalidLoopCount();
    _nrLoops = nrLoops;
    emit NrLoopsChanged(_nrLoops);
  }

  function getMaxSlippage() public view returns (uint256) {
    return _maxSlippage;
  }

  function setMaxSlippage(uint256 slippage) external onlyGovernor {
    if (slippage > PERCENTAGE_PRECISION) revert InvalidPercentage();
    _maxSlippage = slippage;
    emit MaxSlippageChanged(slippage);
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * settings without shifting down storage in the inheritance chain.
   */
  uint256[25] private __gap;
}
