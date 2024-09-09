// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { IProtocolFeesCollector } from "./IProtocolFeesCollector.sol";
import { IFlashLoans } from "./IFlashLoan.sol";

interface IVault is IFlashLoans {
  function getProtocolFeesCollector() external view returns (IProtocolFeesCollector);
}
