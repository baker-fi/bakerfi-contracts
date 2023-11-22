# Solidity API

## ICurvePool

### coins

```solidity
function coins(uint256 i) external view returns (address)
```

### get_virtual_price

```solidity
function get_virtual_price() external view returns (uint256)
```

### lp_token

```solidity
function lp_token() external view returns (address)
```

### fee

```solidity
function fee() external view returns (uint256)
```

### admin_fee

```solidity
function admin_fee() external view returns (uint256)
```

### get_dy

```solidity
function get_dy(int128 i, int128 j, uint256 dx) external view returns (uint256)
```

### exchange

```solidity
function exchange(int128 i, int128 j, uint256 dx, uint256 min_dy) external returns (uint256)
```

### add_liquidity

```solidity
function add_liquidity(uint256[2] _deposit_amount, uint256 _min_amount) external returns (uint256 lpOut)
```

### remove_liquidity_one_coin

```solidity
function remove_liquidity_one_coin(uint256 _burn_amount, int128 i, uint256 _min_amount) external returns (uint256 tokenOut)
```

### calc_token_amount

```solidity
function calc_token_amount(uint256[2] _amounts, bool _is_deposit) external view returns (uint256)
```

### calc_withdraw_one_coin

```solidity
function calc_withdraw_one_coin(uint256 _burn_amount, int128 i) external view returns (uint256)
```

### balances

```solidity
function balances(uint256 i) external view returns (uint256)
```

### A_precise

```solidity
function A_precise() external view returns (uint256)
```

