import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit';

export interface SettingsMethods {

  getFeeReceiver(): ContractCallMethod<string>;

  getLoanToValue(): ContractCallMethod<number>;

  getMaxLoanToValue(): ContractCallMethod<number>;

  getNrLoops(): ContractCallMethod<number>;

  getPerformanceFee(): ContractCallMethod<number>;

  getWithdrawalFee(): ContractCallMethod<number>;

  owner(): ContractCallMethod<string>;

  renounceOwnership(): ContractSendMethod

  setFeeReceiver(receiver: string): ContractSendMethod

  setLoanToValue(loanToValue: number): ContractSendMethod

  setMaxLoanToValue(maxLoanToValue: number): ContractSendMethod

  setNrLoops(nrLoops: number): ContractSendMethod

  setPerformanceFee(fee: number): ContractSendMethod

  setWithdrawalFee(fee: number): ContractSendMethod

  transferOwnership(newOwner: string): ContractSendMethod

}