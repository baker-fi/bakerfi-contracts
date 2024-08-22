// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IMorpho, Authorization, Id, Signature, Market, MarketParams, Position } from "@morpho-org/morpho-blue/src/interfaces/IMorpho.sol";

/**
 * @title Morpho Mock used for Unit Testing
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice Morpho Mock used for Unit Testing
 */
contract MorphoMock is IMorpho {
  struct UserInfo {
    uint256 depositAmount;
    uint256 borrowedAmount;
  }

  IERC20 public _collateralToken;
  IERC20 private _borrowedToken;

  Market private _singleMarket;
  address private immutable _owner;

  uint256 private _collateralBalance;
  uint256 private _debtBalance;

  uint256 private _collateralPerUSD = 3042 * (1e18);
  uint256 private _borrowedPerUSD = 2600 * (1e18);

  mapping(address => UserInfo) public _users;

  constructor(IERC20 collateralToken, IERC20 borrowedToken) {
    _owner = msg.sender;
    _collateralToken = collateralToken;
    _borrowedToken = borrowedToken;
  }

  function DOMAIN_SEPARATOR() external view override returns (bytes32) {}

  function owner() external view override returns (address) {
    return _owner;
  }

  function feeRecipient() external view override returns (address) {}

  function isIrmEnabled(address irm) external view override returns (bool) {}

  function isLltvEnabled(uint256 lltv) external view override returns (bool) {}

  function isAuthorized(
    address authorizer,
    address authorized
  ) external view override returns (bool) {}

  function nonce(address authorizer) external view override returns (uint256) {}

  function setOwner(address) external pure override {
    revert();
  }

  function enableIrm(address irm) external override {}

  function enableLltv(uint256 lltv) external override {}

  function setFee(MarketParams memory marketParams, uint256 newFee) external override {}

  function setFeeRecipient(address newFeeRecipient) external override {}

  function createMarket(MarketParams memory marketParams) external override {}

  function supply(
    MarketParams memory,
    uint256 assets,
    uint256,
    address onBehalf,
    bytes memory
  ) external override returns (uint256 assetsSupplied, uint256 sharesSupplied) {
    _collateralToken.transferFrom(msg.sender, address(this), assets);
    _collateralBalance += assetsSupplied;
    _users[onBehalf].depositAmount += assets;
  }

  function withdraw(
    MarketParams memory,
    uint256 assets,
    uint256 shares,
    address onBehalf,
    address receiver
  ) external override returns (uint256 assetsWithdrawn, uint256 sharesWithdrawn) {
    (assetsWithdrawn, sharesWithdrawn) = _withdrawInternal(assets, shares, onBehalf, receiver);
  }

  function _withdrawInternal(
    uint256 assets,
    uint256 shares,
    address onBehalf,
    address receiver
  ) internal returns (uint256 assetsWithdrawn, uint256 sharesWithdrawn) {
    uint256 collateralInUSD = (_users[msg.sender].depositAmount * _collateralPerUSD) / 1e18;
    uint256 debtInUSD = (_users[msg.sender].borrowedAmount * _borrowedPerUSD) / 1e18;
    uint256 assetsToUSD = (assets * _collateralPerUSD) / 1e18;

    require((collateralInUSD - debtInUSD) > assetsToUSD, "No Balance");

    (_collateralToken).transfer(receiver, assets);
    _users[msg.sender].depositAmount -= assets;
    assetsWithdrawn = assets;
    sharesWithdrawn = assets;
  }

  function borrow(
    MarketParams memory marketParams,
    uint256 assets,
    uint256 shares,
    address onBehalf,
    address receiver
  ) external override returns (uint256 assetsBorrowed, uint256 sharesBorrowed) {
    uint256 collateralInUSD = (_users[msg.sender].depositAmount * _collateralPerUSD) / 1e18;
    uint256 debtInUSD = (_users[msg.sender].borrowedAmount * _borrowedPerUSD) / 1e18;

    require((collateralInUSD - debtInUSD) > assets, "No Balance");

    (_borrowedToken).transfer(receiver, assets);
    _users[msg.sender].borrowedAmount += assets;
  }

  function repay(
    MarketParams memory marketParams,
    uint256 assets,
    uint256 shares,
    address onBehalf,
    bytes memory data
  ) external override returns (uint256 assetsRepaid, uint256 sharesRepaid) {
    _borrowedToken.transferFrom(msg.sender, address(this), assets);
    _users[msg.sender].borrowedAmount -= assets;
    assetsRepaid = assets;
    sharesRepaid = sharesRepaid;
  }

  function supplyCollateral(
    MarketParams memory,
    uint256 assets,
    address onBehalf,
    bytes memory
  ) external override {
    _collateralToken.transferFrom(msg.sender, address(this), assets);
    _collateralBalance += assets;
    _users[onBehalf].depositAmount += assets;
  }

  function withdrawCollateral(
    MarketParams memory,
    uint256 assets,
    address onBehalf,
    address receiver
  ) external override {
    _withdrawInternal(assets, 0, onBehalf, receiver);
  }

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
