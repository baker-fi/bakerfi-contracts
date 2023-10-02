// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "./ServiceRegistry.sol";
import {WETH_CONTRACT,UNISWAP_QUOTER, PERCENTAGE_PRECISION,SWAPPER_HANDLER, SETTINGS, WSTETH_ETH_ORACLE, AAVE_V3, FLASH_LENDER, ST_ETH_CONTRACT, WST_ETH_CONTRACT} from "./Constants.sol";
import {IWETH} from "../interfaces/tokens/IWETH.sol";
import {IServiceRegistry} from "../interfaces/core/IServiceRegistry.sol";
import {IOracle} from "../interfaces/core/IOracle.sol";
import {IWStETH} from "../interfaces/lido/IWStETH.sol";
import {IQuoterV2} from "../interfaces/uniswap/v3/IQuoterV2.sol";
import {IPoolV3} from "../interfaces/aave/v3/IPoolV3.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISwapHandler} from "../interfaces/core/ISwapHandler.sol";
import "@openzeppelin/contracts/interfaces/IERC3156FlashLender.sol";
import {ISettings} from "../interfaces/core/ISettings.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/aave/v3/DataTypes.sol";

abstract contract UseServiceRegistry {
    ServiceRegistry private immutable _registry;

    constructor(ServiceRegistry registry) {
        _registry = registry;
    }

    function registerSvc() internal view returns (IServiceRegistry) {
        return _registry;
    }
}

abstract contract UseWETH {
    IWETH immutable _wETH;
    using SafeERC20 for IERC20;

    constructor(ServiceRegistry registry) {
        _wETH = IWETH(registry.getServiceFromHash(WETH_CONTRACT));
    }

    function wETH() internal view returns (IWETH) {
        return _wETH;
    }

    function wETHA() internal view returns (address) {
        return address(_wETH);
    }

    function unwrapWETH(uint256 wETHAmount) internal {
        IERC20(address(_wETH)).safeApprove(address(_wETH), wETHAmount);
        wETH().withdraw(wETHAmount);
    }
}

contract UseIERC20 {
    IERC20 immutable _ierc20;

    constructor(ServiceRegistry registry, bytes32 name) {
        _ierc20 = IERC20(registry.getServiceFromHash(name));
    }

    function ierc20() internal view returns (IERC20) {
        return _ierc20;
    }

    function ierc20A() internal view returns (address) {
        return address(_ierc20);
    }
}

abstract contract UseSettings {
    ISettings immutable _settings;

    constructor(ServiceRegistry registry) {
        _settings = ISettings(registry.getServiceFromHash(SETTINGS));
    }

    function settings() internal view returns (ISettings) {
        return _settings;
    }
    function settingsA() internal view returns (address) {
        return address(_settings);
    }
}

abstract contract UseStETH {
    IERC20 immutable _stETH;

    constructor(ServiceRegistry registry) {
        _stETH = IERC20(registry.getServiceFromHash(ST_ETH_CONTRACT));
    }

    function stETH() internal view returns (IERC20) {
        return _stETH;
    }

    function stETHA() internal view returns (address) {
        return address(_stETH);
    }
}

abstract contract UseWstETH {
    IWStETH immutable _wstETH;
    IERC20 immutable _stETHToken;
    
    using SafeERC20 for IERC20;

    constructor(ServiceRegistry registry) {
        _wstETH = IWStETH(registry.getServiceFromHash(WST_ETH_CONTRACT));
        _stETHToken = IERC20(registry.getServiceFromHash(ST_ETH_CONTRACT));
    }

    function wstETH() internal view returns (IWStETH) {
        return _wstETH;
    }

    function wstETHA() internal view returns (address) {
        return address(_wstETH);
    }

    function unwrapWstETH(uint256 amount) internal returns (uint256 stETHAmount) {
        IERC20(wstETHA()).safeApprove(wstETHA(), amount);
        stETHAmount = wstETH().unwrap(amount);
    }

    function wrapWstETH(uint256 amount) internal returns (uint256 amountOut) {
        _stETHToken.safeApprove(wstETHA(), amount);
        amountOut = IWStETH(wstETHA()).wrap(amount);
    }
}

abstract contract UseAAVEv3 {
    
    using SafeERC20 for IERC20;

    IPoolV3 immutable _aavev3;
    
    constructor(ServiceRegistry registry) {
        _aavev3 = IPoolV3(registry.getServiceFromHash(AAVE_V3));
    }

    function aaveV3() internal view returns (IPoolV3) {
        return _aavev3;
    }

    function aaveV3A() internal view returns (address) {
        return address(_aavev3);
    }

    function supplyAndBorrow(
        address assetIn,
        uint256 amountIn,
        address assetOut,
        uint256 borrowOut
    ) internal {
        IERC20(assetIn).approve(aaveV3A(), amountIn);
        aaveV3().supply(assetIn, amountIn, address(this), 0);
        aaveV3().setUserUseReserveAsCollateral(assetIn, true);        
        aaveV3().borrow(assetOut, borrowOut, 2, 0, address(this));
    }

    function repay(
         address assetIn,
         uint256 amount
    ) internal {
        IERC20(assetIn).safeApprove(aaveV3A(), amount);
        aaveV3().repay(assetIn, amount, 2, address(this));      
    }
}

abstract contract UseOracle {
    IOracle immutable _oracle;

    constructor(ServiceRegistry registry, bytes32 oracleName ) {
        _oracle = IOracle(registry.getServiceFromHash(oracleName));
    }

    function oracle() internal view returns (IOracle) {
        return _oracle;
    }

    function getLastPrice() internal view returns (uint256) {
        return _oracle.getLatestPrice();
    }
}

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


abstract contract UseUniQuoter {
    
    IQuoterV2 immutable _quoter;

    constructor(ServiceRegistry registry) {
        _quoter = IQuoterV2(registry.getServiceFromHash(UNISWAP_QUOTER));
    }

    function uniQuoter() internal view returns (IQuoterV2) {
        return _quoter;
    }

    function uniQuoterA() internal view returns (address) {
        return address(_quoter);
    }
}