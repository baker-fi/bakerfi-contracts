// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISwapHandler } from "../../../interfaces/core/ISwapHandler.sol";
import { ICurveRouterNG } from "../../../interfaces/curve/ICurveRouterNG.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { CurveFiLibrary } from "../../../libraries/CurveFiLibrary.sol";

/**
 * @title UseCurveSwapper
 *
 * @dev Abstract contract to integrate Curve Finance NG for token swaps
 *      Provides functions to initialize, access and swap tokens using Curve NG Router
 *      It allows any contract to swap an ERC-20 for another ERC-20 with either
 *      a fixed input amount or a fixed output amount of tokens.
 *      The Curve NG Router is used for the swap to stableswap pools, metapools and crypto pools
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 *
 */
abstract contract UseCurveSwapper is ISwapHandler {
  using SafeERC20 for IERC20;

  error InvalidCurveRouterContract();
  error FailedToApproveAllowance();

  /// @dev Storage slot for the Curve Router NG contract
  /// @dev keccak256("xyz.bakerfi.UseCurveSwapper.curveRouterNG")
  bytes32 internal constant _CURVE_ROUTER_SLOT =
    0x12bf5c1f8c71d2ab50ad26cd63e0f5c50ba43161b985f5d4c823c1c5b55e3f1b;

  address public constant ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

  function _initUseCurveSwapper(ICurveRouterNG icurveRouterNG) internal {
    if (address(icurveRouterNG) == address(0)) revert InvalidCurveRouterContract();
    assembly {
      sstore(_CURVE_ROUTER_SLOT, icurveRouterNG)
    }
  }
  /**
   * @dev Returns the Curve Router contract
   * @return The Curve Router contract
   */
  function curveRouter() public view returns (ICurveRouterNG) {
    address router;
    assembly {
      router := sload(_CURVE_ROUTER_SLOT)
    }
    return ICurveRouterNG(router);
  }
  /**
   * @dev Returns the Curve Router contract address
   * @return The Curve Router contract address
   */
  function curveRouterA() internal view returns (address) {
    return address(curveRouter());
  }

  /**
   * @dev Approves the Curve Router contract to spend the specified amount of tokens
   * @param token The token to approve
   * @param amount The amount of tokens to approve
   */
  function _allowRouterSpend(IERC20 token, uint256 amount) internal virtual {
    if (!token.approve(curveRouterA(), amount)) revert FailedToApproveAllowance();
  }

  /**
   * @dev Executes a token swap using the Curve Router.
   *
   * @inheritdoc ISwapHandler
   */
  function swap(
    ISwapHandler.SwapParams memory params
  ) internal virtual override returns (uint256 amountIn, uint256 amountOut) {
    return CurveFiLibrary.swapCurveFi(curveRouter(), params);
  }
}

/**
 * @title UseCurveSwapperMock
 * @dev Mock contract for testing the UseCurveSwapper contract
 */
contract UseCurveSwapperMock is UseCurveSwapper {
  constructor(ICurveRouterNG icurveRouterNG) {
    _initUseCurveSwapper(icurveRouterNG);
  }
  /**
   * @dev Mock function for testing the swap function
   * @param params The swap parameters
   * @return amountIn The actual amount of input tokens used in the swap
   * @return amountOut The actual amount of output tokens received from the swap
   */
  function test__swap(
    ISwapHandler.SwapParams memory params
  ) external payable returns (uint256, uint256) {
    return swap(params);
  }
}
