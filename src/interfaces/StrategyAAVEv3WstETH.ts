import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit';

export interface StrategyAAVEv3WstETHMethods {

  getPosition(priceOptions: {
    maxAge: number;
    maxConf: number;
  }): ContractCallMethod<{'totalCollateralInEth': number;'totalDebtInEth': number;'loanToValue': number;}>;

  harvest(): ContractSendMethod;


  undeploy(amount: number): ContractSendMethod;

  owner(): ContractCallMethod<string>;

  deploy(): ContractSendMethod;

  deployed(priceOptions: {
    maxAge: number;
    maxConf: number;
  }): ContractCallMethod<{'totalOwnedAssets': number;}>;

  totalAssets(): ContractCallMethod<{'totalOwnedAssets': number;}>;

  /**
   * Ownership functions 
   */
  governor(): ContractCallMethod<string>;

  transferOwnership(newOwner: string): ContractSendMethod

  renounceOwnership(): ContractSendMethod

  getLoanToValue(): ContractCallMethod<number>;

  getMaxLoanToValue(): ContractCallMethod<number>;

  getNrLoops(): ContractCallMethod<number>;

  setLoanToValue(loanToValue: number): ContractSendMethod

  setMaxLoanToValue(maxLoanToValue: number): ContractSendMethod

  setNrLoops(nrLoops: number): ContractSendMethod

}