# Solidity API

## IVault

### depositNative

```solidity
function depositNative(address receiver) external payable returns (uint256 shares)
```

Deposits ETH or the native currency on the strategy

The strategy should support ETH as the deployed asset

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| receiver | address | Receiver of the minted shares after deposit |

### withdrawNative

```solidity
function withdrawNative(uint256 assets) external returns (uint256 shares)
```

_Reedemns ETH or the native currency from the strategy

The strategy should support ETH as the deployed asset_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assets | uint256 | Receiver of the minted shares after deposit |

### redeemNative

```solidity
function redeemNative(uint256 shares) external returns (uint256 assets)
```

_Reedemns ETH or the native currency from the strategy

The strategy should support ETH as the deployed asset_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| shares | uint256 | Receiver of the minted shares after deposit |

### tokenPerAsset

```solidity
function tokenPerAsset() external view returns (uint256 rate)
```

_The Vault Ration between the token price and the shares
price. It could be used as price oracle for external entities_

### rebalance

```solidity
function rebalance() external returns (int256 balanceChange)
```

_Function to rebalance the strategy, prevent a liquidation and pay fees
to protocol by minting shares to the fee receiver_

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| balanceChange | int256 | The change in balance after the rebalance operation. |

