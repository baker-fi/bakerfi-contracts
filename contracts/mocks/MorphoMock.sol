// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {
    IMorpho,
    Authorization,
    Id,
    Signature,
    Market,
    MarketParams,
    Position
} from "@morpho-org/morpho-blue/src/interfaces/IMorpho.sol";

/**
 * @title Morpho Mock used for Unit Testing
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice Morpho Mock used for Unit Testing
 */
contract MorphoMock is IMorpho {

  Market private _singleMarket;

  constructor() {

  }

  function DOMAIN_SEPARATOR() external view override returns (bytes32) {}

  function owner() external view override returns (address) {}

  function feeRecipient() external view override returns (address) {}

  function isIrmEnabled(address irm) external view override returns (bool) {}

  function isLltvEnabled(uint256 lltv) external view override returns (bool) {}

  function isAuthorized(
    address authorizer,
    address authorized
  ) external view override returns (bool) {}

  function nonce(address authorizer) external view override returns (uint256) {}

  function setOwner(address newOwner) external override {}

  function enableIrm(address irm) external override {}

  function enableLltv(uint256 lltv) external override {}

  function setFee(MarketParams memory marketParams, uint256 newFee) external override {}

  function setFeeRecipient(address newFeeRecipient) external override {}

  function createMarket(MarketParams memory marketParams) external override {}

  function supply(
    MarketParams memory marketParams,
    uint256 assets,
    uint256 shares,
    address onBehalf,
    bytes memory data
  ) external override returns (uint256 assetsSupplied, uint256 sharesSupplied) {}

  function withdraw(
    MarketParams memory marketParams,
    uint256 assets,
    uint256 shares,
    address onBehalf,
    address receiver
  ) external override returns (uint256 assetsWithdrawn, uint256 sharesWithdrawn) {}

  function borrow(
    MarketParams memory marketParams,
    uint256 assets,
    uint256 shares,
    address onBehalf,
    address receiver
  ) external override returns (uint256 assetsBorrowed, uint256 sharesBorrowed) {}

  function repay(
    MarketParams memory marketParams,
    uint256 assets,
    uint256 shares,
    address onBehalf,
    bytes memory data
  ) external override returns (uint256 assetsRepaid, uint256 sharesRepaid) {}

  function supplyCollateral(
    MarketParams memory marketParams,
    uint256 assets,
    address onBehalf,
    bytes memory data
  ) external override {}

  function withdrawCollateral(
    MarketParams memory marketParams,
    uint256 assets,
    address onBehalf,
    address receiver
  ) external override {}

  function liquidate(
    MarketParams memory marketParams,
    address borrower,
    uint256 seizedAssets,
    uint256 repaidShares,
    bytes memory data
  ) external override returns (uint256, uint256) {}

  function flashLoan(address token, uint256 assets, bytes calldata data) external override {}

  function setAuthorization(address authorized, bool newIsAuthorized) external override {}

  function setAuthorizationWithSig(
    Authorization calldata authorization,
    Signature calldata signature
  ) external override {}

  function accrueInterest(MarketParams memory marketParams) external override {}

  function extSloads(bytes32[] memory slots) external view override returns (bytes32[] memory) {}

  function position(Id id, address user) external view override returns (Position memory p) {}

  function market(Id id) external view override returns (Market memory m) {}

  function idToMarketParams(Id id) external view override returns (MarketParams memory) {}
}