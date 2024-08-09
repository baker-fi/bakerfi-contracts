// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { StrategyLeverage } from "./StrategyLeverage.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IMorpho, MarketParams } from "@morpho-org/morpho-blue/src/interfaces/IMorpho.sol";
import { MarketParamsLib } from "@morpho-org/morpho-blue/src/libraries/MarketParamsLib.sol";
import { MorphoLib } from "@morpho-org/morpho-blue/src/libraries/periphery/MorphoLib.sol";
import { MorphoBalancesLib } from "@morpho-org/morpho-blue/src/libraries/periphery/MorphoBalancesLib.sol";
import { ServiceRegistry } from "../../core/ServiceRegistry.sol";
import { MORPHO_BLUE_CONTRACT } from "../../core/ServiceRegistry.sol";
import { SYSTEM_DECIMALS } from "../../core/Constants.sol";
import { MathLibrary } from "../../libraries/MathLibrary.sol";

/**
 * @title Recursive Staking Strategy for Morpho Blue
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev This strategy is used by the bakerfi vault to deploy ETH/ERC20 capital
 * on Morpho Blue Money Markets
 *
 * @notice This contract implements a leverage strategy using the Morpho protocol.
 * It extends the `StrategyLeverage` base contract and interacts with the Morpho protocol for
 * lending and borrowing operations.
 *
 *
 * The Collateral could be cbETH, wstETH, rETH against and the debt is an ERC20 (example: ETH)
 *
 * The strategy inherits all the business logic from StrategyLeverage
 * and could be deployed on Base and Ethereum.
 *
 */ contract StrategyLeverageMorphoBlue is Initializable, StrategyLeverage {
  using SafeERC20 for ERC20;
  using MorphoLib for IMorpho;
  using MorphoBalancesLib for IMorpho;
  using MarketParamsLib for MarketParams;
  using MathLibrary for uint256;

  struct StrategyLeverageMorphoParams {
    bytes32 collateralToken; ///< The token used as collateral in the strategy.
    bytes32 debtToken; ///< The token used as debt in the strategy.
    bytes32 collateralOracle; ///< The oracle for the collateral token.
    bytes32 debtOracle; ///< The oracle for the debt token.
    uint24 swapFeeTier; ///< The fee tier for swaps.
    address morphoOracle; ///< The oracle for Morpho protocol.
    address irm; ///< The interest rate model (IRM) address.
    uint256 lltv; ///< The liquidation loan-to-value ratio (LLTV).
  }

  error InvalidMorphoBlueContract(); ///< Thrown when the Morpho contract address is invalid.
  error FailedToApproveAllowance(); ///< Thrown when approval for ERC20 allowance fails.
  error FailedToRepayDebt(); ///< Thrown when the debt repayment fails.

  MarketParams private _marketParams; ///< Parameters related to the market for the strategy.
  IMorpho private _morpho; ///< Instance of the Morpho protocol interface.

  /**
   * @notice Constructor to disable initializers in the implementation contract.
   * @dev Prevents the implementation contract from being initialized.
   */
  constructor() {
    _disableInitializers();
  }

  /**
   * @notice Initializes the strategy with the given parameters.
   * @param initialOwner The address of the initial owner of the strategy.
   * @param initialGovernor The address of the initial governor of the strategy.
   * @param registry The service registry for obtaining required services.
   * @param params The parameters required for initializing the strategy.
   *
   * @dev This function sets up the strategy by initializing the base strategy and configuring Morpho Market parameters.
   */
  function initialize(
    address initialOwner,
    address initialGovernor,
    ServiceRegistry registry,
    StrategyLeverageMorphoParams calldata params
  ) public initializer {
    // Initialize the Strategy Leverage Base
    _initializeStrategyLeverage(
      initialOwner,
      initialGovernor,
      registry,
      params.collateralToken,
      params.debtToken,
      params.collateralOracle,
      params.debtOracle,
      params.swapFeeTier
    );

    _morpho = IMorpho(registry.getServiceFromHash(MORPHO_BLUE_CONTRACT));
    if (address(_morpho) == address(0)) revert InvalidMorphoBlueContract();

    _marketParams.loanToken = registry.getServiceFromHash(params.debtToken);
    _marketParams.collateralToken = registry.getServiceFromHash(params.collateralToken);
    _marketParams.oracle = params.morphoOracle;
    _marketParams.irm = params.irm;
    _marketParams.lltv = params.lltv;
  }

  /**
   * @notice Retrieves the current collateral and debt balances.
   * @return collateralBalance The current collateral balance of the strategy.
   * @return debtBalance The current debt balance of the strategy.
   * @dev This function fetches the expected supply and borrow assets from Morpho and converts them into system decimals.
   */
  function getBalances()
    public
    view
    virtual
    override
    returns (uint256 collateralBalance, uint256 debtBalance)
  {
    uint256 totalSupplyAssets = _morpho.expectedSupplyAssets(_marketParams, address(this));
    uint256 totalBorrowAssets = _morpho.expectedBorrowAssets(_marketParams, address(this));
    uint8 debtDecimals = ERC20(_marketParams.loanToken).decimals();
    uint8 collateralDecimals = ERC20(_marketParams.collateralToken).decimals();
    debtBalance = totalBorrowAssets.toDecimals(debtDecimals, SYSTEM_DECIMALS);
    collateralBalance = totalSupplyAssets.toDecimals(collateralDecimals, SYSTEM_DECIMALS);
  }

  /**
   * @notice Supplies collateral to the Morpho protocol.
   * @param assetIn The address of the asset being supplied as collateral.
   * @param amountIn The amount of the asset being supplied.
   * @dev This function approves the Morpho contract to spend the asset and then transfers the asset from the user to the contract.
   */
  function _supply(address assetIn, uint256 amountIn) internal virtual override {
    if (!ERC20(assetIn).approve(address(_morpho), amountIn)) revert FailedToApproveAllowance();
    ERC20(assetIn).safeTransferFrom(msg.sender, address(this), amountIn);
    uint256 shares;
    address onBehalf = address(this);
    _morpho.supplyCollateral(_marketParams, amountIn, onBehalf, hex"");
  }

  /**
   * @notice Supplies collateral and borrows a specified amount from Morpho.
   * @param assetIn The address of the asset being supplied as collateral.
   * @param amountIn The amount of the asset being supplied.
   * @param borrowOut The amount to borrow against the supplied collateral.
   * @dev This function supplies the asset and borrows from Morpho in a single transaction.
   */
  function _supplyAndBorrow(
    address assetIn,
    uint256 amountIn,
    address,
    uint256 borrowOut
  ) internal virtual override {
    _supply(assetIn, amountIn);
    uint256 shares;
    address onBehalf = address(this);
    address receiver = address(this);
    _morpho.borrow(_marketParams, borrowOut, shares, onBehalf, receiver);
  }

  /**
   * @notice Repays debt in the Morpho protocol.
   * @param assetIn The address of the asset being used to repay the debt.
   * @param amount The amount of the asset being used for repayment.
   * @dev This function approves Morpho to spend the asset and then repays the debt. If the repayment is insufficient, it reverts.
   */
  function _repay(address assetIn, uint256 amount) internal virtual override {
    if (!ERC20(assetIn).approve(address(_morpho), amount)) revert FailedToApproveAllowance();
    uint256 shares;
    address onBehalf = address(this);
    (uint256 assetsRepaid, ) = _morpho.repay(_marketParams, amount, shares, onBehalf, hex"");
    if (assetsRepaid < amount) revert FailedToRepayDebt();
  }

  /**
   * @notice Withdraws collateral from the Morpho protocol.
   * @param assetOut The address of the asset to be withdrawn.
   * @param amount The amount of the asset to be withdrawn.
   * @param to The address to receive the withdrawn asset.
   * @dev This function withdraws collateral from Morpho and sends it to the specified address.
   */
  function _withdraw(address assetOut, uint256 amount, address to) internal virtual override {
    address onBehalf = address(this);
    address receiver = to;
    _morpho.withdrawCollateral(_marketParams, amount, onBehalf, receiver);
  }
}
