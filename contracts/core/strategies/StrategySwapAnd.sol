// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IOracle } from "../../interfaces/core/IOracle.sol";
import { ISwapHandler } from "../../interfaces/core/ISwapHandler.sol";
import { PERCENTAGE_PRECISION } from "../Constants.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { MathLibrary } from "../../libraries/MathLibrary.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
/**
 * @title StrategySwapPark
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice A strategy that swaps an asset for a parked asset and then swaps the parked asset back to the original asset
 * This strategy could be used to convert an assert to an yield bearing asset harvest the yield
 *
 * @dev The strategy is designed to be used with a single asset and a single parked asset
 *
 */
abstract contract StrategySwapAnd is IStrategy, ReentrancyGuard, Ownable {
  using SafeERC20 for IERC20;
  using MathLibrary for uint256;

  /**
   * @notice Error for invalid configuration
   */
  error InvalidConfiguration();
  /**
   * @notice Error for slippage exceeded
   */
  error SlippageExceeded();
  /**
   * @notice Error for invalid amount
   */
  error InvalidAmount();

  error FailedToApproveAllowanceFor();

  /**
   * @notice The asset being managed
   */
  IERC20 internal immutable _asset;

  /**
   * @notice The oracle used to get the price of the asset
   *  AssetOut / AssetIn Oracle
   *
   */
  IOracle private immutable _oracle;
  /**
   * @notice The max slippage for the swap
   */
  uint256 private _maxSlippage; // 10000 = 100%

  /**
   * @notice The deployed amount in underlying asset
   */
  uint256 private _deployedAmount;

  /**
   * @notice The underlying strategy where the asset is end up
   */
  IStrategy private immutable _underlyingStrategy;

  /**
   * @notice Constructor for the StrategySwapPark contract
   *
   * @param initialOwner The initial owner of the strategy
   * @param iAsset The strategy input asset
   * @param iUnderlyingStrategy The oracle used to get the price of the asset iAsset/underlyingAsset
   * @param iOracle The swap router used to swap the asset
   */
  constructor(
    address initialOwner,
    IERC20 iAsset,
    IStrategy iUnderlyingStrategy,
    IOracle iOracle
  ) Ownable() {
    if (
      address(iAsset) == address(0) ||
      address(iUnderlyingStrategy.asset()) == address(0) ||
      address(iOracle) == address(0)
    ) revert InvalidConfiguration();

    _asset = iAsset;
    _oracle = iOracle;
    transferOwnership(initialOwner);

    if (!IERC20(iUnderlyingStrategy.asset()).approve(address(iUnderlyingStrategy), 2 ** 256 - 1))
      revert FailedToApproveAllowanceFor();
    _underlyingStrategy = iUnderlyingStrategy;
  }

  /**
   * @notice Get the parked asset
   *
   * @return address The address of the parked asset
   */
  function underlyingAsset() public view returns (address) {
    return _underlyingStrategy.asset();
  }

  /**
   * @inheritdoc IStrategy
   */
  function deploy(uint256 amount) external override nonReentrant returns (uint256 amountUsed) {
    if (amount == 0) revert InvalidAmount();

    IOracle.PriceOptions memory options = IOracle.PriceOptions({ maxAge: 1 hours, maxConf: 0 });
    IERC20(_asset).safeTransferFrom(msg.sender, address(this), amount);
    // Calculate minimum output based on oracle price and slippage
    uint256 calculatedAmountOut = _convertToUnderlying(options, amount);
    // Calculate the minimum amount out based on the slippage
    uint256 minAmountOut = (calculatedAmountOut * (PERCENTAGE_PRECISION - _maxSlippage)) /
      PERCENTAGE_PRECISION;

    (, uint256 amountOut) = _swap(
      ISwapHandler.SwapParams({
        underlyingIn: address(_asset),
        underlyingOut: address(underlyingAsset()),
        amountIn: amount,
        amountOut: minAmountOut,
        mode: ISwapHandler.SwapType.EXACT_INPUT,
        payload: ""
      })
    );

    if (amountOut < minAmountOut) revert SlippageExceeded();
    // Deploy the swapped amount to the underlying strategy
    _underlyingStrategy.deploy(amountOut);

    _deployedAmount += amountOut;

    // Returns the assets that were used and deployed in the underlying strategy
    amountUsed = _convertFromUnderlying(options, amountOut);

    emit StrategyDeploy(msg.sender, amount);

    // The Underlying Strategy amount is updated
    emit StrategyAmountUpdate(_deployedAmount);
  }

  /**
   * @notice Convert the asset to the parked asset
   *
   * @param options The options for the oracle
   * @param amount The amount to convert
   * @return amountOut_ The amount out
   */
  function _convertToUnderlying(
    IOracle.PriceOptions memory options,
    uint256 amount
  ) internal view returns (uint256 amountOut_) {
    IOracle.Price memory price = _oracle.getSafeLatestPrice(options);
    amountOut_ = (amount * _oracle.getPrecision()) / price.price;
    amountOut_ = MathLibrary.toDecimals(
      amountOut_,
      ERC20(address(_asset)).decimals(),
      ERC20(_underlyingStrategy.asset()).decimals()
    );
  }

  /**
   * @notice Convert the parked asset to the asset
   *
   * @param options The options for the oracle
   * @param amount The amount to convert
   * @return amountOut_ The amount out
   */
  function _convertFromUnderlying(
    IOracle.PriceOptions memory options,
    uint256 amount
  ) internal view returns (uint256 amountOut_) {
    IOracle.Price memory price = _oracle.getSafeLatestPrice(options);
    amountOut_ = (amount * price.price) / _oracle.getPrecision();
    amountOut_ = MathLibrary.toDecimals(
      amountOut_,
      ERC20(_underlyingStrategy.asset()).decimals(),
      ERC20(address(_asset)).decimals()
    );
  }

  function _swap(
    ISwapHandler.SwapParams memory params
  ) internal virtual returns (uint256 amountIn, uint256 amountOut);

  /**
   * @inheritdoc IStrategy
   */
  function undeploy(
    uint256 amount
  ) external override nonReentrant returns (uint256 undeployedAmount_) {
    if (amount == 0) revert InvalidAmount();
    if (amount > _deployedAmount) revert InvalidAmount();

    IOracle.PriceOptions memory options = IOracle.PriceOptions({ maxAge: 1 hours, maxConf: 100 });
    // Undeploy from underlying strategy
    uint256 undeployedAmount = _underlyingStrategy.undeploy(_convertToUnderlying(options, amount));
    // Convert the undeployed amount to the asset
    uint256 calculatedAmountOut = _convertFromUnderlying(options, undeployedAmount);
    // Calculate the minimum amount out based on the slippage
    uint256 minAmountOut = (calculatedAmountOut * (PERCENTAGE_PRECISION - _maxSlippage)) /
      PERCENTAGE_PRECISION;

    (, uint256 amountOut) = _swap(
      ISwapHandler.SwapParams({
        underlyingIn: address(underlyingAsset()),
        underlyingOut: address(_asset),
        amountIn: undeployedAmount,
        amountOut: minAmountOut,
        mode: ISwapHandler.SwapType.EXACT_INPUT,
        payload: ""
      })
    );

    if (amountOut < minAmountOut) revert SlippageExceeded();

    // Update the deployed amount
    _deployedAmount -= undeployedAmount;

    undeployedAmount_ = amountOut;

    IERC20(_asset).safeTransfer(msg.sender, amountOut);

    emit StrategyUndeploy(msg.sender, amountOut);
    emit StrategyAmountUpdate(_deployedAmount);
  }

  /**
   * @inheritdoc IStrategy
   */
  function harvest() external override onlyOwner nonReentrant returns (int256 balanceChange) {
    // Harvest the underlying strategy
    _underlyingStrategy.harvest();

    uint256 newBalance = _totalAssets();

    balanceChange = int256(newBalance) - int256(_deployedAmount);

    if (balanceChange > 0) {
      emit StrategyProfit(uint256(balanceChange));
    } else if (balanceChange < 0) {
      emit StrategyLoss(uint256(-balanceChange));
    }
    if (balanceChange != 0) {
      emit StrategyAmountUpdate(newBalance);
    }
    _deployedAmount = newBalance;
  }

  /**
   * @inheritdoc IStrategy
   */
  function totalAssets() external view override returns (uint256) {
    return _totalAssets();
  }

  /**
   * @notice Get the total assets using the oracle price and the parked asset balance
   *
   * @return amount_ The amount
   */
  function _totalAssets() internal view returns (uint256 amount_) {
    uint256 underlyingAssets = _underlyingStrategy.totalAssets();
    amount_ = _convertFromUnderlying(
      IOracle.PriceOptions({ maxAge: 0, maxConf: 0 }),
      underlyingAssets
    );
    return amount_;
  }

  function asset() external view override returns (address) {
    return address(_asset);
  }

  /**
   * @notice Set the max slippage
   *
   * @param maxSlippage_ The max slippage
   */
  function setMaxSlippage(uint256 maxSlippage_) external onlyOwner {
    _maxSlippage = maxSlippage_;
  }

  /**
   * @notice Get the max slippage
   *
   * @return maxSlippage_ The max slippage
   */
  function maxSlippage() external view returns (uint256) {
    return _maxSlippage;
  }

  function oracle() external view returns (address) {
    return address(_oracle);
  }
}
