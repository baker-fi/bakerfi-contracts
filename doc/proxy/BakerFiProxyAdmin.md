# Solidity API

## BakerFiProxyAdmin

This contract serves as the admin for the BakerFi proxy, allowing for the management
        of the proxy's implementation contracts. It inherits from OpenZeppelin's ProxyAdmin,
        which provides the necessary functionality to upgrade the implementation and manage
        ownership.

### InvalidOwner

```solidity
error InvalidOwner()
```

Error thrown when the provided owner address is invalid (zero address).

### constructor

```solidity
constructor(address initialOwner) public
```

_The constructor initializes the ProxyAdmin with the provided initial owner.
     It reverts if the initial owner address is the zero address._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| initialOwner | address | The address of the initial owner of the proxy admin. |

