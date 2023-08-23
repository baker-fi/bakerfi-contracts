import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit';

export interface UniV3SwapperMethods {


    addFeeTier(fromToken: string, toToken: string, fee: number): ContractSendMethod

  executeSwap(params: {'params': { 'underlyingIn': string;'underlyingOut': string;'mode': number;'amountIn': number;'amountOut': number;'payload': string; };}): ContractSendMethod;

  getFeeTier(fromToken: string, toToken: string): ContractCallMethod<number>;

  owner(): ContractCallMethod<string>;

  removeFeeTier(fromToken: string, toToken: string): ContractSendMethod

  renounceOwnership(): ContractSendMethod

  transferOwnership(newOwner: string): ContractSendMethod

}