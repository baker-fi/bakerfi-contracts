import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit';

export interface SettingsMethods {

  getFeeReceiver(): ContractCallMethod<string>;

  getLoanToValue(): ContractCallMethod<number>;

  getMaxLoanToValue(): ContractCallMethod<number>;

  getNrLoops(): ContractCallMethod<number>;

  getPerformanceFee(): ContractCallMethod<number>;

  getWithdrawalFee(): ContractCallMethod<number>;

  isAccountEnabled(account: string): ContractCallMethod<boolean>;

  owner(): ContractCallMethod<string>;

  renounceOwnership(): ContractSendMethod

  setFeeReceiver(receiver: string): ContractSendMethod

  setLoanToValue(loanToValue: number): ContractSendMethod

  setMaxLoanToValue(maxLoanToValue: number): ContractSendMethod

  setNrLoops(nrLoops: number): ContractSendMethod

  setPerformanceFee(fee: number): ContractSendMethod

  setWithdrawalFee(fee: number): ContractSendMethod

  enableAccount(account: string, enabled: boolean): ContractSendMethod

  transferOwnership(newOwner: string): ContractSendMethod

  getMaxDepositInETH(): ContractCallMethod<number>;

  setMaxDepositInETH(amount: number): ContractSendMethod;

  setRebalancePriceMaxAge(maxAge: number): ContractSendMethod;

  getRebalancePriceMaxAge(): ContractCallMethod<number>;

  setPriceMaxAge(maxAge: number): ContractSendMethod;

  getPriceMaxAge(): ContractCallMethod<number>;

}