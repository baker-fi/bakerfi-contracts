export interface BatchPriceFeedUpdateEvent {
  returnValues: { chainId: number; sequenceNumber: number };
}
export interface PriceFeedUpdateEvent {
  returnValues: { id: string; publishTime: number; price: number; conf: number };
}
