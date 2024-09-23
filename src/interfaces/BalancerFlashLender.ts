import { ContractSendMethod } from 'web3-eth-contract';
import { ContractCallMethod } from '@taikai/dappkit';

export interface BalancerFlashLenderMethods {
  CALLBACK_SUCCESS(): ContractCallMethod<string>;

  flashFee(arg1: string, arg2: number): ContractCallMethod<number>;

  flashLoan(borrower: string, token: string, amount: number, data: string): ContractSendMethod;

  maxFlashLoan(token: string): ContractCallMethod<number>;

  receiveFlashLoan(
    tokens: string[],
    amounts: number[],
    feeAmounts: number[],
    userData: string,
  ): ContractSendMethod;
}
