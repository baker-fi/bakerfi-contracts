// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IQuoterV2} from "../interfaces/uniswap/v3/IQuoterV2.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract QuoterV2Mock is IQuoterV2 {

    uint256 RATIO_PRECISION  = 1e9;
    uint256 private _ratio = 1e9;

    
    function setRatio(uint256 ratio ) external {
        _ratio = ratio;
    }


    function quoteExactInput(
        bytes memory path,
        uint256 amountIn
    )
        external
        returns (
            uint256 amountOut,
            uint160[] memory sqrtPriceX96AfterList,
            uint32[] memory initializedTicksCrossedList,
            uint256 gasEstimate
        )
    {
     
    }

    function quoteExactInputSingle(
        QuoteExactInputSingleParams memory params
    )
        external
        returns (
            uint256 amountOut,
            uint160 sqrtPriceX96After,
            uint32 initializedTicksCrossed,
            uint256 gasEstimate
        )
    {
        amountOut = params.amountIn * RATIO_PRECISION / _ratio;
        return (amountOut,0,0,0);
    }

    function quoteExactOutput(
        bytes memory path,
        uint256 amountOut
    )
        external
        returns (
            uint256 amountIn,
            uint160[] memory sqrtPriceX96AfterList,
            uint32[] memory initializedTicksCrossedList,
            uint256 gasEstimate
        )
    {

    }

    function quoteExactOutputSingle(
        QuoteExactOutputSingleParams memory params
    )
        external
        returns (
            uint256 amountIn,
            uint160 sqrtPriceX96After,
            uint32 initializedTicksCrossed,
            uint256 gasEstimate
        )
    {
        amountIn = params.amount / (RATIO_PRECISION / _ratio);
        return (amountIn, 0, 0, 0);
    }
}
