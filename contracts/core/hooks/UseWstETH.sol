// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
pragma experimental ABIEncoderV2;

import { IWStETH } from "../../interfaces/lido/IWStETH.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title UseWstETH
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @dev Abstract contract to integrate the use of Wrapped stETH (WstETH).
 *      Provides functions to initialize, access to wstETH interface, unwrap, and wrap WstETH.
 *
 * 🚨 Class optimized to be included on upgradeable contracts
 */
abstract contract UseWstETH is Initializable {
  IWStETH private _wstETH;
  IERC20 private _stETHToken;

  using SafeERC20 for IERC20;

  error InvalidWstETHContract();
  error InvalidStETHContract();
  error FailedToApproveWstAllowance();
  error FailedToApproveStAllowance();

  /**
   * Initialize function for upgradeable contracts
   */
  function _initUseWstETH(address iwstETH, address istETH) internal onlyInitializing {
    _wstETH = IWStETH(iwstETH);
    _stETHToken = IERC20(istETH);
    if (address(_wstETH) == address(0)) revert InvalidWstETHContract();
    if (address(_stETHToken) == address(0)) revert InvalidStETHContract();
  }

  /**
   * @dev Returns the IWStETH interface.
   * @return The IWStETH interface.
   */
  function wstETH() internal view returns (IWStETH) {
    return _wstETH;
  }

  /**
   * @dev Returns the address of the WstETH contract.
   * @return The address of the WstETH contract.
   */
  function wstETHA() internal view returns (address) {
    return address(_wstETH);
  }

  /**
   * @dev Wraps a specified amount of stETH to obtain wstETH.
   * @param amount The amount of stETH to wrap.
   * @return amountOut The amount of WstETH obtained after wrapping.
   */
  function _wrapWstETH(uint256 amount) internal returns (uint256 amountOut) {
    if (!_stETHToken.approve(wstETHA(), amount)) revert FailedToApproveStAllowance();
    amountOut = IWStETH(wstETHA()).wrap(amount);
  }

  /**
   * @dev Unwraps a specified amount of wstETH to stETH.
   * @param amount The amount of WstETH to unwrap.
   * @return stETHAmount The amount of stETH obtained after unwrapping.
   */
  function _unwrapWstETH(uint256 amount) internal returns (uint256 stETHAmount) {
    if (!IERC20(wstETHA()).approve(wstETHA(), amount)) revert FailedToApproveWstAllowance();
    stETHAmount = wstETH().unwrap(amount);
  }
}
