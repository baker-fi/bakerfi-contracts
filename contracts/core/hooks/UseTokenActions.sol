// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title UseTokenActions
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice This Hook provides functions to interact with ERC20 tokens and
 * could be included in other contracts to provide token actions.
 *
 */
abstract contract UseTokenActions is Initializable {
  using SafeERC20 for IERC20;

  /**
   * @dev Error thrown when an invalid token address is provided.
   */
  error InvalidToken();
  /**
   * @dev Error thrown when an invalid recipient address is provided.
   */
  error InvalidRecipient();
  /**
   * @dev Error thrown when the allowance is not enough.
   */
  error NotEnoughAllowance();

  error SweepFailed();

  /**
   * @dev Pulls a specified amount of tokens from the message sender to this contract.
   * @param token The ERC20 token to pull.
   * @param amount The amount of tokens to pull.
   */
  function pullToken(IERC20 token, uint256 amount) internal virtual {
    // Check if the token address is valid
    if (address(token) == address(0)) revert InvalidToken();

    if (token.allowance(msg.sender, address(this)) < amount) revert NotEnoughAllowance();
    // Use SafeERC20 to transfer tokens from the message sender to this contract
    IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
  }

  /**
   * @dev Pulls a specified amount of tokens from a specified address to this contract.
   * @param token The ERC20 token to pull.
   * @param from The address from which to pull the tokens.
   * @param amount The amount of tokens to pull.
   */
  function pullTokenFrom(IERC20 token, address from, uint256 amount) internal virtual {
    // Check if the token address is valid
    if (address(token) == address(0)) revert InvalidToken();

    if (token.allowance(from, address(this)) < amount) revert NotEnoughAllowance();
    // Use SafeERC20 to transfer tokens from the specified address to this contract
    IERC20(token).safeTransferFrom(from, address(this), amount);
  }

  /**
   * @dev Pushes a specified amount of tokens from this contract to a specified address.
   * @param token The ERC20 token to push.
   * @param to The address to which to push the tokens.
   * @param amount The amount of tokens to push.
   */
  function pushToken(IERC20 token, address to, uint256 amount) internal virtual {
    // Check if the token address is valid
    if (address(token) == address(0)) revert InvalidToken();
    // Check if the recipient address is valid
    if (address(to) == address(0)) revert InvalidRecipient();
    // Use SafeERC20 to transfer tokens from this contract to the specified address
    IERC20(token).safeTransfer(to, amount);
  }

  /**
   * @dev Pushes a specified amount of tokens from a specified address to another specified address.
   * @param token The ERC20 token to push.
   * @param from The address from which to push the tokens.
   * @param to The address to which to push the tokens.
   * @param amount The amount of tokens to push.
   */
  function pushTokenFrom(IERC20 token, address from, address to, uint256 amount) internal virtual {
    // Check if the token address is valid
    if (address(token) == address(0)) revert InvalidToken();
    // Check if the recipient address is valid
    if (address(to) == address(0)) revert InvalidRecipient();
    // Check if the allowance is enough , spender is the Token Actions contract
    if (token.allowance(from, address(this)) < amount) revert NotEnoughAllowance();
    // Use SafeERC20 to transfer tokens from the specified address to another specified address
    IERC20(token).safeTransferFrom(from, to, amount);
  }

  /**
   * @dev Sweeps all tokens from this contract to a specified address.
   * @param token The ERC20 token to sweep.
   * @param to The address to which to sweep the tokens.
   */
  function sweepTokens(IERC20 token, address to) internal virtual returns (uint256 sweptAmount) {
    // Check if the token address is valid
    if (address(token) == address(0)) revert InvalidToken();
    // Check if the recipient address is valid
    if (address(to) == address(0)) revert InvalidRecipient();
    // Use SafeERC20 to transfer tokens from this contract to the specified address
    sweptAmount = IERC20(token).balanceOf(address(this));

    IERC20(token).safeTransfer(to, sweptAmount);
  }

  /**
   * @dev Sweeps all native tokens from this contract to a specified address.
   * @param to The address to which to sweep the native tokens.
   */
  function sweepNative(address to) internal virtual returns (uint256 sweptAmount) {
    // Check if the recipient address is valid
    if (address(to) == address(0)) revert InvalidRecipient();
    // Use SafeERC20 to transfer tokens from this contract to the specified address
    sweptAmount = address(this).balance;
    if (sweptAmount > 0) {
      (bool success, ) = payable(to).call{ value: sweptAmount }("");
      if (!success) revert SweepFailed();
    }
    return sweptAmount;
  }
}

contract UseTokenActionsMock is UseTokenActions {
  receive() external payable {}

  function test__pullToken(IERC20 token, uint256 amount) public {
    pullToken(token, amount);
  }

  function test__pullTokenFrom(IERC20 token, address from, uint256 amount) public {
    pullTokenFrom(token, from, amount);
  }

  function test__pushToken(IERC20 token, address to, uint256 amount) public {
    pushToken(token, to, amount);
  }

  function test__pushTokenFrom(IERC20 token, address from, address to, uint256 amount) public {
    pushTokenFrom(token, from, to, amount);
  }

  function test__sweepTokens(IERC20 token, address to) public returns (uint256) {
    return sweepTokens(token, to);
  }

  function test__sweepNative(address to) public returns (uint256) {
    return sweepNative(to);
  }
}
