// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
pragma experimental ABIEncoderV2;

import { ServiceRegistry, UNISWAP_QUOTER_CONTRACT } from "../ServiceRegistry.sol";
import { IQuoterV2 } from "../../interfaces/uniswap/v3/IQuoterV2.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { PERCENTAGE_PRECISION } from "../Constants.sol";

abstract contract UseUniQuoter is Initializable {
  IQuoterV2 private _quoter;

  error InvalidUniQuoterContract();
  error InvalidSlippageInput();

  function _initUseUniQuoter(ServiceRegistry registry) internal onlyInitializing {
    _quoter = IQuoterV2(registry.getServiceFromHash(UNISWAP_QUOTER_CONTRACT));
    if (address(_quoter) == address(0)) revert InvalidUniQuoterContract();
  }

  function uniQuoter() public view returns (IQuoterV2) {
    return _quoter;
  }

  function uniQuoterA() public view returns (address) {
    return address(_quoter);
  }

  function getExactInputMinimumOutput(
    address tokenIn,
    address tokenOut,
    uint256 amountIn,
    uint24 feeTier,
    uint256 slippageTolerance
  ) public returns (uint256 amountOut, uint256 amountOutMinimum) {
    if (slippageTolerance > PERCENTAGE_PRECISION) revert InvalidSlippageInput();
    (amountOut, , , ) = _quoter.quoteExactInputSingle(
      IQuoterV2.QuoteExactInputSingleParams(tokenIn, tokenOut, amountIn, feeTier, 0)
    );
    amountOutMinimum =
      (amountOut * (PERCENTAGE_PRECISION - slippageTolerance)) /
      PERCENTAGE_PRECISION;
  }

  function getExactOutputMaxInput(
    address tokenIn,
    address tokenOut,
    uint256 amountOut,
    uint24 feeTier,
    uint256 slippageTolerance
  ) public returns (uint256 amountIn, uint256 amountInMax) {
    (amountIn, , , ) = _quoter.quoteExactOutputSingle(
      IQuoterV2.QuoteExactOutputSingleParams(tokenIn, tokenOut, amountOut, feeTier, 0)
    );
    amountInMax = (amountIn * (PERCENTAGE_PRECISION + slippageTolerance)) / PERCENTAGE_PRECISION;
  }
}
