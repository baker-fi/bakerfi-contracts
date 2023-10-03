// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry} from "../ServiceRegistry.sol";
import {
    AAVE_V3
} from "../Constants.sol";
import {IServiceRegistry} from "../../interfaces/core/IServiceRegistry.sol";
import {IPoolV3} from "../../interfaces/aave/v3/IPoolV3.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../../interfaces/aave/v3/DataTypes.sol";

abstract contract UseAAVEv3 {
    using SafeERC20 for IERC20;

    IPoolV3 immutable _aavev3;

    constructor(ServiceRegistry registry) {
        _aavev3 = IPoolV3(registry.getServiceFromHash(AAVE_V3));
        require(address(_aavev3) != address(0), "Invalid AAVE v3 Contract");
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

    function repay(address assetIn, uint256 amount) internal {
        IERC20(assetIn).safeApprove(aaveV3A(), amount);
        aaveV3().repay(assetIn, amount, 2, address(this));
    }
}
