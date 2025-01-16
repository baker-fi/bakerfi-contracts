// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { IERC4626 } from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { UseWETH } from "./hooks/UseWETH.sol";
import { UseIERC4626 } from "./hooks/UseIERC4626.sol";
import { UseUnifiedSwapper } from "./hooks/swappers/UseUnifiedSwapper.sol";
import { IWETH } from "../interfaces/tokens/IWETH.sol";
import { ISwapHandler } from "../interfaces/core/ISwapHandler.sol";
import { UseTokenActions } from "./hooks/UseTokenActions.sol";
import { Commands } from "./router/Commands.sol";
import { MultiCommand } from "./MultiCommand.sol";
import { IERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Permit.sol";

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
contract VaultRouter is UseUnifiedSwapper, UseTokenActions, UseIERC4626, UseWETH, MultiCommand {
  error NotAuthorized();
  /// @custom:oz-upgrades-unsafe-allow constructor
  constructor() {
    _disableInitializers();
  }

  /**
   * @notice Initializes the contract.
   * @param initialOwner The address of the owner.
   * @param weth The Chain WETH address
   */
  function initialize(address initialOwner, IWETH weth) public initializer {
    initializeUseIERC4626(initialOwner);
    _initUseWETH(address(weth));
  }

  /**
   * @notice Dispatches a single command for execution.
   * @param action The command to be dispatched.
   * @param data The command to be dispatched.
   * @return success A boolean indicating if the command was executed successfully.
   * @return output The output data from the command execution.
   *
   * Action is a 256-bit value where:
   * The lower 32 bits represent the action to execute (actionToExecute).
   *   - The next 32 bits (bits 32-63) represent the input mapping (inputMapping).
   *     Each 8 bits in this range maps to an input parameter position.
   *
   *     Example: bits 32-33 represent the index of the first input parameter
   *
   *   - The next 32 bits (bits 64-95) represent the output mapping (outputMapping).
   *     Each 8 bits in this range maps to an output parameter position.
   *   - The remaining bits (96-255) are reserved for future use.
   *
   * The action parameter encodes multiple pieces of information in a compact format:
   * - The action ID determines which operation to perform
   * - Input/output mappings allow flexible parameter passing between commands
   * - Each 8-bit segment in the mappings corresponds to a parameter index
   *
   */
  function dispatch(
    uint256 action,
    bytes calldata data,
    uint256[] memory callStack
  ) internal override returns (bool success, bytes memory output) {
    success = true;

    // Extract the action ID from the lowest 32 bits using bitwise AND with mask
    uint32 actionToExecute = uint32(action & Commands.THIRTY_TWO_BITS_MASK);

    // Extract input mapping from bits 32-63 by right shifting 32 bits and masking
    uint32 inputMapping = uint16((action >> 32) & Commands.THIRTY_TWO_BITS_MASK);

    // Extract output mapping from bits 64-95 by right shifting 64 bits and masking
    uint32 outputMapping = uint16(((action >> 64) & Commands.THIRTY_TWO_BITS_MASK));

    if (
      actionToExecute == Commands.V3_UNISWAP_SWAP ||
      actionToExecute == Commands.AERODROME_SWAP ||
      actionToExecute == Commands.V2_UNISWAP_SWAP
    ) {
      output = _handleSwap(data, callStack, inputMapping, outputMapping);
    } else if (actionToExecute == Commands.PULL_TOKEN) {
      output = _handlePullToken(data, callStack, inputMapping);
    } else if (actionToExecute == Commands.PULL_TOKEN_FROM) {
      output = _handlePullTokenFrom(data, callStack, inputMapping);
    } else if (actionToExecute == Commands.PUSH_TOKEN) {
      output = _handlePushToken(data, callStack, inputMapping);
    } else if (actionToExecute == Commands.PUSH_TOKEN_FROM) {
      output = _handlePushTokenFrom(data, callStack, inputMapping);
    } else if (actionToExecute == Commands.SWEEP_TOKENS) {
      output = _handleSweepTokens(data, callStack, outputMapping);
    } else if (actionToExecute == Commands.SWEEP_NATIVE) {
      output = _handleSweepNative(data, callStack, outputMapping);
    } else if (actionToExecute == Commands.WRAP_ETH) {
      output = _handleWrapETH(data, callStack, inputMapping);
    } else if (actionToExecute == Commands.UNWRAP_ETH) {
      output = _handleUnwrapETH(data, callStack, inputMapping);
    } else if (actionToExecute == Commands.ERC4626_VAULT_DEPOSIT) {
      output = _handleVaultDeposit(data, callStack, inputMapping, outputMapping);
    } else if (actionToExecute == Commands.ERC4626_VAULT_MINT) {
      output = _handleVaultMint(data, callStack, inputMapping, outputMapping);
    } else if (actionToExecute == Commands.ERC4626_VAULT_REDEEM) {
      output = _handleVaultRedeem(data, callStack, inputMapping, outputMapping);
    } else if (actionToExecute == Commands.ERC4626_VAULT_WITHDRAW) {
      output = _handleVaultWithdraw(data, callStack, inputMapping, outputMapping);
    } else if (actionToExecute == Commands.ERC4626_VAULT_CONVERT_TO_SHARES) {
      output = _handleVaultConvertToShares(data, callStack, inputMapping, outputMapping);
    } else if (actionToExecute == Commands.ERC4626_VAULT_CONVERT_TO_ASSETS) {
      output = _handleVaultConvertToAssets(data, callStack, inputMapping, outputMapping);
    } else {
      revert InvalidCommand({ action: action });
    }
  }

  /**
   * @notice Handles the Uniswap V3 swap command.
   * @param data The encoded swap parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @param outputMapping The output mapping.
   * @return output The encoded output values.
   */
  function _handleSwap(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping,
    uint32 outputMapping
  ) private returns (bytes memory) {
    ISwapHandler.SwapParams memory params = abi.decode(data, (ISwapHandler.SwapParams));
    params.amountIn = Commands.pullInputParam(callStack, params.amountIn, inputMapping, 1);
    params.amountOut = Commands.pullInputParam(callStack, params.amountOut, inputMapping, 2);

    (uint256 amountIn, uint256 amountOut) = swap(params);

    Commands.pushOutputParam(callStack, amountIn, outputMapping, 1);
    Commands.pushOutputParam(callStack, amountOut, outputMapping, 2);

    return abi.encodePacked(amountIn, amountOut);
  }
  /**
   * @notice Handles the pull token command.
   * @param data The encoded pull token parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @return output The encoded output values.
   */
  function _handlePullToken(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping
  ) private returns (bytes memory) {
    IERC20 token;
    uint256 amount;
    assembly {
      token := calldataload(data.offset)
      amount := calldataload(add(data.offset, 0x20))
    }
    amount = Commands.pullInputParam(callStack, amount, inputMapping, 1);
    pullToken(token, amount);
    return "";
  }
  /**
   * @notice Handles the pull token from command.
   * @param data The encoded pull token from parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @return output The encoded output values.
   */
  function _handlePullTokenFrom(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping
  ) private returns (bytes memory) {
    IERC20 token;
    address from;
    uint256 amount;
    assembly {
      token := calldataload(data.offset)
      from := calldataload(add(data.offset, 0x20))
      amount := calldataload(add(data.offset, 0x40))
    }
    if (from != msg.sender) revert NotAuthorized();

    amount = Commands.pullInputParam(callStack, amount, inputMapping, 1);
    pullTokenFrom(token, from, amount);
    return "";
  }
  /**
   * @notice Handles the push token command.
   * @param data The encoded push token parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @return output The encoded output values.
   */
  function _handlePushToken(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping
  ) private returns (bytes memory) {
    IERC20 token;
    address to;
    uint256 amount;
    assembly {
      token := calldataload(data.offset)
      to := calldataload(add(data.offset, 0x20))
      amount := calldataload(add(data.offset, 0x40))
    }
    amount = Commands.pullInputParam(callStack, amount, inputMapping, 1);
    pushToken(token, to, amount);
    return "";
  }
  /**
   * @notice Handles the push token from command.
   * @param data The encoded push token from parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @return output The encoded output values.
   */
  function _handlePushTokenFrom(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping
  ) private returns (bytes memory) {
    IERC20 token;
    address from;
    address to;
    uint256 amount;
    assembly {
      token := calldataload(data.offset)
      from := calldataload(add(data.offset, 0x20))
      to := calldataload(add(data.offset, 0x40))
      amount := calldataload(add(data.offset, 0x60))
    }
    if (from != msg.sender) revert NotAuthorized();

    amount = Commands.pullInputParam(callStack, amount, inputMapping, 1);
    pushTokenFrom(token, from, to, amount);
    return "";
  }
  /**
   * @notice Handles the sweep tokens command.
   * @param data The encoded sweep tokens parameters.
   * @param callStack The call stack.
   * @param outputMapping The output mapping.
   * @return output The encoded output values.
   */
  function _handleSweepTokens(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 outputMapping
  ) private returns (bytes memory) {
    IERC20 token;
    address to;
    assembly {
      token := calldataload(data.offset)
      to := calldataload(add(data.offset, 0x20))
    }
    uint256 sweptAmount = sweepTokens(token, to);
    Commands.pushOutputParam(callStack, sweptAmount, outputMapping, 1);
    return abi.encodePacked(sweptAmount);
  }

  /**
   * @notice Handles the sweep tokens command.
   * @param data The encoded sweep tokens parameters.
   * @param callStack The call stack.
   * @param outputMapping The output mapping.
   * @return output The encoded output values.
   */
  function _handleSweepNative(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 outputMapping
  ) private returns (bytes memory) {
    address to;
    assembly {
      to := calldataload(data.offset)
    }
    uint256 sweptAmount = sweepNative(to);
    Commands.pushOutputParam(callStack, sweptAmount, outputMapping, 1);
    return abi.encodePacked(sweptAmount);
  }

  /**
   * @notice Handles the wrap ETH command.
   * @param data The encoded wrap ETH parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @return output The encoded output values.
   */
  function _handleWrapETH(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping
  ) private returns (bytes memory) {
    uint256 amount;
    assembly {
      amount := calldataload(data.offset)
    }
    amount = Commands.pullInputParam(callStack, amount, inputMapping, 1);
    wrapETH(amount);
    return "";
  }
  /**
   * @notice Handles the unwrap ETH command.
   * @param data The encoded unwrap ETH parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @return output The encoded output values.
   */
  function _handleUnwrapETH(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping
  ) private returns (bytes memory) {
    uint256 amount;
    assembly {
      amount := calldataload(data.offset)
    }
    amount = Commands.pullInputParam(callStack, amount, inputMapping, 1);
    unwrapETH(amount);
    return "";
  }

  /**
   * @notice Handles the deposit to vault command.
   * @param data The encoded deposit to vault parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @param outputMapping The output mapping.
   * @return output The encoded output values.
   */
  function _handleVaultDeposit(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping,
    uint32 outputMapping
  ) private returns (bytes memory) {
    IERC4626 vault;
    uint256 assets;
    address receiver;
    uint256 minShares;
    assembly {
      vault := calldataload(data.offset)
      assets := calldataload(add(data.offset, 0x20))
      receiver := calldataload(add(data.offset, 0x40))
      minShares := calldataload(add(data.offset, 0x60))
    }
    assets = Commands.pullInputParam(callStack, assets, inputMapping, 1);
    uint256 shares = depositVault(vault, assets, receiver, minShares);
    Commands.pushOutputParam(callStack, shares, outputMapping, 1);
    return abi.encodePacked(shares);
  }
  /**
   * @notice Handles the mint to vault command.
   * @param data The encoded mint to vault parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @param outputMapping The output mapping.
   * @return output The encoded output values.
   */
  function _handleVaultMint(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping,
    uint32 outputMapping
  ) private returns (bytes memory) {
    IERC4626 vault;
    uint256 shares;
    address receiver;
    uint256 maxAssets;
    assembly {
      vault := calldataload(data.offset)
      shares := calldataload(add(data.offset, 0x20))
      receiver := calldataload(add(data.offset, 0x40))
      maxAssets := calldataload(add(data.offset, 0x60))
    }
    shares = Commands.pullInputParam(callStack, shares, inputMapping, 1);
    uint256 assets = mintVault(vault, shares, receiver, maxAssets);
    Commands.pushOutputParam(callStack, assets, outputMapping, 1);
    return abi.encodePacked(assets);
  }
  /**
   * @notice Handles the redeem from vault command.
   * @param data The encoded redeem from vault parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @param outputMapping The output mapping.
   * @return output The encoded output values.
   */
  function _handleVaultRedeem(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping,
    uint32 outputMapping
  ) private returns (bytes memory) {
    IERC4626 vault;
    uint256 shares;
    address receiver;
    address owner = msg.sender;
    uint256 minAssets;
    assembly {
      vault := calldataload(data.offset)
      shares := calldataload(add(data.offset, 0x20))
      receiver := calldataload(add(data.offset, 0x40))
      minAssets := calldataload(add(data.offset, 0x60))
    }
    shares = Commands.pullInputParam(callStack, shares, inputMapping, 1);
    uint256 assets = redeemVault(vault, shares, receiver, owner, minAssets);
    Commands.pushOutputParam(callStack, assets, outputMapping, 1);
    return abi.encodePacked(assets);
  }
  /**
   * @notice Handles the withdraw from vault command.
   * @param data The encoded withdraw from vault parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @param outputMapping The output mapping.
   * @return output The encoded output values.
   */
  function _handleVaultWithdraw(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping,
    uint32 outputMapping
  ) private returns (bytes memory) {
    IERC4626 vault;
    uint256 assets;
    address receiver;
    address owner = msg.sender;
    uint256 maxShares;
    assembly {
      vault := calldataload(data.offset)
      assets := calldataload(add(data.offset, 0x20))
      receiver := calldataload(add(data.offset, 0x40))
      maxShares := calldataload(add(data.offset, 0x60))
    }
    assets = Commands.pullInputParam(callStack, assets, inputMapping, 1);
    uint256 shares = withdrawVault(vault, assets, receiver, owner, maxShares);
    Commands.pushOutputParam(callStack, shares, outputMapping, 1);
    return abi.encodePacked(shares);
  }
  /**
   * @notice Handles the convert to shares command.
   * @param data The encoded convert to shares parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @param outputMapping The output mapping.
   * @return output The encoded output values.
   */
  function _handleVaultConvertToShares(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping,
    uint32 outputMapping
  ) private view returns (bytes memory) {
    IERC4626 vault;
    uint256 assets;
    assembly {
      vault := calldataload(data.offset)
      assets := calldataload(add(data.offset, 0x20))
    }
    assets = Commands.pullInputParam(callStack, assets, inputMapping, 1);
    uint256 amount = convertToVaultShares(vault, assets);
    Commands.pushOutputParam(callStack, amount, outputMapping, 1);
    return abi.encodePacked(amount);
  }
  /**
   * @notice Handles the convert to assets command.
   * @param data The encoded convert to assets parameters.
   * @param callStack The call stack.
   * @param inputMapping The input mapping.
   * @param outputMapping The output mapping.
   * @return output The encoded output values.
   */
  function _handleVaultConvertToAssets(
    bytes calldata data,
    uint256[] memory callStack,
    uint32 inputMapping,
    uint32 outputMapping
  ) private view returns (bytes memory) {
    IERC4626 vault;
    uint256 shares;
    assembly {
      vault := calldataload(data.offset)
      shares := calldataload(add(data.offset, 0x20))
    }
    shares = Commands.pullInputParam(callStack, shares, inputMapping, 1);
    uint256 amount = convertToVaultAssets(vault, shares);
    Commands.pushOutputParam(callStack, amount, outputMapping, 1);
    return abi.encodePacked(amount);
  }

  /**
   * @dev This empty reserved space is put in place to allow future versions to add new
   * variables without shifting down storage in the inheritance chain.
   */
  uint256[50] private __gap;
}
