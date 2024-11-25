export interface AccountWhiteListEvent {
  returnValues: { account: string; enabled: boolean };
}
export interface AddStrategyEvent {
  returnValues: { strategy: string };
}
export interface ApprovalEvent {
  returnValues: { owner: string; spender: string; value: number };
}
export interface DepositEvent {
  returnValues: { sender: string; owner: string; assets: number; shares: number };
}
export interface FeeReceiverChangedEvent {
  returnValues: { value: string };
}
export interface InitializedEvent {
  returnValues: { version: number };
}
export interface MaxDepositChangedEvent {
  returnValues: { value: number };
}
export interface MaxDifferenceUpdatedEvent {
  returnValues: { maxDifference: number };
}
export interface OwnershipTransferStartedEvent {
  returnValues: { previousOwner: string; newOwner: string };
}
export interface OwnershipTransferredEvent {
  returnValues: { previousOwner: string; newOwner: string };
}
export interface PausedEvent {
  returnValues: { account: string };
}
export interface PerformanceFeeChangedEvent {
  returnValues: { value: number };
}
export interface RemoveStrategyEvent {
  returnValues: { strategy: string };
}
export interface RoleAdminChangedEvent {
  returnValues: { role: string; previousAdminRole: string; newAdminRole: string };
}
export interface RoleGrantedEvent {
  returnValues: { role: string; account: string; sender: string };
}
export interface RoleRevokedEvent {
  returnValues: { role: string; account: string; sender: string };
}
export interface TransferEvent {
  returnValues: { from: string; to: string; value: number };
}
export interface UnpausedEvent {
  returnValues: { account: string };
}
export interface WeightsUpdatedEvent {
  returnValues: { weights: number[] };
}
export interface WithdrawEvent {
  returnValues: { sender: string; receiver: string; owner: string; assets: number; shares: number };
}
export interface WithdrawalFeeChangedEvent {
  returnValues: { value: number };
}
