// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import {StrategyLeverage} from "./StrategyLeverage.sol";
import {ServiceRegistry} from "../../core/ServiceRegistry.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UseAAVEv3} from "../hooks/UseAAVEv3.sol";
import {DataTypes} from "../../interfaces/aave/v3/IPoolV3.sol";
import {AddressUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
/**
 * @title  AAVE v3 Recursive Staking Strategy for anyETH/WETH
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev This strategy is used by the bakerfi vault to deploy ETH capital
 * on aave money market.
 *
 * The Collateral could be cbETH, wstETH, rETH against and the debt is always WETH
 *
 * The strategy inherits all the business logic from StrategyAAVEv3Base and could be deployed
 * on Optimism, Arbitrum , Base and Ethereum.
 */
contract StrategyAAVEv3 is Initializable, StrategyLeverage, UseAAVEv3{
    using SafeERC20 for IERC20;
    using AddressUpgradeable for address;
    using AddressUpgradeable for address payable;
    
    error FailedToApproveAllowanceForAAVE();
    error InvalidAAVEEMode();
    error FailedToRepayDebt();
    error InvalidWithdrawAmount();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    // solhint-disable no-empty-blocks
    function initialize(
        address initialOwner,
        address initialGovernor,
        ServiceRegistry registry,
        bytes32 collateral,
        bytes32 oracle,
        uint24 swapFeeTier,
        uint8 eModeCategory
    ) public initializer {        
        _initializeStrategyBase(
            initialOwner,
            initialGovernor,
            registry,
            collateral,
            oracle,
            swapFeeTier
        );
        _initUseAAVEv3(registry);
        aaveV3().setUserEMode(eModeCategory);
        if (aaveV3().getUserEMode(address(this)) != eModeCategory) revert InvalidAAVEEMode();
    }


    /**
     * Get the Current Position on AAVE v3 Money Market
     * 
     * @return collateralBalance  The Collateral Balance Amount
     * @return debtBalance  -  The Debt Token Balance Amount
     */   
    function _getMMPosition() internal virtual override view returns ( uint256 collateralBalance, uint256 debtBalance ) {
        DataTypes.ReserveData memory wethReserve = (aaveV3().getReserveData(wETHA()));
        DataTypes.ReserveData memory colleteralReserve = (aaveV3().getReserveData(ierc20A()));
        debtBalance = IERC20(wethReserve.variableDebtTokenAddress).balanceOf(address(this));
        collateralBalance = IERC20(colleteralReserve.aTokenAddress).balanceOf(
            address(this)
        );
    }

    
    function _supply( address assetIn,
        uint256 amountIn) internal override virtual  {
        if (!IERC20(assetIn).approve(aaveV3A(), amountIn)) revert FailedToApproveAllowanceForAAVE();
        aaveV3().supply(assetIn, amountIn, address(this), 0);
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
    ) internal override virtual{
        _supply(assetIn, amountIn);
        aaveV3().setUserUseReserveAsCollateral(assetIn, true);
        aaveV3().borrow(assetOut, borrowOut, 2, 0, address(this));
    }

    /**
     * @dev Repays a borrowed asset on AAVE v3.
     * @param assetIn The address of the borrowed asset to repay.
     * @param amount The amount of the borrowed asset to repay.
     */
    function _repay(address assetIn, uint256 amount) internal override virtual {
        if (!IERC20(assetIn).approve(aaveV3A(), amount)) revert FailedToApproveAllowanceForAAVE();
        if (aaveV3().repay(assetIn, amount, 2, address(this)) != amount) revert FailedToRepayDebt();
    }

    function _withdraw(address assetOut, uint256 amount,  address to) internal override virtual{
        if (aaveV3().withdraw(assetOut, amount, to) != amount)
            revert InvalidWithdrawAmount();
    }
}
