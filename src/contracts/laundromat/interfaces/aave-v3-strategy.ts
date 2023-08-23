import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit';

export interface AAVEv3StrategyMethods {


    _convertETHInWSt(amountIn: number): ContractCallMethod<{'amountOut': number;}>;

  _convertWstInETH(amountIn: number): ContractCallMethod<{'amountOut': number;}>;



  exit(): ContractSendMethod;

  getPosition(): ContractCallMethod<{'totalCollateralInEth': number;'totalDebtInEth': number;}>;

  harvest(): ContractSendMethod;

  onFlashLoan(initiator: string, token: string, amount: number, fee: number, callData: string): ContractSendMethod;

  owner(): ContractCallMethod<string>;

  renounceOwnership(): ContractSendMethod

  totalAssets(): ContractCallMethod<{'totalOwnedAssets': number;}>;

  transferOwnership(newOwner: string): ContractSendMethod



}