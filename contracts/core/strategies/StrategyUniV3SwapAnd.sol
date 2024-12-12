// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { StrategySwapAnd } from "./StrategySwapAnd.sol";
import { UseUniV3Swapper } from "../hooks/swappers/UseUniV3Swapper.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { IOracle } from "../../interfaces/core/IOracle.sol";
import { ISwapHandler } from "../../interfaces/core/ISwapHandler.sol";
import { IV3SwapRouter } from "../../interfaces/uniswap/v3/IV3SwapRouter.sol";

/**
 * @title StrategyUniV3SwapAnd
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 */
contract StrategyUniV3SwapAnd is StrategySwapAnd, UseUniV3Swapper {
  uint24 private immutable _feeTier;

  /**
   * @notice Constructor for the StrategyUniV3SwapAnd contract
   * @param initialOwner The address of the initial owner of the contract
   * @param iAsset The asset being managed
   * @param iUnderlyingStrategy The underlying strategy
   * @param iOracle The oracle used to get the price of the asset iAsset/underlyingAsset
   * @param router The swap router used to swap the asset
   * @param ifeeTier The fee tier for the swap
   */
  constructor(
    address initialOwner,
    IERC20 iAsset,
    IStrategy iUnderlyingStrategy,
    IOracle iOracle,
    IV3SwapRouter router,
    uint24 ifeeTier
  ) StrategySwapAnd(initialOwner, iAsset, iUnderlyingStrategy, iOracle) {
    if (ifeeTier == 0) revert InvalidFeeTier();

    _feeTier = ifeeTier;
    _initUseUniV3Swapper(router);
    // Allow the router to spend Collateral tokens on swaps
    _allowRouterSpend(IERC20(iAsset), 2 ** 256 - 1);
    _allowRouterSpend(IERC20(iUnderlyingStrategy.asset()), 2 ** 256 - 1);
  }

  /**
   * @notice Internal function to swap the asset using the UniV3Swapper
   * @param params The swap parameters
   * @return amountIn The amount of input tokens
   * @return amountOut The amount of output tokens
   */
  function _swap(
    ISwapHandler.SwapParams memory params
  ) internal override returns (uint256 amountIn, uint256 amountOut) {
    params.payload = abi.encode(_feeTier);
    return UseUniV3Swapper.swap(params);
  }

  /**
   * @notice Getter for the fee tier
   * @return The fee tier
   */
  function feeTier() external view returns (uint24) {
    return _feeTier;
  }
}
