# Solidity API

## IPyth

_Please refer to the guidance at https://docs.pyth.network/documentation/pythnet-price-feeds/best-practices for how to consume prices safely._

### getValidTimePeriod

```solidity
function getValidTimePeriod() external view returns (uint256 validTimePeriod)
```

Returns the period (in seconds) that a price feed is considered valid since its publish time

### getPrice

```solidity
function getPrice(bytes32 id) external view returns (struct PythStructs.Price price)
```

Returns the price and confidence interval.

_Reverts if the price has not been updated within the last `getValidTimePeriod()` seconds._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | bytes32 | The Pyth Price Feed ID of which to fetch the price and confidence interval. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct PythStructs.Price | - please read the documentation of PythStructs.Price to understand how to use this safely. |

### getEmaPrice

```solidity
function getEmaPrice(bytes32 id) external view returns (struct PythStructs.Price price)
```

Returns the exponentially-weighted moving average price and confidence interval.

_Reverts if the EMA price is not available._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | bytes32 | The Pyth Price Feed ID of which to fetch the EMA price and confidence interval. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct PythStructs.Price | - please read the documentation of PythStructs.Price to understand how to use this safely. |

### getPriceUnsafe

```solidity
function getPriceUnsafe(bytes32 id) external view returns (struct PythStructs.Price price)
```

Returns the price of a price feed without any sanity checks.

_This function returns the most recent price update in this contract without any recency checks.
This function is unsafe as the returned price update may be arbitrarily far in the past.

Users of this function should check the `publishTime` in the price to ensure that the returned price is
sufficiently recent for their application. If you are considering using this function, it may be
safer / easier to use either `getPrice` or `getPriceNoOlderThan`._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct PythStructs.Price | - please read the documentation of PythStructs.Price to understand how to use this safely. |

### getPriceNoOlderThan

```solidity
function getPriceNoOlderThan(bytes32 id, uint256 age) external view returns (struct PythStructs.Price price)
```

Returns the price that is no older than `age` seconds of the current time.

_This function is a sanity-checked version of `getPriceUnsafe` which is useful in
applications that require a sufficiently-recent price. Reverts if the price wasn't updated sufficiently
recently._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct PythStructs.Price | - please read the documentation of PythStructs.Price to understand how to use this safely. |

### getEmaPriceUnsafe

```solidity
function getEmaPriceUnsafe(bytes32 id) external view returns (struct PythStructs.Price price)
```

Returns the exponentially-weighted moving average price of a price feed without any sanity checks.

_This function returns the same price as `getEmaPrice` in the case where the price is available.
However, if the price is not recent this function returns the latest available price.

The returned price can be from arbitrarily far in the past; this function makes no guarantees that
the returned price is recent or useful for any particular application.

Users of this function should check the `publishTime` in the price to ensure that the returned price is
sufficiently recent for their application. If you are considering using this function, it may be
safer / easier to use either `getEmaPrice` or `getEmaPriceNoOlderThan`._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct PythStructs.Price | - please read the documentation of PythStructs.Price to understand how to use this safely. |

### getEmaPriceNoOlderThan

```solidity
function getEmaPriceNoOlderThan(bytes32 id, uint256 age) external view returns (struct PythStructs.Price price)
```

Returns the exponentially-weighted moving average price that is no older than `age` seconds
of the current time.

_This function is a sanity-checked version of `getEmaPriceUnsafe` which is useful in
applications that require a sufficiently-recent price. Reverts if the price wasn't updated sufficiently
recently._

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct PythStructs.Price | - please read the documentation of PythStructs.Price to understand how to use this safely. |

### updatePriceFeeds

```solidity
function updatePriceFeeds(bytes[] updateData) external payable
```

Update price feeds with given update messages.
This method requires the caller to pay a fee in wei; the required fee can be computed by calling
`getUpdateFee` with the length of the `updateData` array.
Prices will be updated if they are more recent than the current stored prices.
The call will succeed even if the update is not the most recent.

