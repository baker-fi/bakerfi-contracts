// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { StrategyLeverage } from "../core/strategies/StrategyLeverage.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { IOracle } from "../interfaces/core/IOracle.sol";

contract StrategyLeverageMock is Initializable, StrategyLeverage {
  uint256 private _supplyed = 0;
  uint256 private _borrowed = 0;

  function initialize(
    address initialOwner,
    address initialGovernor,
    address collateralToken,
    address debtToken,
    address oracle,
    address flashLender
  ) public initializer {
    _initializeStrategyLeverage(
      initialOwner,
      initialGovernor,
      collateralToken,
      debtToken,
      oracle,
      flashLender
    );
  }

  function getBalances()
    public
    view
    virtual
    override
    returns (uint256 collateralBalance, uint256 debtBalance)
  {
    collateralBalance = _supplyed;
    debtBalance = _borrowed;
  }

  function _supply(uint256 amountIn) internal virtual override {
    _supplyed += amountIn;
  }

  function _supplyAndBorrow(uint256 collateral, uint256 debt) internal virtual override {
    _supply(collateral);
    _borrowed += debt;
  }

  function _repay(uint256 amount) internal virtual override {
    _borrowed -= amount;
  }

  function _withdraw(uint256 amount, address) internal virtual override {
    _supplyed -= amount;
  }

  function _convertToCollateral(uint256 amount) internal virtual override returns (uint256) {
    uint256 collateralAmount = _toCollateral(
      IOracle.PriceOptions({ maxAge: 0, maxConf: 0 }),
      amount,
      false
    );

    return collateralAmount;
  }

  function _convertToDebt(uint256 amount) internal virtual override returns (uint256) {
    return _toDebt(IOracle.PriceOptions({ maxAge: 0, maxConf: 0 }), amount, false);
  }
}
