// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import { UseLeverage } from "../core/hooks/UseLeverage.sol";

contract LeverageTest is UseLeverage {
  function calculateLeverageRatio(
    uint256 baseValue,
    uint256 loanToValue,
    uint8 nrLoops
  ) public pure returns (uint256) {
    return _calculateLeverageRatio(baseValue, loanToValue, nrLoops);
  }

  /**
   * @dev Calculates the changes in collateral and debt based on a specified percentage to burn.
   * @param percentageToBurn The percentage to burn (expressed as a percentage with precision).
   * @param totalCollateralBaseInEth The total collateral base in ETH.
   * @param totalDebtBaseInEth The total debt base in ETH.
   * @return deltaCollateralInETH The change in collateral in ETH.
   * @return deltaDebtInETH The change in debt in ETH.
   */
  function calcDeltaPosition(
    uint256 percentageToBurn,
    uint256 totalCollateralBaseInEth,
    uint256 totalDebtBaseInEth
  ) public pure returns (uint256 deltaCollateralInETH, uint256 deltaDebtInETH) {
    return _calcDeltaPosition(percentageToBurn, totalCollateralBaseInEth, totalDebtBaseInEth);
  }

  /**
   * @dev Calculates the amount of debt that needs to be paid to achieve a target loan-to-value ratio.
   * @param targetLoanToValue The target loan-to-value ratio (expressed as a percentage with precision).
   * @param collateral The current collateral amount.
   * @param debt The current debt amount.
   * @return delta The additional debt that needs to be paid.
   */
  function calculateDebtToPay(
    uint256 targetLoanToValue,
    uint256 collateral,
    uint256 debt
  ) public pure returns (uint256 delta) {
    return _calculateDebtToPay(targetLoanToValue, collateral, debt);
  }
}
