// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { IProtocolFeesCollector } from "./IProtocolFeesCollector.sol";
import { IFlashLoans } from "./IFlashLoan.sol";

interface IVault is IFlashLoans {
  enum SwapKind {
    GIVEN_IN,
    GIVEN_OUT
  }

  struct SingleSwap {
    bytes32 poolId;
    SwapKind kind;
    address assetIn;
    address assetOut;
    uint256 amount;
    bytes userData;
  }

  struct FundManagement {
    address sender;
    bool fromInternalBalance;
    address payable recipient;
    bool toInternalBalance;
  }

  function swap(
    SingleSwap memory singleSwap,
    FundManagement memory funds,
    uint256 limit,
    uint256 deadline
  ) external payable returns (uint256);

  function querySwap(
    SingleSwap memory singleSwap,
    FundManagement memory funds
  ) external view returns (uint256);

  function getProtocolFeesCollector() external view returns (IProtocolFeesCollector);
}
