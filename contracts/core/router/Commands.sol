// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.24;

/// @title Commands
/// @notice Command Flags used to decode commands
library Commands {
  // General Commands
  // Command identifiers for various actions within the protocol.

  // Uniswap V3 Swap Command
  uint8 public constant V3_UNISWAP_SWAP = 0x01; // Command to execute a swap on Uniswap V3.

  // Token Management Commands
  uint8 public constant PULL_TOKEN = 0x02; // Command to pull a specified token.
  uint8 public constant PULL_TOKEN_FROM = 0x03; // Command to pull a token from a specified address.
  uint8 public constant PUSH_TOKEN = 0x04; // Command to push a specified token.
  uint8 public constant PUSH_TOKEN_FROM = 0x05; // Command to push a token from a specified address.
  uint8 public constant SWEEP_TOKENS = 0x06; // Command to sweep tokens from the contract.
  uint8 public constant WRAP_ETH = 0x07; // Command to wrap ETH into WETH.
  uint8 public constant UNWRAP_ETH = 0x08; // Command to unwrap WETH back into ETH.
  uint8 public constant SEND_NATIVE = 0x0A; // Command to send native tokens to a specified address.
  uint8 public constant SWEEP_NATIVE = 0x0B; // Command to sweep native asset the contract.

  // ERC4626 Vault Commands
  uint8 public constant ERC4626_VAULT_DEPOSIT = 0x10; // Command to deposit assets into an ERC4626 vault.
  uint8 public constant ERC4626_VAULT_MINT = 0x11; // Command to mint shares in an ERC4626 vault.
  uint8 public constant ERC4626_VAULT_REDEEM = 0x12; // Command to redeem shares from an ERC4626 vault.
  uint8 public constant ERC4626_VAULT_WITHDRAW = 0x13; // Command to withdraw assets from an ERC4626 vault.
  uint8 public constant ERC4626_VAULT_CONVERT_TO_SHARES = 0x14; // Command to convert assets to shares in an ERC4626 vault.
  uint8 public constant ERC4626_VAULT_CONVERT_TO_ASSETS = 0x15; // Command to convert shares to assets in an ERC4626 vault.

  uint8 public constant AERODROME_SWAP = 0x20; // Command to execute a swap on Aerodrome.
  uint8 public constant V2_UNISWAP_SWAP = 0x21; // Command to execute a swap on Aerodrome.

  // Constant for a 32-bit mask used in bitwise operations.
  uint32 public constant THIRTY_TWO_BITS_MASK = 0xFFFFFFFF; // Mask to extract 32 bits.

  // Errors
  error InvalidMappingIndex(uint8 index);

  error InvalidPosition(uint8 position);
  // 8 bits
  uint8 constant INDEX_SLOT_SIZE = 8;
  // Statically define the call stack size
  uint256 constant CALL_STACK_SIZE = 8;
  // Slot Mask
  uint8 constant INDEX_SLOT_MASK = 0xFF;

  /**
   * @notice Pull a value from the call stack or the value if the index is 0
   * @param callStack The call stack
   * @param value The value to pull
   * @param inputMapping The input mapping containing 8 slots of 8 bits each
   * @param position The position to extract from inputMapping (1-8)
   * @return result The result
   * @dev Bit operations:
   *   1. inputMapping >> (INDEX_SLOT_SIZE * position): Right shifts the inputMapping by position * 8 bits
   *      to align the desired 8-bit slot to the rightmost position
   *   2. & INDEX_SLOT_MASK (0xFF): Masks off all bits except the rightmost 8 bits
   *      to extract just the 8-bit index value we want
   *   Example:
   *   If inputMapping = 0x0000000000000321 and position = 1
   *   1. 0x0000000000000321 >> (8 * 1) = 0x0000000000000003
   *   2. 0x0000000000000003 & 0xFF = 0x03 (final index value)
   */
  function pullInputParam(
    uint256[] memory callStack,
    uint256 value,
    uint64 inputMapping,
    uint8 position
  ) internal pure returns (uint256 result) {
    if (position > CALL_STACK_SIZE) {
      revert InvalidPosition({ position: position });
    }
    uint8 inputIndex = uint8(
      ((inputMapping >> (INDEX_SLOT_SIZE * (position - 1))) & INDEX_SLOT_MASK)
    );
    if (inputIndex > CALL_STACK_SIZE) {
      revert InvalidMappingIndex({ index: inputIndex });
    }
    result = inputIndex > 0 ? callStack[inputIndex - 1] : value;
  }

  /**
   * @notice Push a value to the call stack if the index is not 0
   * @param callStack The call stack
   * @param value The value to push
   * @param outputMapping The output mapping containing 8 slots of 8 bits each
   * @param position The position to extract from outputMapping (1-8)
   * @dev Bit operations:
   *   1. outputMapping >> (INDEX_SLOT_SIZE * position): Right shifts the outputMapping by position * 8 bits
   *      to align the desired 8-bit slot to the rightmost position
   *   2. & INDEX_SLOT_MASK (0xFF): Masks off all bits except the rightmost 8 bits
   *      to extract just the 8-bit index value we want
   *   Example:
   *   If outputMapping = 0x0000000000000321 and position = 1
   *   1. 0x0000000000000321 >> (8 * 1) = 0x0000000000000003
   *   2. 0x0000000000000003 & 0xFF = 0x03 (final index value)
   */
  function pushOutputParam(
    uint256[] memory callStack,
    uint256 value,
    uint64 outputMapping,
    uint8 position
  ) internal pure {
    if (position > CALL_STACK_SIZE) {
      revert InvalidPosition({ position: position });
    }
    uint8 outputIndex = uint8(
      ((outputMapping >> (INDEX_SLOT_SIZE * (position - 1))) & INDEX_SLOT_MASK)
    );
    if (outputIndex > CALL_STACK_SIZE) {
      revert InvalidMappingIndex({ index: outputIndex });
    }
    if (outputIndex > 0) {
      callStack[outputIndex - 1] = value;
    }
  }
}
