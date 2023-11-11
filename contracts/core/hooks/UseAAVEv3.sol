// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry, AAVE_V3_CONTRACT} from "../ServiceRegistry.sol";
import { IServiceRegistry } from "../../interfaces/core/IServiceRegistry.sol";
import { IPoolV3 } from "../../interfaces/aave/v3/IPoolV3.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


abstract contract UseAAVEv3 is Initializable {
    using SafeERC20 for IERC20;

    IPoolV3 private _aavev3;

    function __initUseAAVEv3(ServiceRegistry registry) internal onlyInitializing {
        _aavev3 = IPoolV3(registry.getServiceFromHash(AAVE_V3_CONTRACT));
        require(address(_aavev3) != address(0), "Invalid AAVE v3 Contract");
    }

    function aaveV3() public view returns (IPoolV3) {
        return _aavev3;
    }

    function aaveV3A() public view returns (address) {
        return address(_aavev3);
    }

    function _supplyAndBorrow(
        address assetIn,
        uint256 amountIn,
        address assetOut,
        uint256 borrowOut
    ) internal {
        require(IERC20(assetIn).approve(aaveV3A(), amountIn));
        aaveV3().supply(assetIn, amountIn, address(this), 0);
        aaveV3().setUserUseReserveAsCollateral(assetIn, true);
        aaveV3().borrow(assetOut, borrowOut, 2, 0, address(this));
    }

    function _repay(address assetIn, uint256 amount) internal {        
        require(IERC20(assetIn).approve(aaveV3A(), amount));
        require(aaveV3().repay(assetIn, amount, 2, address(this)) == amount);
    }
}
