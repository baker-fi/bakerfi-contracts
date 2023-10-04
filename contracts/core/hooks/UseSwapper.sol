// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {SWAPPER_HANDLER} from "../Constants.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";

abstract contract UseSwapper {
    ISwapHandler immutable private _swapper;

    constructor(ServiceRegistry registry) {
        _swapper = ISwapHandler(registry.getServiceFromHash(SWAPPER_HANDLER));
        require(address(_swapper) != address(0), "Invalid Swapper Handler Contract");
    }

    function swapper() public view returns (ISwapHandler) {
        return _swapper;
    }

    function swapperA() public view returns (address) {
        return address(_swapper);
    }

    function _swaptoken(
        address assetIn,
        address assetOut,
        uint mode,
        uint256 amountIn,
        uint256 amountOut
    ) internal returns (uint256 returnedAmount) {
        require(IERC20(assetIn).approve(swapperA(), amountIn));
        ISwapHandler.SwapParams memory params = ISwapHandler.SwapParams(
            assetIn,
            assetOut,
            mode,
            amountIn,
            amountOut,
            bytes("")
        );
        returnedAmount = swapper().executeSwap(params);
    }
}
