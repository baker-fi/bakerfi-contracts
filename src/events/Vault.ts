import { ContractSendMethod } from 'web3-eth-contract';

export interface ApprovalEvent {
  returnValues: { owner: string; spender: string; value: number };
}
export interface EIP712DomainChangedEvent {
  returnValues: ContractSendMethod;
}
export interface OwnershipTransferredEvent {
  returnValues: { previousOwner: string; newOwner: string };
}
export interface PausedEvent {
  returnValues: { account: string };
}
export interface TransferEvent {
  returnValues: { from: string; to: string; value: number };
}
export interface UnpausedEvent {
  returnValues: { account: string };
}
export interface DepositEvent {
  returnValues: { sender: string; receiver: string; owner: string; assets: number; shares: number };
}
export interface WithdrawEvent {
  returnValues: { owner: string; amount: number; shares: number };
}

export interface FeeReceiverChangedEvent {
  returnValues: { value: number };
}

export interface PerformanceFeeChangedEvent {
  returnValues: { value: number };
}

export interface WithdrawalFeeChangedEvent {
  returnValues: { value: number };
}

export interface AccountWhiteListEvent {
  returnValues: { account: string; enabled: boolean };
}
