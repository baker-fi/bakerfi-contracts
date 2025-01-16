// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { VaultRouter } from "../core/VaultRouter.sol";
import { ISwapHandler } from "../interfaces/core/ISwapHandler.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";

contract VaultRouterMock is VaultRouter {
  bytes public callInput;

  constructor() {}

  function swap(
    ISwapHandler.SwapParams memory params
  ) internal override returns (uint256 amountIn, uint256 amountOut) {
    callInput = abi.encode(
      params.underlyingIn,
      params.underlyingOut,
      params.mode,
      params.amountIn,
      params.amountOut,
      params.payload
    );
    return (params.amountIn, params.amountOut);
  }

  function pullToken(IERC20 token, uint256 amount) internal override {
    callInput = abi.encode(token, amount);
  }

  function pushToken(IERC20 token, address to, uint256 amount) internal override {
    callInput = abi.encode(token, to, amount);
  }

  function sweepNative(address to) internal override returns (uint256 amount) {
    callInput = abi.encode(to);
    return amount;
  }

  function pullTokenFrom(IERC20 token, address from, uint256 amount) internal override {
    callInput = abi.encode(token, from, amount);
  }

  function pushTokenFrom(IERC20 token, address from, address to, uint256 amount) internal override {
    callInput = abi.encode(token, from, to, amount);
  }

  function sweepTokens(IERC20 token, address to) internal override returns (uint256 amount) {
    callInput = abi.encode(token, to);
    return amount;
  }

  function wrapETH(uint256 amount) internal override {
    callInput = abi.encode(amount);
  }

  function unwrapETH(uint256 amount) internal override {
    callInput = abi.encode(amount);
  }

  function depositVault(
    IERC4626 vault,
    uint256 assets,
    address receiver,
    uint256 minShares
  ) internal override returns (uint256 shares) {
    callInput = abi.encode(vault, assets, receiver, minShares);
    return shares;
  }

  function mintVault(
    IERC4626 vault,
    uint256 shares,
    address receiver,
    uint256 maxAssets
  ) internal override returns (uint256 assets) {
    callInput = abi.encode(vault, shares, receiver, maxAssets);
    return assets;
  }

  function redeemVault(
    IERC4626 vault,
    uint256 shares,
    address receiver,
    address owner,
    uint256 minAssets
  ) internal override returns (uint256 assets) {
    callInput = abi.encode(vault, shares, receiver, owner, minAssets);
    return assets;
  }

  function withdrawVault(
    IERC4626 vault,
    uint256 assets,
    address receiver,
    address owner,
    uint256 maxShares
  ) internal override returns (uint256 shares) {
    callInput = abi.encode(vault, assets, receiver, owner, maxShares);
    return shares;
  }
}
