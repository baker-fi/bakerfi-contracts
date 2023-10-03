// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {WETH_CONTRACT,UNISWAP_QUOTER, PERCENTAGE_PRECISION,SWAPPER_HANDLER, SETTINGS, WSTETH_ETH_ORACLE, AAVE_V3, FLASH_LENDER, ST_ETH_CONTRACT, WST_ETH_CONTRACT} from "../Constants.sol";
import {IWETH} from "../../interfaces/tokens/IWETH.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {IOracle} from "../../interfaces/core/IOracle.sol";
import {IWStETH} from "../../interfaces/lido/IWStETH.sol";
import {IQuoterV2} from "../../interfaces/uniswap/v3/IQuoterV2.sol";
import {IPoolV3} from "../../interfaces/aave/v3/IPoolV3.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISwapHandler} from "../../interfaces/core/ISwapHandler.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {ISettings} from "../../interfaces/core/ISettings.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/aave/v3/DataTypes.sol";


abstract contract UseSwapper {
    ISwapHandler immutable _swapper;

    constructor(ServiceRegistry registry) {
        _swapper = ISwapHandler(registry.getServiceFromHash(SWAPPER_HANDLER));
    }

    function swapper() internal view returns (ISwapHandler) {
        return _swapper;
    }

    function swapperA() internal view returns (address) {
        return address(_swapper);
    }

    function swaptoken(
        address assetIn,
        address assetOut,
        uint mode,
        uint256 amountIn,
        uint256 amountOut
    ) internal returns (uint256 returnedAmount) {
        IERC20(assetIn).approve(swapperA(), amountIn);
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