_Reverts if the transferred fee is not sufficient or the updateData is invalid._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| updateData | bytes[] | Array of price update data. |

### updatePriceFeedsIfNecessary

```solidity
function updatePriceFeedsIfNecessary(bytes[] updateData, bytes32[] priceIds, uint64[] publishTimes) external payable
```

Wrapper around updatePriceFeeds that rejects fast if a price update is not necessary. A price update is
necessary if the current on-chain publishTime is older than the given publishTime. It relies solely on the
given `publishTimes` for the price feeds and does not read the actual price update publish time within `updateData`.

This method requires the caller to pay a fee in wei; the required fee can be computed by calling
`getUpdateFee` with the length of the `updateData` array.

`priceIds` and `publishTimes` are two arrays with the same size that correspond to senders known publishTime
of each priceId when calling this method. If all of price feeds within `priceIds` have updated and have
a newer or equal publish time than the given publish time, it will reject the transaction to save gas.
Otherwise, it calls updatePriceFeeds method to update the prices.

_Reverts if update is not needed or the transferred fee is not sufficient or the updateData is invalid._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| updateData | bytes[] | Array of price update data. |
| priceIds | bytes32[] | Array of price ids. |
| publishTimes | uint64[] | Array of publishTimes. `publishTimes[i]` corresponds to known `publishTime` of `priceIds[i]` |

### getUpdateFee

```solidity
function getUpdateFee(bytes[] updateData) external view returns (uint256 feeAmount)
```

Returns the required fee to update an array of price updates.

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| updateData | bytes[] | Array of price update data. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| feeAmount | uint256 | The required fee in Wei. |

### parsePriceFeedUpdates

```solidity
function parsePriceFeedUpdates(bytes[] updateData, bytes32[] priceIds, uint64 minPublishTime, uint64 maxPublishTime) external payable returns (struct PythStructs.PriceFeed[] priceFeeds)
```

Parse `updateData` and return price feeds of the given `priceIds` if they are all published
within `minPublishTime` and `maxPublishTime`.

You can use this method if you want to use a Pyth price at a fixed time and not the most recent price;
otherwise, please consider using `updatePriceFeeds`. This method may store the price updates on-chain, if they
are more recent than the current stored prices.

This method requires the caller to pay a fee in wei; the required fee can be computed by calling
`getUpdateFee` with the length of the `updateData` array.

_Reverts if the transferred fee is not sufficient or the updateData is invalid or there is
no update for any of the given `priceIds` within the given time range._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| updateData | bytes[] | Array of price update data. |
| priceIds | bytes32[] | Array of price ids. |
| minPublishTime | uint64 | minimum acceptable publishTime for the given `priceIds`. |
| maxPublishTime | uint64 | maximum acceptable publishTime for the given `priceIds`. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| priceFeeds | struct PythStructs.PriceFeed[] | Array of the price feeds corresponding to the given `priceIds` (with the same order). |

### parsePriceFeedUpdatesUnique

```solidity
function parsePriceFeedUpdatesUnique(bytes[] updateData, bytes32[] priceIds, uint64 minPublishTime, uint64 maxPublishTime) external payable returns (struct PythStructs.PriceFeed[] priceFeeds)
```

Similar to `parsePriceFeedUpdates` but ensures the updates returned are
the first updates published in minPublishTime. That is, if there are multiple updates for a given timestamp,
this method will return the first update. This method may store the price updates on-chain, if they
are more recent than the current stored prices.

_Reverts if the transferred fee is not sufficient or the updateData is invalid or there is
no update for any of the given `priceIds` within the given time range and uniqueness condition._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| updateData | bytes[] | Array of price update data. |
| priceIds | bytes32[] | Array of price ids. |
| minPublishTime | uint64 | minimum acceptable publishTime for the given `priceIds`. |
| maxPublishTime | uint64 | maximum acceptable publishTime for the given `priceIds`. |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| priceFeeds | struct PythStructs.PriceFeed[] | Array of the price feeds corresponding to the given `priceIds` (with the same order). |

