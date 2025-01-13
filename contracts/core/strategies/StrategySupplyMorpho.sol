// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { StrategySupplyBase } from "./StrategySupplyBase.sol";
import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { MathLibrary } from "../../libraries/MathLibrary.sol";
import { IMorpho, MarketParams, Id } from "@morpho-org/morpho-blue/src/interfaces/IMorpho.sol";
import { MarketParamsLib } from "@morpho-org/morpho-blue/src/libraries/MarketParamsLib.sol";
import { MorphoLib } from "@morpho-org/morpho-blue/src/libraries/periphery/MorphoLib.sol";
import { MorphoBalancesLib } from "@morpho-org/morpho-blue/src/libraries/periphery/MorphoBalancesLib.sol";
import { SharesMathLib } from "@morpho-org/morpho-blue/src/libraries/SharesMathLib.sol";
/**
 * @title Strategy Supply Morpho 🅿️
 *
 * @author Chef Nil <duarte@bakerfi.xyz>
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 *
 * @notice A simple strategy that can deploy or undeploy assets to Morpho
 */
contract StrategySupplyMorpho is StrategySupplyBase {
  using SafeERC20 for ERC20;
  using SharesMathLib for uint256;
  using MarketParamsLib for MarketParams;
  using MorphoLib for IMorpho;
  using MorphoBalancesLib for IMorpho;

  error FailedToApproveAllowanceForMorpho();
  error InvalidMorphoBlueContract();
  error InvalidAsset();

  MarketParams private _marketParams; // Parameters related to the market for the strategy.
  /// @notice Instance of the Morpho protocol interface.
  IMorpho private immutable _morpho;

  /// @param initialOwner The address of the initial owner of the contract.
  /// @param asset_ The address of the asset to be managed.
  /// @param morphoBlue The address of the Morpho protocol contract.
  /// @param morphoMarketId The market ID for the Morpho market.
  /// @dev Reverts if the morphoBlue address is zero or if the Morpho contract is invalid.
  constructor(
    address initialOwner,
    address asset_,
    address morphoBlue,
    Id morphoMarketId
  ) StrategySupplyBase(initialOwner, asset_) {
    if (morphoBlue == address(0)) revert ZeroAddress();

    _morpho = IMorpho(morphoBlue);

    if (address(_morpho) == address(0)) revert InvalidMorphoBlueContract();

    _marketParams = _morpho.idToMarketParams(morphoMarketId);

    if (_marketParams.loanToken != asset_) revert InvalidAsset();

    // Allowance approval
    if (!ERC20(asset_).approve(morphoBlue, type(uint256).max)) {
      revert FailedToApproveAllowanceForMorpho();
    }
  }

  /// @notice Deploys a specified amount of the managed asset to the Morpho protocol.
  /// @param amount The amount of the asset to be deployed.
  /// @return deployedAmount The amount of the asset that was successfully deployed.
  function _deploy(uint256 amount) internal override returns (uint256) {
    (uint256 deployedAmount, ) = _morpho.supply(_marketParams, amount, 0, address(this), hex"");
    return deployedAmount;
  }

  /// @notice Undeploys a specified amount of the managed asset from the Morpho protocol.
  /// @param amount The amount of the asset to be undeployed.
  /// @return withdrawalValue The amount of the asset that was successfully undeployed.
  function _undeploy(uint256 amount) internal override returns (uint256) {
    Id id = _marketParams.id();
    uint256 assetsWithdrawn = 0;
    uint256 shares = _morpho.supplyShares(id, address(this));
    uint256 assetsMax = _morpho.expectedSupplyAssets(_marketParams, address(this));

    if (amount >= assetsMax) {
      (assetsWithdrawn, ) = _morpho.withdraw(
        _marketParams,
        0,
        shares,
        address(this),
        address(this)
      );
    } else {
      (assetsWithdrawn, ) = _morpho.withdraw(
        _marketParams,
        amount,
        0,
        address(this),
        address(this)
      );
    }

    return assetsWithdrawn;
  }

  /// @notice Retrieves the current balance of the managed asset in the Morpho protocol.
  /// @return The current balance of the managed asset.
  function _getBalance() internal view override returns (uint256) {
    return _morpho.expectedSupplyAssets(_marketParams, address(this));
  }
}
