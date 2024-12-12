# Solidity API

## BakerFiProxy

This contract is a proxy based on OpenZeppelin's TransparentUpgradeableProxy.
        It allows for the upgrade of the implementation contract while maintaining
        the same address for users interacting with the proxy.

### constructor

```solidity
constructor(address _logic, address admin_, bytes _data) public
```

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _logic | address | The address of the first implementation contract. |
| admin_ | address | The address of the proxy admin who can upgrade the implementation. |
| _data | bytes | The data to call on the implementation contract upon deployment. |

