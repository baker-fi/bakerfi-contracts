// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IUniswapV2Router02 } from "../../../interfaces/uniswap/v2/IUniswapV2Router02.sol";
import { ISwapRouter } from "../../../interfaces/aerodrome/ISwapRouter.sol";
import { ISwapHandler } from "../../../interfaces/core/ISwapHandler.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IV3SwapRouter } from "../../../interfaces/uniswap/v3/IV3SwapRouter.sol";
import { UniV2Library } from "../../../libraries/UniV2Library.sol";
import { UniV3Library } from "../../../libraries/UniV3Library.sol";
import { GovernableOwnable } from "../../GovernableOwnable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { AerodromeLibrary } from "../../../libraries/AerodromeLibrary.sol";
/**
 * @title UseUnifiedSwapper
 *
 * @notice A contract that allows to swap tokens using different implementations of the swapper
 *
 * Supports Uniswap V3, Uniswap V2, and Aerodrome
 *
 * Manages authorized routes for swaps acting as a unified swap router for different swap implementations.
 * Integrating multiple DEX protocols (Uniswap V2, V3, and Aerodrome)
 *
 * It prevens memory layout collisions on upgrades
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 */
abstract contract UseUnifiedSwapper is ISwapHandler, GovernableOwnable {
  using SafeERC20 for IERC20;
  error InvalidRouter();
  error RouteAlreadyAuthorized();
  error RouteNotAuthorized();
  error FailedToApproveAllowance();
  error InvalidProvider();
  /**
   * @notice The provider of the swap
   */
  enum SwapProvider {
    NONE,
    UNIV3,
    UNIV2,
    AERODROME
  }
  /**
   * @notice The information about a route
   */
  struct RouteInfo {
    SwapProvider provider; // 1byte one, UniswapV3, UniswapV2, Aerodrome
    address router; // Protocol Router
    uint24 uniV3Tier; // 3 bytes UniswapV3 fee tier
    uint24 tickSpacing; // 3 bytes tick spacing
  }

  mapping(bytes32 => RouteInfo) private _routes;

  function _key(address tokenA, address tokenB) internal pure returns (bytes32) {
    return keccak256(abi.encode(tokenA < tokenB ? [tokenA, tokenB] : [tokenB, tokenA]));
  }
  /**
   * @notice Enables a route for a given pair of tokens
   * @param tokenIn The input token address
   * @param tokenOut The output token address
   * @param routeInfo The route information
   */
  function enableRoute(
    address tokenIn,
    address tokenOut,
    RouteInfo memory routeInfo
  ) external onlyGovernor {
    bytes32 key = _key(tokenIn, tokenOut);
    // Check if the route is already authorized
    if (_routes[key].provider != SwapProvider.NONE) revert RouteAlreadyAuthorized();
    // Set the route information
    if (!IERC20(tokenIn).approve(routeInfo.router, type(uint256).max))
      revert FailedToApproveAllowance();

    if (!IERC20(tokenOut).approve(routeInfo.router, type(uint256).max))
      revert FailedToApproveAllowance();

    _routes[key] = routeInfo;
  }

  /**
   * @notice Disables a route for a given pair of tokens
   * @param tokenIn The input token address
   * @param tokenOut The output token address
   */
  function disableRoute(address tokenIn, address tokenOut) external onlyGovernor {
    // Check if the route is authorized
    bytes32 key = _key(tokenIn, tokenOut);
    // Check if the route is authorized
    if (_routes[key].provider == SwapProvider.NONE) revert RouteNotAuthorized();
    // Set the allowance to a very small amount, USDT does not support 0 allowance
    if (!IERC20(tokenIn).approve(_routes[key].router, 1)) revert FailedToApproveAllowance();
    if (!IERC20(tokenOut).approve(_routes[key].router, 1)) revert FailedToApproveAllowance();
    // Set the route information to none
    _routes[key].provider = SwapProvider.NONE;
  }

  /**
   * @notice Checks if a route is authorized for a given pair of tokens
   * @param tokenIn The input token address
   * @param tokenOut The output token address
   * @return true if the route is authorized, false otherwise
   */
  function isRouteEnabled(address tokenIn, address tokenOut) public view returns (bool) {
    bytes32 key = _key(tokenIn, tokenOut);
    return _routes[key].provider != SwapProvider.NONE;
  }

  /**
    * @inheritdoc ISwapHandler
    * @notice The swap function is responsible for executing token swaps based on the authorized routes.
    * It retrieves the route information, checks if the route is authorized, and then determines
    * the appropriate swap pro
    -+
    vider to execute the swap. The function handles swaps for Uniswap V2,
    * Uniswap V3, and Curve, encoding the necessary parameters for the Curve swap.
   */
  function swap(
    SwapParams memory params
  ) internal virtual override returns (uint256 amountIn, uint256 amountOut) {
    bytes32 key = _key(params.underlyingIn, params.underlyingOut);
    // Retrieve the route information using the storage getter
    RouteInfo memory routeInfo = _routes[key];
    // Check if the route is authorized; if not, revert the transaction with an error
    if (routeInfo.provider == SwapProvider.NONE) revert RouteNotAuthorized();
    // Determine the swap provider based on the route information
    if (routeInfo.provider == SwapProvider.UNIV3) {
      // If the provider is Uniswap V3, set the fee tier for the swap parameters
      params.payload = abi.encode(routeInfo.uniV3Tier);
      // Execute the swap using the Uniswap V3 swapper and return the result
      return UniV3Library.swapUniV3(IV3SwapRouter(routeInfo.router), params);
    } else if (routeInfo.provider == SwapProvider.UNIV2) {
      // If the provider is Uniswap V2, execute the swap using the Uniswap V2 swapper and return the result
      return UniV2Library.swapUniV2(IUniswapV2Router02(routeInfo.router), params);
    } else if (routeInfo.provider == SwapProvider.AERODROME) {
      params.payload = abi.encode(routeInfo.tickSpacing);
      return AerodromeLibrary.swapAerodrome(ISwapRouter(routeInfo.router), params);
    } else {
      revert InvalidProvider();
    }
  }
}
/**
 * @title UseUnifiedSwapperMock
 * @notice A mock contract for testing the UseUnifiedSwapper contract
 */
contract UseUnifiedSwapperMock is UseUnifiedSwapper {
  constructor() {
    _transferOwnership(msg.sender);
    _transferGovernorship(msg.sender);
  }
  /**
   * @notice Tests the swap function
   * @param params The swap parameters
   * @return amountIn The amount of input tokens used in the swap
   * @return amountOut The amount of output tokens received from the swap
   */
  function test__swap(
    SwapParams memory params
  ) external returns (uint256 amountIn, uint256 amountOut) {
    return UseUnifiedSwapper.swap(params);
  }
}
