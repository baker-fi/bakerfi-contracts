// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
pragma experimental ABIEncoderV2;

import { IPoolV3 } from "../../interfaces/aave/v3/IPoolV3.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title UseAAVEv3
 * @dev Abstract contract to integrate the use of AAVE v3 (Aave Protocol V2).
 *      Provides functions to initialize, access, supply, and borrow assets.
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 *
 */
abstract contract UseAAVEv3 is Initializable {
  using SafeERC20 for IERC20;

  IPoolV3 private _aavev3;

  error InvalidAAVEv3Contract();

  /**
   * @dev Initializes the UseAAVEv3 contract.
   * @param aaveV3Pool The address of the AAVE v3 contract.
   */
  function _initUseAAVEv3(address aaveV3Pool) internal onlyInitializing {
    _aavev3 = IPoolV3(aaveV3Pool);
    if (address(_aavev3) == address(0)) revert InvalidAAVEv3Contract();
  }

  /**
   * @dev Returns the IPoolV3 interface.
   * @return The IPoolV3 interface.
   */
  function aaveV3() internal view returns (IPoolV3) {
    return _aavev3;
  }

  /**
   * @dev Returns the address of the AAVE v3 contract.
   * @return The address of the AAVE v3 contract.
   */
  function aaveV3A() internal view returns (address) {
    return address(_aavev3);
  }
}
