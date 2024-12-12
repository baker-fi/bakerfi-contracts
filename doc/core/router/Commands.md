# Solidity API

## Commands

Command Flags used to decode commands

### V3_UNISWAP_SWAP

```solidity
uint8 V3_UNISWAP_SWAP
```

### PULL_TOKEN

```solidity
uint8 PULL_TOKEN
```

### PULL_TOKEN_FROM

```solidity
uint8 PULL_TOKEN_FROM
```

### PUSH_TOKEN

```solidity
uint8 PUSH_TOKEN
```

### PUSH_TOKEN_FROM

```solidity
uint8 PUSH_TOKEN_FROM
```

### SWEEP_TOKENS

```solidity
uint8 SWEEP_TOKENS
```

### WRAP_ETH

```solidity
uint8 WRAP_ETH
```

### UNWRAP_ETH

```solidity
uint8 UNWRAP_ETH
```

### PULL_TOKEN_WITH_PERMIT

```solidity
uint8 PULL_TOKEN_WITH_PERMIT
```

### ERC4626_VAULT_DEPOSIT

```solidity
uint8 ERC4626_VAULT_DEPOSIT
```

### ERC4626_VAULT_MINT

```solidity
uint8 ERC4626_VAULT_MINT
```

### ERC4626_VAULT_REDEEM

```solidity
uint8 ERC4626_VAULT_REDEEM
```

### ERC4626_VAULT_WITHDRAW

```solidity
uint8 ERC4626_VAULT_WITHDRAW
```

### ERC4626_VAULT_CONVERT_TO_SHARES

```solidity
uint8 ERC4626_VAULT_CONVERT_TO_SHARES
```

### ERC4626_VAULT_CONVERT_TO_ASSETS

```solidity
uint8 ERC4626_VAULT_CONVERT_TO_ASSETS
```

### AERODROME_SWAP

```solidity
uint8 AERODROME_SWAP
```

### V2_UNISWAP_SWAP

```solidity
uint8 V2_UNISWAP_SWAP
```

### THIRTY_TWO_BITS_MASK

```solidity
uint32 THIRTY_TWO_BITS_MASK
```

### InvalidMappingIndex

```solidity
error InvalidMappingIndex(uint8 index)
```

### InvalidPosition

```solidity
error InvalidPosition(uint8 position)
```

### INDEX_SLOT_SIZE

```solidity
uint8 INDEX_SLOT_SIZE
```

### CALL_STACK_SIZE

```solidity
uint256 CALL_STACK_SIZE
```

### INDEX_SLOT_MASK

```solidity
uint8 INDEX_SLOT_MASK
```

### pullInputParam

```solidity
function pullInputParam(uint256[] callStack, uint256 value, uint64 inputMapping, uint8 position) internal pure returns (uint256 result)
```

Pull a value from the call stack or the value if the index is 0

_Bit operations:
  1. inputMapping >> (INDEX_SLOT_SIZE * position): Right shifts the inputMapping by position * 8 bits
     to align the desired 8-bit slot to the rightmost position
  2. & INDEX_SLOT_MASK (0xFF): Masks off all bits except the rightmost 8 bits
     to extract just the 8-bit index value we want
  Example:
  If inputMapping = 0x0000000000000321 and position = 1
  1. 0x0000000000000321 >> (8 * 1) = 0x0000000000000003
  2. 0x0000000000000003 & 0xFF = 0x03 (final index value)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| callStack | uint256[] | The call stack |
| value | uint256 | The value to pull |
| inputMapping | uint64 | The input mapping containing 8 slots of 8 bits each |
| position | uint8 | The position to extract from inputMapping (1-8) |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| result | uint256 | The result |

### pushOutputParam

```solidity
function pushOutputParam(uint256[] callStack, uint256 value, uint64 outputMapping, uint8 position) internal pure
```

Push a value to the call stack if the index is not 0

_Bit operations:
  1. outputMapping >> (INDEX_SLOT_SIZE * position): Right shifts the outputMapping by position * 8 bits
     to align the desired 8-bit slot to the rightmost position
  2. & INDEX_SLOT_MASK (0xFF): Masks off all bits except the rightmost 8 bits
     to extract just the 8-bit index value we want
  Example:
  If outputMapping = 0x0000000000000321 and position = 1
  1. 0x0000000000000321 >> (8 * 1) = 0x0000000000000003
  2. 0x0000000000000003 & 0xFF = 0x03 (final index value)_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| callStack | uint256[] | The call stack |
| value | uint256 | The value to push |
| outputMapping | uint64 | The output mapping containing 8 slots of 8 bits each |
| position | uint8 | The position to extract from outputMapping (1-8) |

