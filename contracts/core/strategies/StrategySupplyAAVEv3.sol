// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { StrategyLeverage } from "./StrategyLeverage.sol";
import { VaultRegistry } from "../../core/VaultRegistry.sol";
import { SYSTEM_DECIMALS } from "../../core/Constants.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UseAAVEv3 } from "../hooks/UseAAVEv3.sol";
import { DataTypes } from "../../interfaces/aave/v3/IPoolV3.sol";
import { AddressUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import { MathLibrary } from "../../libraries/MathLibrary.sol";
/**
 * @title  AAVE v3 Recursive Staking Strategy for Collateral/Debt
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev This strategy is used by the bakerfi vault to deploy ETH/ERC20 capital
 * on aave money market.
 *
 * The Collateral could be cbETH, wstETH, rETH against and the debt is an ERC20 (example: ETH)
 *
 * The strategy inherits all the business logic from StrategyLeverage
 * and could be deployed on Optimism, Arbitrum , Base and Ethereum or any L2 with AAVE markets
 *
 */
contract StrategyLeverageAAVEv3 is Initializable, StrategyLeverage, UseAAVEv3 {
  using SafeERC20 for ERC20;
  using AddressUpgradeable for address;
  using AddressUpgradeable for address payable;

  error FailedToApproveAllowanceForAAVE();
  error InvalidAAVEEMode();
  error FailedToRepayDebt();
  error InvalidWithdrawAmount();

  using MathLibrary for uint256;
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  // solhint-disable no-empty-blocks
  function initialize(
    address initialOwner,
    address initialGovernor,
    address collateralToken,
    address debtToken,
    address collateralOracle,
    address debtOracle,
    address flashLender,
    address aaveV3Pool,
    address univ3Router,
    uint24 swapFeeTier,
    uint8 eModeCategory
  ) public initializer {
    _initializeStrategyLeverage(
      initialOwner,
      initialGovernor,
      collateralToken,
      debtToken,
      collateralOracle,
      debtOracle,
      flashLender,
      univ3Router,
      swapFeeTier
    );
    _initUseAAVEv3(aaveV3Pool);
    aaveV3().setUserEMode(eModeCategory);
    if (aaveV3().getUserEMode(address(this)) != eModeCategory) revert InvalidAAVEEMode();
  }

  /**
   * Get the Current Position on AAVE v3 Money Market
   *
   * @return collateralBalance The Collateral Balance Amount
   * @return debtBalance The Debt Token Balance Amount
   *
   * @dev !Important: No Conversion to USD Done
   */
  function getBalances()
    public
    view
    virtual
    override
    returns (uint256 collateralBalance, uint256 debtBalance)
  {
    DataTypes.ReserveData memory debtReserve = (aaveV3().getReserveData(_debtToken));
    DataTypes.ReserveData memory collateralReserve = (aaveV3().getReserveData(_collateralToken));
    debtBalance = ERC20(debtReserve.variableDebtTokenAddress).balanceOf(address(this));
    uint8 debtDecimals = ERC20(debtReserve.variableDebtTokenAddress).decimals();
    uint8 collateralDecimals = ERC20(collateralReserve.aTokenAddress).decimals();
    collateralBalance = ERC20(collateralReserve.aTokenAddress).balanceOf(address(this));
    debtBalance = debtBalance.toDecimals(debtDecimals, SYSTEM_DECIMALS);
    collateralBalance = collateralBalance.toDecimals(collateralDecimals, SYSTEM_DECIMALS);
  }

  /**
   * Deposit an asset on the AAVEv3 Pool
   *
   * @param amountIn the amount to deposit
   */
  function _supply(uint256 amountIn) internal virtual override {
    if (!ERC20(_collateralToken).approve(aaveV3A(), amountIn))
      revert FailedToApproveAllowanceForAAVE();
    aaveV3().supply(_collateralToken, amountIn, address(this), 0);
  }

  /**
   * @dev Supplies an asset and borrows another asset from AAVE v3.
   * @param collateral The amount of the asset to supply.
   * @param debt The address of the asset to borrow.
   */
  function _supplyAndBorrow(uint256 collateral, uint256 debt) internal virtual override {
    _supply(collateral);
    aaveV3().setUserUseReserveAsCollateral(_collateralToken, true);
    aaveV3().borrow(_debtToken, debt, 2, 0, address(this));
  }

  /**
   * @dev Repays a borrowed asset on AAVE v3.
   * @param amount The amount of the borrowed asset to repay.
   */
  function _repay(uint256 amount) internal virtual override {
    if (!ERC20(_debtToken).approve(aaveV3A(), amount)) revert FailedToApproveAllowanceForAAVE();
    if (aaveV3().repay(_debtToken, amount, 2, address(this)) != amount) revert FailedToRepayDebt();
  }

  /**
   * Withdraw an asset from the AAVE pool
   * @param amount  The amount of the asset to withdraw.
   * @param to The assets receiver account
   */
  function _withdraw(uint256 amount, address to) internal virtual override {
    if (aaveV3().withdraw(_collateralToken, amount, to) != amount) revert InvalidWithdrawAmount();
  }
}
