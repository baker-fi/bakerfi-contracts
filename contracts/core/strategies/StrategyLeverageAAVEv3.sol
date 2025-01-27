// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { StrategyLeverage } from "./StrategyLeverage.sol";
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
  /**
   * @dev Initializes the strategy with the specified parameters.
   * @param initialOwner The address of the initial owner of the strategy.
   * @param initialGovernor The address of the initial governor of the strategy.
   * @param collateralToken The address of the collateral token.
   * @param debtToken The address of the debt token.
   * @param oracle The address of the oracle.
   * @param flashLender The address of the flash lender.
   * @param aaveV3Pool The address of the AAVE v3 pool.
   * @param eModeCategory The eMode category.
   */
  // solhint-disable no-empty-blocks
  function initialize(
    address initialOwner,
    address initialGovernor,
    address collateralToken,
    address debtToken,
    address oracle,
    address flashLender,
    address aaveV3Pool,
    uint8 eModeCategory
  ) public initializer {
    _initializeStrategyLeverage(
      initialOwner,
      initialGovernor,
      collateralToken,
      debtToken,
      oracle,
      flashLender
    );
    _initUseAAVEv3(aaveV3Pool);
    aaveV3().setUserEMode(eModeCategory);
    if (aaveV3().getUserEMode(address(this)) != eModeCategory) revert InvalidAAVEEMode();
  }

  /**
   * @dev Initializes the strategy with the specified parameters.
   * @param initialOwner The address of the initial owner of the strategy.
   * @param initialGovernor The address of the initial governor of the strategy.
   * @param flashLender The address of the flash lender.
   * @param collateralToken The address of the collateral token.
   * @param debtToken The address of the debt token.
   * @param oracle The address of the oracle.
   * @param aaveV3Pool The address of the AAVE v3 pool.
   *
   * This initializer function allows the migration from v1.1.1, v1.3.0 to v4.0.0
   */
  function initializeV4(
    address initialOwner,
    address initialGovernor,
    address flashLender,
    address collateralToken,
    address debtToken,
    address oracle,
    address aaveV3Pool,
    uint8 fromVersion
  ) public reinitializer(4) {
    uint256 deployedAssets;
    uint DEPLOYED_ASSETS_SLOT = 163;
    assembly {
      deployedAssets := sload(DEPLOYED_ASSETS_SLOT)
    }
    _initializeStrategyLeverage(
      initialOwner,
      initialGovernor,
      collateralToken,
      debtToken,
      oracle,
      flashLender
    );
    _initUseAAVEv3(aaveV3Pool);
    if (fromVersion == 1) {
      _upgradeFromV1(deployedAssets);
    }
  }

  /**
   * Get the Current Position on AAVE v3 Money Market
   *
   * @return collateralBalance The Collateral Balance Amount with the native decimals
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
    collateralBalance = ERC20(collateralReserve.aTokenAddress).balanceOf(address(this));
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
