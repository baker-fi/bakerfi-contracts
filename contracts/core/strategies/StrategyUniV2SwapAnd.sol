// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { StrategySwapAnd } from "./StrategySwapAnd.sol";
import { UseUniV2Swapper } from "../hooks/swappers/UseUniV2Swapper.sol";
import { IUniswapV2Router02 } from "../../interfaces/uniswap/v2/IUniswapV2Router02.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IStrategy } from "../../interfaces/core/IStrategy.sol";
import { IOracle } from "../../interfaces/core/IOracle.sol";
import { ISwapHandler } from "../../interfaces/core/ISwapHandler.sol";

/**
 * @title StrategyUniV2SwapAnd
 * @notice A strategy that swaps an asset for a parked asset and then swaps the parked asset back to the original asset
 * This strategy could be used to convert an assert to an yield bearing asset harvest the yield
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 */
contract StrategyUniV2SwapAnd is StrategySwapAnd, UseUniV2Swapper {
  /**
   * @notice Constructor for the StrategyUniV2SwapAnd contract
   * @param initialOwner The address of the initial owner of the contract
   * @param iAsset The asset being managed
   * @param iUnderlyingStrategy The underlying strategy
   * @param iOracle The oracle used to get the price of the asset iAsset/underlyingAsset
   * @param router The swap router used to swap the asset
   */
  constructor(
    address initialOwner,
    IERC20 iAsset,
    IStrategy iUnderlyingStrategy,
    IOracle iOracle,
    IUniswapV2Router02 router
  ) StrategySwapAnd(initialOwner, iAsset, iUnderlyingStrategy, iOracle) {
    _initUseUniV2Swapper(router);
    // Allow the router to spend Collateral tokens on swaps
    _allowRouterSpend(IERC20(iAsset), 2 ** 256 - 1);
    _allowRouterSpend(IERC20(iUnderlyingStrategy.asset()), 2 ** 256 - 1);
  }

  /**
   * @notice Internal function to swap the asset using the UniV2Swapper
   * @param params The swap parameters
   * @return amountIn The amount of input tokens
   * @return amountOut The amount of output tokens
   */
  function _swap(
    ISwapHandler.SwapParams memory params
  ) internal override returns (uint256 amountIn, uint256 amountOut) {
    return UseUniV2Swapper.swap(params);
  }
}
