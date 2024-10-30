import { ContractSendMethod } from 'web3-eth-contract';
import { ContractCallMethod } from '@taikai/dappkit';

export interface AAVEv3StrategyAnyMethods {
  deploy(amount: number): ContractSendMethod;

  getPosition(priceOptions: { maxAge: number; maxConf: number }): ContractCallMethod<{
    totalCollateralInUSD: number;
    totalDebtInUSD: number;
    loanToValue: number;
  }>;

  harvest(): ContractSendMethod;

  owner(): ContractCallMethod<string>;

  transferOwnership(newOwner: string): ContractSendMethod;

  governor(): ContractCallMethod<string>;

  renounceOwnership(): ContractSendMethod;

  totalAssets(priceOptions: {
    maxAge: number;
    maxConf: number;
  }): ContractCallMethod<{ totalOwnedAssetsInDebt: number }>;

  undeploy(amount: number): ContractSendMethod;

  getLoanToValue(): ContractCallMethod<number>;

  getMaxLoanToValue(): ContractCallMethod<number>;

  getNrLoops(): ContractCallMethod<number>;

  setLoanToValue(loanToValue: number): ContractSendMethod;

  setMaxLoanToValue(maxLoanToValue: number): ContractSendMethod;

  setNrLoops(nrLoops: number): ContractSendMethod;

  getCollateralOracle(): ContractCallMethod<string>;

  getDebtOracle(): ContractCallMethod<string>;

  setCollateralOracle(oracle: string): ContractSendMethod;

  setDebtOracle(oracle: string): ContractSendMethod;

  getCollateralToken(): ContractCallMethod<string>;

  getDebtToken(): ContractCallMethod<string>;

  asset(): ContractCallMethod<string>;

  setPriceMaxAge(maxAge: number): ContractSendMethod;

  getPriceMaxAge(): ContractCallMethod<number>;

  setPriceMaxConf(confPerc: number): ContractSendMethod;

  getPriceMaxConf(): ContractCallMethod<number>;
}
