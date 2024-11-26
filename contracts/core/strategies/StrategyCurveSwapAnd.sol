// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { StrategySwapAnd } from "./StrategySwapAnd.sol";
import { UseCurveSwapper } from "../hooks/swappers/UseCurveSwapper.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { IOracle } from "../../interfaces/core/IOracle.sol";
import { ISwapHandler } from "../../interfaces/core/ISwapHandler.sol";
import { ICurveRouterNG } from "../../interfaces/curve/ICurveRouterNG.sol";

/**
 * @title StrategyCurveSwapAnd
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 */
contract StrategyCurveSwapAnd is StrategySwapAnd, UseCurveSwapper {
  // Curve Swapp Pool specific parameters for
  address private immutable _pool;
  uint8 private immutable _inTokenPoolIndex;
  uint8 private immutable _outTokenPoolIndex;
  uint8 private immutable _swapType;
  uint8 private immutable _poolType;

  /**
   * @notice Constructor for the StrategyCurveSwapAnd contract
   * @param initialOwner The address of the initial owner of the contract
   * @param iAsset The asset being managed
   * @param iUnderlyingStrategy The underlying strategy
   * @param iOracle The oracle used to get the price of the asset iAsset/underlyingAsset
   * @param router The Curve Router NG contract
   * @param iPool The Curve pool address
   * @param inTokenPoolIndex The index of the input token in the pool
   * @param outTokenPoolIndex The index of the output token in the pool
   * @param iSwapType The type of swap (1 for stableswap, 2 for cryptoswap)
   * @param iPoolType The type of pool (1 for standard, 2 for lending, etc.)
   */
  constructor(
    address initialOwner,
    IERC20 iAsset,
    IStrategy iUnderlyingStrategy,
    IOracle iOracle,
    ICurveRouterNG router,
    address iPool,
    uint8 inTokenPoolIndex,
    uint8 outTokenPoolIndex,
    uint8 iSwapType,
    uint8 iPoolType
  ) StrategySwapAnd(initialOwner, iAsset, iUnderlyingStrategy, iOracle) {
    if (iPool == address(0)) revert InvalidConfiguration();

    _pool = iPool;
    _inTokenPoolIndex = inTokenPoolIndex;
    _outTokenPoolIndex = outTokenPoolIndex;
    _swapType = iSwapType;
    _poolType = iPoolType;

    _initUseCurveSwapper(router);
    // Allow the router to spend tokens for swaps
    _allowRouterSpend(IERC20(iAsset), type(uint256).max);
    _allowRouterSpend(IERC20(iUnderlyingStrategy.asset()), type(uint256).max);
  }

  /**
   * @notice Internal function to swap the asset using the CurveSwapper
   * @param params The swap parameters
   * @return amountIn The amount of input tokens
   * @return amountOut The amount of output tokens
   */
  function _swap(
    ISwapHandler.SwapParams memory params
  ) internal override returns (uint256 amountIn, uint256 amountOut) {
    // Encode the Curve-specific parameters into the payload
    params.payload = abi.encode(
      uint256(params.underlyingIn == address(_asset) ? _inTokenPoolIndex : _outTokenPoolIndex),
      uint256(params.underlyingOut == address(_asset) ? _inTokenPoolIndex : _outTokenPoolIndex),
      uint256(_swapType),
      uint256(_poolType),
      _pool
    );
    return UseCurveSwapper.swap(params);
  }

  /**
   * @notice Getter for the Curve pool address
   * @return The pool address
   */
  function pool() external view returns (address) {
    return _pool;
  }
}
