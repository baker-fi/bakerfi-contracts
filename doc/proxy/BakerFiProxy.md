# Solidity API

## BakerFiProxy

The **BakerFiProxy** serves as a middleman between client contracts and the implementation contract. When a client interacts with the proxy, the proxy forwards the call to the implementation contract, which executes the requested functionality.

The following contracts are deployed behind a proxy :

- Settings
- Strategy implementation
- Vault

### constructor

```solidity
constructor(address _logic, address admin_, bytes _data) public
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _logic | address | First Implementation |
| admin_ | address | Proxy Admin |
| _data | bytes | Data to call |

