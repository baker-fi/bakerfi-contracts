export interface GovernshipTransferredEvent {
  returnValues: { previousGovernor: string; newGovernor: string };
}
export interface InitializedEvent {
  returnValues: { version: number };
}
export interface LoanToValueChangedEvent {
  returnValues: { value: number };
}
export interface MaxLoanToValueChangedEvent {
  returnValues: { value: number };
}
export interface MaxSlippageChangedEvent {
  returnValues: { value: number };
}
export interface NrLoopsChangedEvent {
  returnValues: { value: number };
}
export interface OwnershipTransferredEvent {
  returnValues: { previousOwner: string; newOwner: string };
}
export interface StrategyAmountUpdateEvent {
  returnValues: { newDeployment: number };
}
export interface StrategyDeployEvent {
  returnValues: { from: string; amount: number };
}
export interface StrategyLossEvent {
  returnValues: { amount: number };
}
export interface StrategyProfitEvent {
  returnValues: { amount: number };
}
export interface StrategyUndeployEvent {
  returnValues: { from: string; amount: number };
}
export interface SwapEvent {
  returnValues: {
    assetIn: string;
    assetOut: string;
    assetInAmount: number;
    assetOutAmount: number;
  };
}
