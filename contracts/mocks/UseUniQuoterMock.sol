// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
import { UseUniQuoter } from "../core/hooks/UseUniQuoter.sol";
import { ServiceRegistry } from "../core/ServiceRegistry.sol";

contract UseUniQuoterMock is UseUniQuoter {
  function initialize(ServiceRegistry registry) public initializer {
    _initUseUniQuoter(registry);
  }
}
