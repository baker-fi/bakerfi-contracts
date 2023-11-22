# Solidity API

## IUniswapV3Pool

### Slot0

```solidity
struct Slot0 {
  uint160 sqrtPriceX96;
  int24 tick;
  uint16 observationIndex;
  uint16 observationCardinality;
  uint16 observationCardinalityNext;
  uint8 feeProtocol;
  bool unlocked;
}
```

### slot0

```solidity
function slot0() external view virtual returns (struct IUniswapV3Pool.Slot0)
```

### fee

```solidity
function fee() external view virtual returns (uint24 fee)
```

### flash

```solidity
function flash(address recipient, uint256 amount0, uint256 amount1, bytes data) external virtual
```

