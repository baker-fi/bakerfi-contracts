// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity ^0.8.18;

struct ApprovalData {
  address erc20Address;
  address delegate;
  uint256 amount;
}

struct TransferData {
  address erc20Address;
  address to;
  uint256 amount;
}