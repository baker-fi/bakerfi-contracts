// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;
pragma experimental ABIEncoderV2;

import {ServiceRegistry, AAVE_V3_CONTRACT} from "../ServiceRegistry.sol";
import { IServiceRegistry } from "../../interfaces/core/IServiceRegistry.sol";
import { IPoolV3 } from "../../interfaces/aave/v3/IPoolV3.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title UseAAVEv3
 * @dev Abstract contract to integrate the use of AAVE v3 (Aave Protocol V2).
 *      Provides functions to initialize, access, supply, and borrow assets.
 *
 * @author Chef Kenji <chef.kenji@layerx.xyz>
 * @author Chef Kal-El <chef.kal-el@layerx.xyz>
 * 
 */
abstract contract UseAAVEv3 is Initializable {
    using SafeERC20 for IERC20;

    IPoolV3 private _aavev3;

    /**
     * @dev Initializes the UseAAVEv3 contract.
     * @param registry The address of the ServiceRegistry contract for accessing AAVE v3.
     */
    function _initUseAAVEv3(ServiceRegistry registry) internal onlyInitializing {
        _aavev3 = IPoolV3(registry.getServiceFromHash(AAVE_V3_CONTRACT));
        require(address(_aavev3) != address(0), "Invalid AAVE v3 Contract");
    }

    /**
     * @dev Returns the IPoolV3 interface.
     * @return The IPoolV3 interface.
     */
    function aaveV3() public view returns (IPoolV3) {
        return _aavev3;
    }

    /**
    * @dev Returns the address of the AAVE v3 contract.
    * @return The address of the AAVE v3 contract.
    */
    function aaveV3A() public view returns (address) {
        return address(_aavev3);
    }

    /**
     * @dev Supplies an asset and borrows another asset from AAVE v3.
     * @param assetIn The address of the asset to supply.
     * @param amountIn The amount of the asset to supply.
     * @param assetOut The address of the asset to borrow.
     * @param borrowOut The amount of the asset to borrow.
     */
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

    /**
    * @dev Repays a borrowed asset on AAVE v3.
    * @param assetIn The address of the borrowed asset to repay.
    * @param amount The amount of the borrowed asset to repay.
    */
    function _repay(address assetIn, uint256 amount) internal {        
        require(IERC20(assetIn).approve(aaveV3A(), amount));
        require(aaveV3().repay(assetIn, amount, 2, address(this)) == amount);
    }
}
