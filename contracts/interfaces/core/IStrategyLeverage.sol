// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
import { IStrategy } from "./IStrategy.sol";
import { IOracle } from "../../interfaces/core/IOracle.sol";

/**
 * @title IStrategyLeverage
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice Interface used for Leverage Strategy
 */
interface IStrategyLeverage is IStrategy {
  /**
   * @dev Return the Address of the Asset used as Collatteral
   */
  function getCollateralAsset() external view returns (address);
  /**
   * @dev Return the Address of the Debt Asset used as Debt
   */
  function getDebAsset() external view returns (address);

  /**
   * @dev Return the Collatetal/Debt/Loan Balances in USD and Loan To Value
   *
   * @param priceOptions The Oracle optios
   */
  function getPosition(
    IOracle.PriceOptions memory priceOptions
  )
    external
    view
    returns (uint256 totalCollateralInUSD, uint256 totalDebtInUSD, uint256 loanToValue);
}
