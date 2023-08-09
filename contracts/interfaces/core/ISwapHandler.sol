// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

interface ISwapHandler {
    /// @notice Params for swaps using SwapHub contract and swap handlers
    /// @param underlyingIn sold token address
    /// @param underlyingOut bought token address
    /// @param mode type of the swap: 0 for exact input, 1 for exact output
    /// @param amountIn amount of token to sell. Exact value for exact input, maximum for exact output
    /// @param amountOut amount of token to buy. Exact value for exact output, minimum for exact input
    /// @param exactOutTolerance Maximum difference between requested amountOut and received tokens in exact output swap. Ignored for exact input
    /// @param payload multi-purpose byte param. The usage depends on the swap handler implementation
    struct SwapParams {
        address underlyingIn;
        address underlyingOut;
        uint mode;                  
        uint amountIn;              
        uint amountOut;             
        bytes payload;
    }

    /// @notice Execute a trade on the swap handler
    /// @param params struct defining the requested trade
    function executeSwap(SwapParams calldata params) external returns (uint256 amountOut);
}