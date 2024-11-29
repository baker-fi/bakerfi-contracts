// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IV3SwapRouter } from "../interfaces/uniswap/v3/IV3SwapRouter.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract UniV3RouterMock is IV3SwapRouter {
  IERC20 _asset0;
  IERC20 _asset1;
  using SafeERC20 for IERC20;

  constructor(IERC20 asset0, IERC20 asset1) {
    _asset0 = asset0;
    _asset1 = asset1;
  }

  uint256 PRICE_PRECISION = 1e9;
  uint256 _price = 1e9;

  function uniswapV3SwapCallback(
    int256 amount0Delta,
    int256 amount1Delta,
    bytes calldata data
  ) external override {}

  function exactInputSingle(
    ExactInputSingleParams calldata params
  ) external payable override returns (uint256 amountOut) {
    require(
      IERC20(params.tokenIn).allowance(msg.sender, address(this)) >= amountOut,
      "No Enough Allowance"
    );
    IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), params.amountIn);
    if (params.tokenIn == address(_asset1)) {
      amountOut = (params.amountIn * PRICE_PRECISION) / _price;
    } else {
      amountOut = (params.amountIn * _price) / PRICE_PRECISION;
    }

    require(IERC20(params.tokenOut).balanceOf(address(this)) >= amountOut, "No Enough Liquidity");
    require(amountOut >= params.amountOutMinimum, "Mininum Out not reached");
    IERC20(params.tokenOut).safeTransfer(params.recipient, amountOut);
  }

  function exactInput(
    ExactInputParams calldata params
  ) external payable override returns (uint256 amountOut) {}

  function exactOutputSingle(
    ExactOutputSingleParams calldata params
  ) external payable override returns (uint256 amountIn) {
    require(
      IERC20(params.tokenOut).balanceOf(address(this)) >= params.amountOut,
      "No enough liquidity"
    );
    if (params.tokenIn == address(_asset0)) {
      amountIn = (params.amountOut * PRICE_PRECISION) / _price;
    } else {
      amountIn = (params.amountOut * _price) / PRICE_PRECISION;
    }
    require(amountIn <= params.amountInMaximum, "Max Input Reached");
    require(
      IERC20(params.tokenIn).allowance(msg.sender, address(this)) >= amountIn,
      "Not allowed to move input "
    );
    IERC20(params.tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
    IERC20(params.tokenOut).safeTransfer(params.recipient, params.amountOut);
  }

  function exactOutput(
    ExactOutputParams calldata params
  ) external payable override returns (uint256 amountIn) {}

  function setPrice(uint256 price) external {
    _price = price;
  }

  function getPrice() external view returns (uint256) {
    return _price;
  }
}
