// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

struct ApprovalData {
    address asset;
    address delegate;
    uint256 amount;
}

struct TransferData {
    address asset;
    address to;
    uint256 amount;
}

struct InstructionCall {
    bytes32 target;
    bytes callData;
}

struct PullTokenData {
  address asset;
  address from;
  uint256 amount;
}

struct ReturnFundsData {
  address asset;
  uint256 amount;
}

struct WrapEthData {
    uint256 amount;
}

enum FlashloanProvider {
  DssFlash,
  Balancer
}

struct FlashloanData {
  uint256   amount;
  address   asset;
  bool      isProxyFlashloan;
  bool      isDPMProxy;
  FlashloanProvider provider;
  InstructionCall[] calls;
}
