// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;
import { StrategyLeverageSettings } from "../core/strategies/StrategyLeverageSettings.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract StrategyLeverageSettingsMock is Initializable, StrategyLeverageSettings {
  function initialize(address initialOwner, address initialGovernor) public initializer {
    _initLeverageSettings(initialOwner, initialGovernor);
  }
}
