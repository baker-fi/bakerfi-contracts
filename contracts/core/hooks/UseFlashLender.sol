
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


abstract contract UseFlashLender {
    IERC3156FlashLender immutable _fLender;

    constructor(ServiceRegistry registry) {
        _fLender = IERC3156FlashLender(registry.getServiceFromHash(FLASH_LENDER));
    }

    function flashLender() internal view returns (IERC3156FlashLender) {
        return _fLender;
    }

    function flashLenderA() internal view returns (address) {
        return address(_fLender);
    }
}

