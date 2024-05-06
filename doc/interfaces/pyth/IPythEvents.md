# Solidity API

## IPythEvents

_This interface can be used for listening to the updates for off-chain and testing purposes._

### PriceFeedUpdate

```solidity
event PriceFeedUpdate(bytes32 id, uint64 publishTime, int64 price, uint64 conf)
```

_Emitted when the price feed with `id` has received a fresh update._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | bytes32 | The Pyth Price Feed ID. |
| publishTime | uint64 | Publish time of the given price update. |
| price | int64 | Price of the given price update. |
| conf | uint64 | Confidence interval of the given price update. |

### BatchPriceFeedUpdate

```solidity
event BatchPriceFeedUpdate(uint16 chainId, uint64 sequenceNumber)
```

_Emitted when a batch price update is processed successfully._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| chainId | uint16 | ID of the source chain that the batch price update comes from. |
| sequenceNumber | uint64 | Sequence number of the batch price update. |

