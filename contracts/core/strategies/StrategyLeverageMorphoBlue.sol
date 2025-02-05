// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { StrategyLeverage } from "./StrategyLeverage.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { IMorpho, MarketParams, Id } from "@morpho-org/morpho-blue/src/interfaces/IMorpho.sol";
import { MarketParamsLib } from "@morpho-org/morpho-blue/src/libraries/MarketParamsLib.sol";
import { MorphoLib } from "@morpho-org/morpho-blue/src/libraries/periphery/MorphoLib.sol";
import { MorphoBalancesLib } from "@morpho-org/morpho-blue/src/libraries/periphery/MorphoBalancesLib.sol";
import { MathLibrary } from "../../libraries/MathLibrary.sol";
import { SharesMathLib } from "@morpho-org/morpho-blue/src/libraries/SharesMathLib.sol";

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
 */
contract StrategyLeverageMorphoBlue is Initializable, StrategyLeverage {
  using SafeERC20 for ERC20;
  using MorphoLib for IMorpho;
  using MorphoBalancesLib for IMorpho;
  using MarketParamsLib for MarketParams;
  using MathLibrary for uint256;
  using SharesMathLib for uint256;

  struct StrategyLeverageMorphoParams {
    address collateralToken; ///< The token used as collateral in the strategy.
    address debtToken; ///< The token used as debt in the strategy.
    address oracle; ///< The oracle for the collateral token.
    address flashLender; ///< The flash lender address.
    address morphoBlue; ///< The oracle for Morpho protocol.
    address morphoOracle; ///< The oracle for Morpho protocol.
    address irm; ///< The interest rate model (IRM) address.
    uint256 lltv; ///< The liquidation loan-to-value ratio (LLTV).
  }

  error InvalidMorphoBlueContract(); ///< Thrown when the Morpho contract address is invalid.
  error FailedToRepayDebt(); ///< Thrown when the debt repayment fails.
  error InvalidMorphoBlueMarket(); ///< Thrown when the debt repayment fails.

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
   * @param params The parameters required for initializing the strategy.
   *
   * @dev This function sets up the strategy by initializing the base strategy and configuring Morpho Market parameters.
   */
  function initialize(
    address initialOwner,
    address initialGovernor,
    StrategyLeverageMorphoParams calldata params
  ) public initializer {
    // Initialize the Strategy Leverage Base
    _initializeStrategyLeverage(
      initialOwner,
      initialGovernor,
      params.collateralToken,
      params.debtToken,
      params.oracle,
      params.flashLender
    );

    // Check if the Morpho Blue Contract exists
    _morpho = IMorpho(params.morphoBlue);
    if (address(_morpho) == address(0)) revert InvalidMorphoBlueContract();
    // Initialize Market Params
    _marketParams.loanToken = params.debtToken;
    _marketParams.collateralToken = params.collateralToken;
    _marketParams.oracle = params.morphoOracle;
    _marketParams.irm = params.irm;
    _marketParams.lltv = params.lltv;

    // Verify if the market exists on Morpho
    Id marketId = _marketParams.id();
    MarketParams memory lParams = _morpho.idToMarketParams(marketId);
    if (lParams.lltv == 0) revert InvalidMorphoBlueMarket();
  }

  /**
   * @dev Initializes the strategy with the specified parameters.
   * @param initialOwner The address of the initial owner of the strategy.
   * @param initialGovernor The address of the initial governor of the strategy.
   * @param flashLender The address of the flash lender.
   * @param collateralToken The address of the collateral token.
   * @param debtToken The address of the debt token.
   * @param oracle The address of the oracle.
   *
   * This initializer function allows the migration from v1.3.0 to v4.0.0
   */
  function initializeV4(
    address initialOwner,
    address initialGovernor,
    address flashLender,
    address collateralToken,
    address debtToken,
    address oracle
  ) public reinitializer(4) {
    _initializeStrategyLeverage(
      initialOwner,
      initialGovernor,
      collateralToken,
      debtToken,
      oracle,
      flashLender
    );
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
    Id marketId = _marketParams.id();
    collateralBalance = _morpho.collateral(marketId, address(this));
    debtBalance = _morpho.expectedBorrowAssets(_marketParams, address(this));
  }

  /**
   * @notice Supplies collateral to the Morpho protocol.
   * @param amountIn The  amount of the asset being supplied.
   * @dev This function approves the Morpho contract to spend the asset and then transfers the asset from the user to the contract.
   */
  function _supply(uint256 amountIn) internal virtual override {
    if (!ERC20(_collateralToken).approve(address(_morpho), amountIn))
      revert FailedToApproveAllowance();
    address onBehalf = address(this);
    _morpho.supplyCollateral(_marketParams, amountIn, onBehalf, hex"");
  }

  /**
   * @notice Supplies collateral and borrows a specified amount from Morpho.
   * @param collateralAmount The amount of the asset being supplied.
   * @param debtAmount The amount to borrow against the supplied collateral.
   * @dev This function supplies the asset and borrows from Morpho in a single transaction.
   */
  function _supplyAndBorrow(
    uint256 collateralAmount,
    uint256 debtAmount
  ) internal virtual override {
    _supply(collateralAmount);
    uint256 shares;
    address onBehalf = address(this);
    address receiver = address(this);
    _morpho.borrow(_marketParams, debtAmount, shares, onBehalf, receiver);
  }

  /**
   * @notice Repays debt in the Morpho protocol.
   * @param amount The amount of the asset being used for repayment.
   * @dev This function approves Morpho to spend the asset and then repays the debt. If the repayment is insufficient, it reverts.
   */
  function _repay(uint256 amount) internal virtual override {
    if (!ERC20(_debtToken).approve(address(_morpho), amount)) revert FailedToApproveAllowance();

    Id marketId = _marketParams.id();
    address onBehalf = address(this);
    uint256 shares = 0;
    uint256 amountPaid = 0;
    // Get the Market Balances
    (, , uint256 totalBorrowAssets, uint256 totalBorrowShares) = _morpho.expectedMarketBalances(
      _marketParams
    );
    // Bound the Max Repay Amount to prevent underflow or overflows
    uint256 borrowShares = _morpho.position(marketId, address(this)).borrowShares;
    uint256 repaidAmount = borrowShares.toAssetsUp(totalBorrowAssets, totalBorrowShares);
    // Use the Shares when we are clearing our position or use the debt amount for other cases
    // This approach follows Morpho Protocol Documentation
    if (amount >= repaidAmount) {
      shares = borrowShares;
    } else {
      amountPaid = amount;
    }
    (uint256 assetsRepaid, ) = _morpho.repay(_marketParams, amountPaid, shares, onBehalf, hex"");
    if (assetsRepaid < amount) revert FailedToRepayDebt();
  }

  /**
   * @notice Withdraws collateral from the Morpho protocol.
   * @param amount The amount of the asset to be withdrawn.
   * @param to The address to receive the withdrawn asset.
   * @dev This function withdraws collateral from Morpho and sends it to the specified address.
   */
  function _withdraw(uint256 amount, address to) internal virtual override {
    address onBehalf = address(this);
    address receiver = to;
    _morpho.withdrawCollateral(_marketParams, amount, onBehalf, receiver);
  }
}
