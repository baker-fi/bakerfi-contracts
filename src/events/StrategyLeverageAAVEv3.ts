export interface OwnershipTransferredEvent {
  returnValues: { previousOwner: string; newOwner: string };
}
export interface StrategyAmountUpdateEvent {
  returnValues: { newDeployment: number };
}
export interface StrategyLossEvent {
  returnValues: { amount: number };
}
export interface StrategyProfitEvent {
  returnValues: { amount: number };
}
export interface SwapEvent {
  returnValues: {
    assetIn: string;
    assetOut: string;
    assetInAmount: number;
    assetOutAmount: number;
  };
}
export interface StrategyDeployEvent {
  returnValues: { from: string; amount: number };
}
export interface StrategyUndeployEvent {
  returnValues: { from: string; amount: number };
}
export interface LoanToValueChangedEvent {
  returnValues: { value: number };
}
export interface SetMaxLoanToValueChangedEvent {
  returnValues: { value: number };
}
export interface NrLoopsChangedEvent {
  returnValues: { value: number };
}
export interface PriceMaxAgeChangeEvent {
  returnValues: { value: number };
}

export interface PriceMaxConfChangeEvent {
  returnValues: { value: number };
}
