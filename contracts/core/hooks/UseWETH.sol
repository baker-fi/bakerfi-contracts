// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
pragma experimental ABIEncoderV2;

import { ServiceRegistry, WETH_CONTRACT } from "../ServiceRegistry.sol";
import { IWETH } from "../../interfaces/tokens/IWETH.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title UseWETH
 *
 * @dev Abstract contract to integrate the use of Wrapped Ether (WETH).
 *      Provides functions to initialize, access, and unwrap WETH.
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 */
abstract contract UseWETH is Initializable {
  address private _wETH;
  using SafeERC20 for IERC20;

  error InvalidWETHContract();
  error FailedAllowance();

  /**
   * @dev Initializes the UseWETH contract.
   * @param registry The address of the ServiceRegistry contract for accessing WETH.
   */
  function _initUseWETH(ServiceRegistry registry) internal onlyInitializing {
    _wETH = registry.getServiceFromHash(WETH_CONTRACT);
    if (_wETH == address(0)) revert InvalidWETHContract();
  }

  /**
   * @dev Returns the IWETH interface.
   * @return The IWETH interface.
   */
  function wETH() internal view returns (IWETH) {
    return IWETH(_wETH);
  }

  /**
   * @dev Returns the address of the WETH contract.
   * @return The address of the WETH contract.
   */
  function wETHA() internal view returns (address) {
    return _wETH;
  }

  /**
   * @dev Unwraps a specified amount of WETH to Ether.
   * @param wETHAmount The amount of WETH to unwrap.
   */
  function _unwrapWETH(uint256 wETHAmount) internal {
    if (!IERC20(address(_wETH)).approve(address(_wETH), wETHAmount)) revert FailedAllowance();
    wETH().withdraw(wETHAmount);
  }
}
