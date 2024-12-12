import { ContractSendMethod } from 'web3-eth-contract';
import { ContractCallMethod } from '@taikai/dappkit';

export interface StrategyLeverageMorphoBlueMethods {
  asset(): ContractCallMethod<string>;

  deploy(amount: number): ContractSendMethod;

  getBalances(): ContractCallMethod<{ collateralBalance: number; debtBalance: number }>;

  getCollateralAsset(): ContractCallMethod<string>;

  getCollateralOracle(): ContractCallMethod<{ oracle: string }>;

  getDebAsset(): ContractCallMethod<string>;

  getDebtOracle(): ContractCallMethod<{ oracle: string }>;

  getLoanToValue(): ContractCallMethod<number>;

  getMaxLoanToValue(): ContractCallMethod<number>;

  getMaxSlippage(): ContractCallMethod<number>;

  getNrLoops(): ContractCallMethod<number>;

  getPosition(params: { priceOptions: { maxAge: number; maxConf: number } }): ContractCallMethod<{
    totalCollateralInUSD: number;
    totalDebtInUSD: number;
    loanToValue: number;
  }>;

  governor(): ContractCallMethod<string>;

  harvest(): ContractSendMethod;

  initialize(
    initialOwner: string,
    initialGovernor: string,
    registry: string,
    params: {
      params: {
        collateralToken: string;
        debtToken: string;
        collateralOracle: string;
        debtOracle: string;
        swapFeeTier: number;
        morphoOracle: string;
        irm: string;
        lltv: number;
      };
    },
  ): ContractSendMethod;

  onFlashLoan(
    initiator: string,
    token: string,
    amount: number,
    fee: number,
    callData: string,
  ): ContractSendMethod;

  owner(): ContractCallMethod<string>;

  renounceOwnership(): ContractSendMethod;

  setCollateralOracle(oracle: string): ContractSendMethod;

  setDebtOracle(oracle: string): ContractSendMethod;

  setLoanToValue(loanToValue: number): ContractSendMethod;

  setMaxLoanToValue(maxLoanToValue: number): ContractSendMethod;

  setMaxSlippage(slippage: number): ContractSendMethod;

  setNrLoops(nrLoops: number): ContractSendMethod;

  totalAssets(params: {
    priceOptions: { maxAge: number; maxConf: number };
  }): ContractCallMethod<{ totalOwnedAssetsInDebt: number }>;

  transferGovernorship(_newGovernor: string): ContractSendMethod;

  transferOwnership(newOwner: string): ContractSendMethod;

  undeploy(amount: number): ContractSendMethod;

  setPriceMaxAge(maxAge: number): ContractSendMethod;

  getPriceMaxAge(): ContractCallMethod<number>;

  setPriceMaxConf(confPerc: number): ContractSendMethod;

  getPriceMaxConf(): ContractCallMethod<number>;
}
