// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

abstract contract UsePermitTransfers {
  using SafeERC20 for IERC20;

  /**
   * @dev Allows the parent contractto pull tokens from the user using ERC20Permit.
   * @param token The address of the ERC20 token.
   * @param amount The amount of tokens to pull.
   * @param owner The address of the token owner.
   * @param deadline The deadline for the permit.
   * @param v The recovery byte of the signature.
   * @param r The output from the signing process (part of the signature).
   * @param s The output from the signing process (part of the signature).
   */
  function pullTokensWithPermit(
    IERC20Permit token,
    uint256 amount,
    address owner,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal virtual {
    // Permit the VaultRouter to spend tokens on behalf of the owner
    IERC20Permit(token).permit(owner, address(this), amount, deadline, v, r, s);

    // Transfer the tokens from the owner to this contract
    IERC20(address(token)).safeTransferFrom(owner, address(this), amount);
  }
}

contract UsePermitTransfersMock is UsePermitTransfers {
  /**
   * @dev This function is a test wrapper for the internal function pullTokensWithPermit.
   * It allows for external calls to simulate the pulling of tokens using ERC20Permit.
   *
   * @param token The address of the ERC20 token that supports permit.
   * @param amount The amount of tokens to pull.
   * @param owner The address of the token owner.
   * @param deadline The deadline for the permit.
   * @param v The recovery byte of the signature.
   * @param r The output from the signing process (part of the signature).
   * @param s The output from the signing process (part of the signature).
   */
  function test__pullTokensWithPermit(
    IERC20Permit token,
    uint256 amount,
    address owner,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public {
    pullTokensWithPermit(token, amount, owner, deadline, v, r, s);
  }
}
