// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { StrategySwapAnd } from "./StrategySwapAnd.sol";
import { UseAeroSwapper } from "../hooks/swappers/UseAeroSwapper.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { IOracle } from "../../interfaces/core/IOracle.sol";
import { ISwapHandler } from "../../interfaces/core/ISwapHandler.sol";
import { ISwapRouter } from "../../interfaces/aerodrome/ISwapRouter.sol";

/**
 * @title StrategyAeroSwapAnd
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 */
contract StrategyAeroSwapAnd is StrategySwapAnd, UseAeroSwapper {
  /**
   * @notice Constructor for the StrategyAeroSwapAnd contract
   * @param initialOwner The address of the initial owner of the contract
   * @param iAsset The asset being managed
   * @param iUnderlyingStrategy The underlying strategy
   * @param iOracle The oracle used to get the price of the asset iAsset/underlyingAsset
   * @param router The Aerodrome swap router used to swap the asset
   */
  constructor(
    address initialOwner,
    IERC20 iAsset,
    IStrategy iUnderlyingStrategy,
    IOracle iOracle,
    ISwapRouter router
  ) StrategySwapAnd(initialOwner, iAsset, iUnderlyingStrategy, iOracle) {
    _initAeroSwapper(router);
    // Allow the router to spend Collateral tokens on swaps
    _allowRouterSpend(IERC20(iAsset), 2 ** 256 - 1);
    _allowRouterSpend(IERC20(iUnderlyingStrategy.asset()), 2 ** 256 - 1);
  }

  /**
   * @notice Internal function to swap the asset using the AeroSwapper
   * @param params The swap parameters
   * @return amountIn The amount of input tokens
   * @return amountOut The amount of output tokens
   */
  function _swap(
    ISwapHandler.SwapParams memory params
  ) internal override returns (uint256 amountIn, uint256 amountOut) {
    return UseAeroSwapper.swap(params);
  }
}
