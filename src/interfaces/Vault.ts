import { ContractCallMethod } from '@taikai/dappkit';
import { ContractSendMethod } from 'web3-eth-contract';

export interface VaultMethods {
  DOMAIN_SEPARATOR(): ContractCallMethod<string>;

  allowance(owner: string, spender: string): ContractCallMethod<number>;

  approve(spender: string, amount: number): ContractSendMethod;

  balanceOf(account: string): ContractCallMethod<number>;

  convertToAssets(shares: number): ContractCallMethod<{ assets: number }>;

  convertToShares(assets: number): ContractCallMethod<{ shares: number }>;

  decimals(): ContractCallMethod<number>;

  decreaseAllowance(spender: string, subtractedValue: number): ContractSendMethod;

  depositNative(receiver: string): ContractSendMethod;

  eip712Domain(): ContractCallMethod<{
    fields: string;
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
    salt: string;
    extensions: number[];
  }>;

  increaseAllowance(spender: string, addedValue: number): ContractSendMethod;

  name(): ContractCallMethod<string>;

  nonces(owner: string): ContractCallMethod<number>;

  owner(): ContractCallMethod<string>;

  paused(): ContractCallMethod<boolean>;

  pause(): ContractSendMethod;

  unpause(): ContractSendMethod;

  permit(
    owner: string,
    spender: string,
    value: number,
    deadline: number,
    v: number,
    r: string,
    s: string,
  ): ContractSendMethod;

  rebalance(): ContractSendMethod;

  renounceOwnership(): ContractSendMethod;

  symbol(): ContractCallMethod<string>;

  tokenPerAsset(): ContractCallMethod<number>;

  totalAssets(): ContractCallMethod<{ amount: number }>;

  totalSupply(): ContractCallMethod<number>;

  transfer(to: string, amount: number): ContractSendMethod;

  transferFrom(from: string, to: string, amount: number): ContractSendMethod;

  transferOwnership(newOwner: string): ContractSendMethod;

  redeemNative(shares: number): ContractSendMethod;

  maxDeposit(receiver: string): ContractCallMethod<number>;

  previewDeposit(assets: number): ContractCallMethod<number>;

  deposit(assets: number, receiver: string): ContractSendMethod;

  maxMint(receiver: string): ContractCallMethod<number>;

  previewMint(shares: number): ContractCallMethod<number>;

  mint(shares: number, receiver: string): ContractSendMethod;

  maxWithdraw(owner: string): ContractCallMethod<number>;

  previewWithdraw(assets: number): ContractCallMethod<number>;

  withdraw(assets: number, receiver: string, owner: string): ContractSendMethod;

  maxRedeem(owner: string): ContractCallMethod<number>;

  previewRedeem(shares: number): ContractCallMethod<number>;

  redeem(shares: number, receiver: string, owner: string): ContractCallMethod<number>;

  asset(): ContractCallMethod<number>;

  getFeeReceiver(): ContractCallMethod<string>;

  getPerformanceFee(): ContractCallMethod<number>;

  getWithdrawalFee(): ContractCallMethod<number>;

  isAccountEnabled(account: string): ContractCallMethod<boolean>;

  setFeeReceiver(receiver: string): ContractSendMethod;

  setPerformanceFee(fee: number): ContractSendMethod;

  setWithdrawalFee(fee: number): ContractSendMethod;

  enableAccount(account: string, enabled: boolean): ContractSendMethod;

  getMaxDeposit(): ContractCallMethod<number>;

  setMaxDeposit(amount: number): ContractSendMethod;
}
