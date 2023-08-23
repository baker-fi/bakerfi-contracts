import {ContractSendMethod} from 'web3-eth-contract';
import {ContractCallMethod} from '@taikai/dappkit';

export interface LaundromatVaultMethods {


    DOMAIN_SEPARATOR(): ContractCallMethod<string>;

  _registry(): ContractCallMethod<string>;

  allowance(owner: string, spender: string): ContractCallMethod<number>;

  approve(spender: string, amount: number): ContractSendMethod;

  balanceOf(account: string): ContractCallMethod<number>;

  convertToAssets(shares: number): ContractCallMethod<{'assets': number;}>;

  convertToShares(assets: number): ContractCallMethod<{'shares': number;}>;

  decimals(): ContractCallMethod<number>;

  decreaseAllowance(spender: string, subtractedValue: number): ContractSendMethod;

  deposit(receiver: string): ContractSendMethod;

  eip712Domain(): ContractCallMethod<{'fields': string;'name': string;'version': string;'chainId': number;'verifyingContract': string;'salt': string;'extensions': number[];}>;

  harvest(): ContractSendMethod

  increaseAllowance(spender: string, addedValue: number): ContractSendMethod;

  loanToValue(): ContractCallMethod<{'ltv': number;}>;

  name(): ContractCallMethod<string>;

  nonces(owner: string): ContractCallMethod<number>;

  owner(): ContractCallMethod<string>;

  paused(): ContractCallMethod<boolean>;

  permit(owner: string, spender: string, value: number, deadline: number, v: number, r: string, s: string): ContractSendMethod

  renounceOwnership(): ContractSendMethod

  symbol(): ContractCallMethod<string>;

  tokenPerETh(): ContractCallMethod<number>;

  totalCollateral(): ContractCallMethod<{'totalCollateralInEth': number;}>;

  totalDebt(): ContractCallMethod<{'totalDebtInEth': number;}>;

  totalPosition(): ContractCallMethod<{'amount': number;}>;

  totalSupply(): ContractCallMethod<number>;

  transfer(to: string, amount: number): ContractSendMethod;

  transferFrom(from: string, to: string, amount: number): ContractSendMethod;

  transferOwnership(newOwner: string): ContractSendMethod

  withdraw(shares: number, receiver: string): ContractSendMethod;

}