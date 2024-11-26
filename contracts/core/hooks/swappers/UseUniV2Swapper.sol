// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IUniswapV2Router02 } from "../../../interfaces/uniswap/v2/IUniswapV2Router02.sol";
import { ISwapHandler } from "../../../interfaces/core/ISwapHandler.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { UniV2Library } from "../../../libraries/UniV2Library.sol";
/**
 * @title UseUniV2Swapper
 *
 * @dev Abstract contract to integrate the use of Uniswap V2
 *      Provides functions to initialize, access and swap
 *      It allows any contract to swap an ERC-20 for another ERC-20 with a fixed
 *      input amount or a fixed output amount of tokens.
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 */
abstract contract UseUniV2Swapper is ISwapHandler {
  using SafeERC20 for IERC20;

  error InvalidV2RouterContract();
  error FailedToApproveAllowance();

  /// @dev Storage slot for the UniswapV2 router address
  /// @dev bytes32(uint256(keccak256('bakerfi.storage.UseUniV2Swapper.v2UniRouter')) - 1)
  bytes32 private constant _V2_UNI_ROUTER_SLOT =
    0x47b2c96b5499f1e2d1a7c2ef4c1a5a1e0d4a0c2e4b6d8f0a2c4e6f8a0c2e4b6d;

  /**
   * @dev Initialize the Uniswap V2 Swapper
   */
  function _initUseUniV2Swapper(IUniswapV2Router02 iV2UniRouter) internal {
    if (address(iV2UniRouter) == address(0)) revert InvalidV2RouterContract();
    assembly {
      sstore(_V2_UNI_ROUTER_SLOT, iV2UniRouter)
    }
  }

  /**
   * @notice Returns the Uniswap V2 Router from the storage slot
   */
  function v2UniRouter() internal view returns (IUniswapV2Router02) {
    address router;
    assembly {
      router := sload(_V2_UNI_ROUTER_SLOT)
    }
    return IUniswapV2Router02(router);
  }

  /**
   * @inheritdoc ISwapHandler
   */
  /**
   * @notice Executes a token swap on Uniswap V2 using the Uniswap V2 Router
   * @dev This function allows for two types of swaps:
   *      - Exact Input: The user specifies the amount of input tokens to swap, and the function calculates
   *        the minimum amount of output tokens to receive.
   *      - Exact Output: The user specifies the desired amount of output tokens, and the function calculates
   *        the maximum amount of input tokens that can be used for the swap.
   *
   * @param params A struct containing the parameters for the swap, including:
   *        - underlyingIn: The address of the token being sold.
   *        - underlyingOut: The address of the token being bought.
   *        - mode: The type of swap (0 for exact input, 1 for exact output).
   *        - amountIn: The amount of the input token to sell (exact value for exact input, maximum for exact output).
   *        - amountOut: The amount of the output token to buy (exact value for exact output, minimum for exact input).
   *
   * @return amountIn The actual amount of input tokens used in the swap.
   * @return amountOut The actual amount of output tokens received from the swap.
   *
   * @dev Reverts if:
   *      - The input or output token address is invalid.
   *      - The swap fails (i.e., the output amount is zero).
   */
  function swap(
    ISwapHandler.SwapParams memory params
  ) internal virtual override returns (uint256 amountIn, uint256 amountOut) {
    return UniV2Library.swapUniV2(v2UniRouter(), params);
  }
  /**
   * @dev Allow the router to spend the input token
   */
  function _allowRouterSpend(IERC20 token, uint256 amount) internal virtual {
    if (!token.approve(address(v2UniRouter()), amount)) revert FailedToApproveAllowance();
  }
}

/**
 * @dev Mock contract to test the UseUniV2Swapper
 */
contract UseUniV2SwapperMock is UseUniV2Swapper {
  /**
   * @dev Initialize the UseUniV2SwapperMock
   */
  constructor(IUniswapV2Router02 iV2UniRouter) {
    _initUseUniV2Swapper(iV2UniRouter);
  }

  /**
   * @notice Mock function to test the swap function
   */
  function test__swap(
    ISwapHandler.SwapParams memory params
  ) external returns (uint256 amountIn, uint256 amountOut) {
    return swap(params);
  }
}
