import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit';

export interface AAVEv3StrategyAnyMethods {

  aaveV3(): ContractCallMethod<string>;

  aaveV3A(): ContractCallMethod<string>;

  calcDeltaPosition(percentageToBurn: number, totalCollateralBaseInEth: number, totalDebtBaseInEth: number): ContractCallMethod<{'deltaCollateralInETH': number;'deltaDebtInETH': number;}>;

  calculateDebtToPay(targetLoanToValue: number, collateral: number, debt: number): ContractCallMethod<{'delta': number;}>;

  calculateLeverageRatio(baseValue: number, loanToValue: number, nrLoops: number): ContractCallMethod<number>;

  deploy(): ContractSendMethod;

  flashLender(): ContractCallMethod<string>;

  flashLenderA(): ContractCallMethod<string>;

  getPosition(): ContractCallMethod<{'totalCollateralInEth': number;'totalDebtInEth': number;'loanToValue': number;}>;

  harvest(): ContractSendMethod;

  ierc20(): ContractCallMethod<string>;

  ierc20A(): ContractCallMethod<string>;

  onFlashLoan(initiator: string, token: string, amount: number, fee: number, callData: string): ContractSendMethod;

  owner(): ContractCallMethod<string>;

  registerSvc(): ContractCallMethod<string>;

  renounceOwnership(): ContractSendMethod

  settings(): ContractCallMethod<string>;

  settingsA(): ContractCallMethod<string>;

  deployed(maxAge: number): ContractCallMethod<{'totalOwnedAssets': number;}>;

  transferOwnership(newOwner: string): ContractSendMethod

  undeploy(amount: number): ContractSendMethod;

  uniQuoter(): ContractCallMethod<string>;

  uniQuoterA(): ContractCallMethod<string>;

  uniRouter(): ContractCallMethod<string>;

  uniRouterA(): ContractCallMethod<string>;

  wETH(): ContractCallMethod<string>;

  wETHA(): ContractCallMethod<string>;

}