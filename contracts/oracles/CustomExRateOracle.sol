// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { ExRateOracle } from "./ExRateOracle.sol";
import { IOracle } from "../interfaces/core/IOracle.sol";
import { MathLibrary } from "../libraries/MathLibrary.sol";

/**
 * @title Custom Exchange Rate Oracle to create a price based on Ratio available on a on-chain contract
 * function. This oracle allows more price stability when the ration changes slowly
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice This contract provide safe and unsafe price retrieval functions
 */
contract CustomExRateOracle is ExRateOracle {
  struct Call {
    address target;
    bytes callData;
  }

  Call private _call;
  uint8 private immutable _resultDecimals;

  using MathLibrary for uint256;

  constructor(IOracle baseOracle, Call memory call, uint8 resultDecimals) ExRateOracle(baseOracle) {
    _call.target = call.target;
    _resultDecimals = resultDecimals;
    _call.callData = call.callData;
  }

  /**
   *
   * Get a Ratio from the External oracle
   *
   * @dev This method is not part of the IOracle interface but it could be usefull
   * to show prices on the frontend
   *
   * Example: Could be used to get stETH-WSETH conversion rate from Lido Contracts
   *
   * */
  function getRatio() public view virtual override returns (IOracle.Price memory ratio) {
    (bool success, bytes memory result) = _call.target.staticcall(_call.callData);

    if (!success) revert InvalidPriceFromOracle();

    uint256 price = abi.decode(result, (uint256));

    ratio.price = price.toDecimals(_resultDecimals, _DECIMALS);

    ratio.lastUpdate = 0;
  }
}
