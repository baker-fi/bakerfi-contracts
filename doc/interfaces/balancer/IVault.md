# Solidity API

## IVault

### SwapKind

```solidity
enum SwapKind {
  GIVEN_IN,
  GIVEN_OUT
}
```

### SingleSwap

```solidity
struct SingleSwap {
  bytes32 poolId;
  enum IVault.SwapKind kind;
  address assetIn;
  address assetOut;
  uint256 amount;
  bytes userData;
}
```

### FundManagement

```solidity
struct FundManagement {
  address sender;
  bool fromInternalBalance;
  address payable recipient;
  bool toInternalBalance;
}
```

### swap

```solidity
function swap(struct IVault.SingleSwap singleSwap, struct IVault.FundManagement funds, uint256 limit, uint256 deadline) external payable returns (uint256)
```

### querySwap

```solidity
function querySwap(struct IVault.SingleSwap singleSwap, struct IVault.FundManagement funds) external view returns (uint256)
```

### getProtocolFeesCollector

```solidity
function getProtocolFeesCollector() external view returns (contract IProtocolFeesCollector)
```

