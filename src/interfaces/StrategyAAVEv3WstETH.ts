import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit';

export interface StrategyAAVEv3WstETHMethods {

  aaveV3(): ContractCallMethod<string>;

  aaveV3A(): ContractCallMethod<string>;

  calcDeltaPosition(percentageToBurn: number, totalCollateralBaseInEth: number, totalDebtBaseInEth: number): ContractCallMethod<{'deltaCollateralInETH': number;'deltaDebtInETH': number;}>;

  calculateDebtToPay(targetLoanToValue: number, collateral: number, debt: number): ContractCallMethod<{'delta': number;}>;

  calculateLeverageRatio(baseValue: number, loanToValue: number, nrLoops: number): ContractCallMethod<number>;

  deploy(): ContractSendMethod;

  flashLender(): ContractCallMethod<string>;

  flashLenderA(): ContractCallMethod<string>;

  getPosition(priceOptions: {
    maxAge: number;
    maxConf: number;
  }): ContractCallMethod<{'totalCollateralInEth': number;'totalDebtInEth': number;'loanToValue': number;}>;

  harvest(): ContractSendMethod;

  ierc20(): ContractCallMethod<string>;

  ierc20A(): ContractCallMethod<string>;

  onFlashLoan(initiator: string, token: string, amount: number, fee: number, callData: string): ContractSendMethod;

  owner(): ContractCallMethod<string>;

  registerSvc(): ContractCallMethod<string>;

  renounceOwnership(): ContractSendMethod

  settings(): ContractCallMethod<string>;

  settingsA(): ContractCallMethod<string>;

  deployed(priceOptions: {
    maxAge: number;
    maxConf: number;
  }): ContractCallMethod<{'totalOwnedAssets': number;}>;

  stETH(): ContractCallMethod<string>;

  stETHA(): ContractCallMethod<string>;

  totalAssets(): ContractCallMethod<{'totalOwnedAssets': number;}>;

  transferOwnership(newOwner: string): ContractSendMethod

  undeploy(amount: number): ContractSendMethod;

  uniQuoter(): ContractCallMethod<string>;

  uniQuoterA(): ContractCallMethod<string>;

  uniRouter(): ContractCallMethod<string>;

  uniRouterA(): ContractCallMethod<string>;

  wETH(): ContractCallMethod<string>;

  wETHA(): ContractCallMethod<string>;

  wstETH(): ContractCallMethod<string>;

  wstETHA(): ContractCallMethod<string>;

  getLoanToValue(): ContractCallMethod<number>;

  getMaxLoanToValue(): ContractCallMethod<number>;

  getNrLoops(): ContractCallMethod<number>;

  setLoanToValue(loanToValue: number): ContractSendMethod

  setMaxLoanToValue(maxLoanToValue: number): ContractSendMethod

  setNrLoops(nrLoops: number): ContractSendMethod

  governor(): ContractCallMethod<string>;

}