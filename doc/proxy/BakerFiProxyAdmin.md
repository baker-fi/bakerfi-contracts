# Solidity API

## BakerFiProxyAdmin

The Proxy Admin is a separate contract that manages the upgradeability process. It's responsible for authorizing and executing upgrades to the implementation contract. The Proxy Admin contract is usually the only entity with the authority to upgrade the implementation contract associated with the proxy.

### InvalidOwner

```solidity
error InvalidOwner()
```

### constructor

```solidity
constructor(address initialOwner) public
```

