// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

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
  using SafeERC20 for IERC20;

  error InvalidWETHContract();
  error FailedAllowance();
  error InvalidWETHAmount();
  error InsufficientWETHBalance();
  error ETHTransferNotAllowed(address sender);

  IWETH private _wETH;

  /**
   * @dev Initializes the UseWETH contract.
   * @param weth The address of the VaultRegistry contract for accessing WETH.
   */
  function _initUseWETH(address weth) internal onlyInitializing {
    _wETH = IWETH(weth);
    if (address(_wETH) == address(0)) revert InvalidWETHContract();
  }

  /**
   * @dev Fallback function to receive Ether.
   *
   * This function is marked as external and payable. It is automatically called
   * when Ether is sent to the contract, such as during a regular transfer or as part
   * of a self-destruct operation.
   *
   * Only Transfers from the strategy during the withdraw are allowed
   *
   * Emits no events and allows the contract to accept Ether.
   */
  receive() external payable virtual {}

  /**
   * @dev Returns the IWETH interface.
   * @return The IWETH interface.
   */
  function wETH() internal view returns (IWETH) {
    return _wETH;
  }

  /**
   * @dev Returns the address of the WETH contract.
   * @return The address of the WETH contract.
   */
  function wETHA() internal view returns (address) {
    return address(_wETH);
  }

  /**
   * @dev Unwraps a specified amount of WETH to Ether.
   * @param wETHAmount The amount of WETH to unwrap.
   */
  function unwrapETH(uint256 wETHAmount) internal virtual {
    // Validate the WETH amount to ensure it is non-zero
    if (wETHAmount == 0) revert InvalidWETHAmount();

    // Check if the contract has sufficient WETH balance to unwrap
    uint256 wETHBalance = _wETH.balanceOf(address(this));

    if (wETHBalance < wETHAmount) revert InsufficientWETHBalance();

    // Unwrap the specified amount of WETH to Ether
    wETH().withdraw(wETHAmount);
  }

  /**
   * @dev Sends native tokens to a specified address.
   * @param to The address to send the native tokens to.
   * @param amount The amount of native tokens to send.
   */
  function sendNative(address to, uint256 amount) internal virtual {
    if (to == address(0)) revert ETHTransferNotAllowed(to);
    if (amount == 0) revert InvalidWETHAmount();
    if (address(this).balance < amount) revert InsufficientWETHBalance();

    (bool success, ) = to.call{ value: amount }("");
    if (!success) revert ETHTransferNotAllowed(to);
  }

  function wrapETH(uint256 amount) internal virtual {
    if (address(this).balance < amount) revert InvalidWETHAmount();

    wETH().deposit{ value: amount }();
  }
}

/**
 * @dev This contract is abstract and cannot be deployed directly.
 */
contract UseWETHMock is UseWETH {
  function initialize(address initialOwner) public initializer {
    _initUseWETH(initialOwner);
  }

  function test__unwrapETH(uint256 wETHAmount) external {
    unwrapETH(wETHAmount);
  }

  function test__wrapETH(uint256 amount) external {
    wrapETH(amount);
  }
}
