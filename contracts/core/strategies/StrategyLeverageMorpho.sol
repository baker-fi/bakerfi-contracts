// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { StrategyLeverage } from "./StrategyLeverage.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { AddressUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
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
 * The Collateral could be cbETH, wstETH, rETH against and the debt is an ERC20 (example: ETH)
 *
 * The strategy inherits all the business logic from StrategyLeverage
 * and could be deployed on Base and Ethereum.
 *
 */
contract StrategyLeverageMorpho is Initializable, StrategyLeverage {

  using SafeERC20 for ERC20;
  using AddressUpgradeable for address;
  using AddressUpgradeable for address payable;
  using MorphoLib for IMorpho;
  using MorphoBalancesLib for IMorpho;
  using MarketParamsLib for MarketParams;
  using MathLibrary for uint256;

  struct StrategyLeverageMorphoParams {
    bytes32 collateralToken;
    bytes32 debtToken;
    bytes32 collateralOracle;
    bytes32 debtOracle;
    uint24  swapFeeTier;
    address morphoOracle;
    address irm;
    uint256 lltv;
}

  error InvalidMorphoBlueContract();
  error FailedToApproveAllowance();
  error FailedToRepayDebt();

  MarketParams private  _marketParams;
  IMorpho private       _morpho;


  constructor() {
    _disableInitializers();
  }

   function initialize(
    address initialOwner,
    address initialGovernor,
    ServiceRegistry registry,
    StrategyLeverageMorphoParams calldata params
   ) public initializer {

    /** Initialize the Strategy Leverage Base */
    _initializeStrategyBase(
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
    _marketParams.collateralToken =  registry.getServiceFromHash(params.collateralToken);
    _marketParams.oracle = params.morphoOracle;
    _marketParams.irm = params.irm;
    _marketParams.lltv = params.lltv;
  }


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

  function _supply(address assetIn, uint256 amountIn) internal virtual override {
    if (!ERC20(assetIn).approve(address(_morpho), amountIn)) revert FailedToApproveAllowance();
    ERC20(assetIn).safeTransferFrom(msg.sender, address(this), amountIn);
    uint256 shares;
    address onBehalf = address(this);
    _morpho.supplyCollateral(_marketParams, amountIn, onBehalf, hex"");
  }

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

  function _repay(address assetIn, uint256 amount) internal virtual override {
    if (!ERC20(assetIn).approve(address(_morpho), amount)) revert FailedToApproveAllowance();
    uint256 shares;
    address onBehalf = address(this);
    (uint256 assetsRepaid, ) = _morpho.repay(_marketParams, amount, shares, onBehalf, hex"");
    if(assetsRepaid < amount ) revert FailedToRepayDebt();

  }


  function _withdraw(address assetOut, uint256 amount, address to) internal virtual override {
    address onBehalf = address(this);
    address receiver = to;
    _morpho.withdrawCollateral(_marketParams, amount, onBehalf, receiver);
  }
}