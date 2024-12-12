# Solidity API

## VaultRouter

This contract provides a router for vaults that allows for
  swapping between assets using Uniswap V3, migrate liquidity between
  protocols and deposit/withdraw from ERC4626 vaults.

It also allows for multicall to execute multiple actions in a single call.

Supports :
- Uniswap V3 exact input and exact output swaps.
- Wrapping and unwrapping WETH.
- Token transfers.
- ERC4626 vaults operations

### constructor

```solidity
constructor() public
```

### initialize

```solidity
function initialize(address initialOwner, contract IWETH weth) public
```

Initializes the contract.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the owner. |
| weth | contract IWETH | The Chain WETH address |

### dispatch

```solidity
function dispatch(uint256 action, bytes data, uint256[] callStack) internal returns (bool success, bytes output)
```

Dispatches a single command for execution.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| action | uint256 | The command to be dispatched. |
| data | bytes | The command to be dispatched. |
| callStack | uint256[] |  |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| success | bool | A boolean indicating if the command was executed successfully. |
| output | bytes | The output data from the command execution. Action is a 256-bit value where: The lower 32 bits represent the action to execute (actionToExecute).   - The next 32 bits (bits 32-63) represent the input mapping (inputMapping).     Each 8 bits in this range maps to an input parameter position.     Example: bits 32-33 represent the index of the first input parameter   - The next 32 bits (bits 64-95) represent the output mapping (outputMapping).     Each 8 bits in this range maps to an output parameter position.   - The remaining bits (96-255) are reserved for future use. The action parameter encodes multiple pieces of information in a compact format: - The action ID determines which operation to perform - Input/output mappings allow flexible parameter passing between commands - Each 8-bit segment in the mappings corresponds to a parameter index |

