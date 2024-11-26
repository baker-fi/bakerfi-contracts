// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ISwapHandler } from "../../../interfaces/core/ISwapHandler.sol";

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { AerodromeLibrary } from "../../../libraries/AerodromeLibrary.sol";
import { ISwapRouter } from "../../../interfaces/aerodrome/ISwapRouter.sol";

/**
 * @title UseAeroSwapper
 *
 * @dev Abstract contract to integrate the use of Uniswap V3
 *      Provides functions to initialize, access and swap
 *      It allows any contract to swap an ERC-20 for another ERC-20 with a fixed
 *      input amoun  or a fixed output amount of tokens.
 *
 *      During the contract initialization it sets the uniswap router address from the
 *      service registry
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 */
abstract contract UseAeroSwapper is ISwapHandler {
  using SafeERC20 for IERC20;

  error InvalidAeroRouterContract();
  error FailedToApproveAllowanceForSwapRouter();

  ISwapRouter private _aeroRouter;

  function _initAeroSwapper(ISwapRouter iAeroRouter) internal {
    _aeroRouter = iAeroRouter; //
    if (address(_aeroRouter) == address(0)) revert InvalidAeroRouterContract();
  }

  function aeroRouter() public view returns (ISwapRouter) {
    return _aeroRouter;
  }

  function aeroRouterA() internal view returns (address) {
    return address(_aeroRouter);
  }

  function _allowRouterSpend(IERC20 token, uint256 amount) internal virtual {
    if (!token.approve(address(_aeroRouter), amount))
      revert FailedToApproveAllowanceForSwapRouter();
  }

  /**
   * @inheritdoc ISwapHandler
   * @notice Executes a token swap on Aerodrome using the specified parameters.
   * @dev This function supports two types of swaps:
   *      - Exact Input: The user specifies the amount of input tokens to swap, and the function calculates
   *        the minimum amount of output tokens to receive.
   *      - Exact Output: The user specifies the desired amount of output tokens, and the function calculates
   *        the required amount of input tokens.
   *
   * @param params A struct containing the parameters for the swap, including:
   *        - underlyingIn: The address of the token being sold.
   *        - underlyingOut: The address of the token being bought.
   *        - mode: The type of swap (0 for exact input, 1 for exact output).
   *        - amountIn: The amount of the input token to sell (exact value for exact input, maximum for exact output).
   *        - minAmountOut: The amount of the output token to buy (exact value for exact output, minimum for exact input).
   *
   * @return amountIn The actual amount of input tokens used in the swap.
   * @return amountOut The actual amount of output tokens received from the swap.
   *
   * @dev Reverts if:
   *      - The input or output token address is invalid.
   *      - The swap fails to execute successfully.
   */
  function swap(
    ISwapHandler.SwapParams memory params
  ) internal virtual override returns (uint256 amountIn, uint256 amountOut) {
    return AerodromeLibrary.swapAerodrome(aeroRouter(), params);
  }
}

/**
 * @dev Mock contract to test the UseAeroSwapperMock
 */
contract UseAeroSwapperMock is UseAeroSwapper {
  /**
   * @dev Initialize the UseUniV2SwapperMock
   */
  constructor(ISwapRouter iAeroRouter) {
    _initAeroSwapper(iAeroRouter);
  }

  /**
   * @notice Mock function to test the swap function
   */
  function test__swap(
    ISwapHandler.SwapParams memory params
  ) external returns (uint256 amountIn, uint256 amountOut) {
    return swap(params);
  }

  function test_allowRouterSpend(IERC20 token, uint256 amount) external {
    _allowRouterSpend(token, amount);
  }
}
