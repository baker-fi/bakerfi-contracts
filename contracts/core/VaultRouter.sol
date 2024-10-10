// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { Ownable2StepUpgradeable } from "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";

import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { UseSwapper } from "./hooks/UseSwapper.sol";
import { IV3SwapRouter } from "../interfaces/uniswap/v3/IV3SwapRouter.sol";
import { IQuoterV2 } from "../interfaces/uniswap/v3/IQuoterV2.sol";
import { UseMulticall } from "./hooks/UseMulticall.sol";
import { UseWETH } from "./hooks/UseWETH.sol";
import { UseIERC4626 } from "./hooks/UseIERC4626.sol";
import { IWETH } from "../interfaces/tokens/IWETH.sol";
import { ISwapHandler } from "../interfaces/core/ISwapHandler.sol";
import { UseTokenActions } from "./hooks/UseTokenActions.sol";
/**
 * @title Vault Router inspired by Uniswap V3 Router
 *
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-EL <chef.kal-el@bakerfi.xyz>
 *
 * @notice This contract provides a router for vaults that allows for
 *   swapping between assets using Uniswap V3, migrate liquidity between
 *   protocols and deposit/withdraw from ERC4626 vaults.
 *
 * It also allows for multicall to execute multiple actions in a single call.
 *
 * Supports :
 * - Uniswap V3 exact input and exact output swaps.
 * - Wrapping and unwrapping WETH.
 * - Token transfers.
 * - ERC4626 vaults operations
 */
contract VaultRouter is UseSwapper, UseTokenActions, UseIERC4626, UseWETH, UseMulticall, Ownable2StepUpgradeable {

  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  function initialize(address initialOwner, IV3SwapRouter router, IWETH weth) public initializer {
    __Ownable2Step_init();
    _transferOwnership(initialOwner);
    _initUseSwapper(router);
    _initUseWETH(address(weth));
  }

  function swap(
    ISwapHandler.SwapParams memory params
  ) external returns (uint256 amountIn, uint256 amountOut) {
    (amountIn, amountOut) = _swap(params);
  }

  function approveSpender(IERC20 token, address spender, uint256 amount) external onlyOwner(){
    token.approve(spender, amount);
  }
}
