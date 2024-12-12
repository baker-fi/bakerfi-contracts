export interface InitializedEvent {
  returnValues: { version: number };
}
export interface OwnershipTransferStartedEvent {
  returnValues: { previousOwner: string; newOwner: string };
}
export interface OwnershipTransferredEvent {
  returnValues: { previousOwner: string; newOwner: string };
}
export interface SwapEvent {
  returnValues: {
    assetIn: string;
    assetOut: string;
    assetInAmount: number;
    assetOutAmount: number;
  };
}
