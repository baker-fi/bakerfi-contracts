import { ContractSendMethod } from 'web3-eth-contract';
import { ContractCallMethod } from '@taikai/dappkit';

export interface MultiStrategyVaultMethods {
  DEFAULT_ADMIN_ROLE(): ContractCallMethod<string>;

  MAX_TOTAL_WEIGHT(): ContractCallMethod<number>;

  PAUSER_ROLE(): ContractCallMethod<string>;

  _initializeVaultSettings(): ContractSendMethod;

  acceptOwnership(): ContractSendMethod;

  addStrategy(strategy: string): ContractSendMethod;

  allowance(owner: string, spender: string): ContractCallMethod<number>;

  approve(spender: string, amount: number): ContractSendMethod;

  asset(): ContractCallMethod<string>;

  balanceOf(account: string): ContractCallMethod<number>;

  convertToAssets(shares: number): ContractCallMethod<{ assets: number }>;

  convertToShares(assets: number): ContractCallMethod<{ shares: number }>;

  decimals(): ContractCallMethod<number>;

  decreaseAllowance(spender: string, subtractedValue: number): ContractSendMethod;

  deposit(assets: number, receiver: string): ContractSendMethod;

  depositNative(receiver: string): ContractSendMethod;

  enableAccount(account: string, enabled: boolean): ContractSendMethod;

  getFeeReceiver(): ContractCallMethod<string>;

  getMaxDeposit(): ContractCallMethod<number>;

  getPerformanceFee(): ContractCallMethod<number>;

  getRoleAdmin(role: string): ContractCallMethod<string>;

  getWithdrawalFee(): ContractCallMethod<number>;

  grantRole(role: string, account: string): ContractSendMethod;

  hasRole(role: string, account: string): ContractCallMethod<boolean>;

  increaseAllowance(spender: string, addedValue: number): ContractSendMethod;

  initialize(
    initialOwner: string,
    tokenName: string,
    tokenSymbol: string,
    iAsset: string,
    istrategies: string[],
    iweights: number[],
    weth: string,
  ): ContractSendMethod;

  isAccountEnabled(account: string): ContractCallMethod<boolean>;

  maxDeposit(arg1: string): ContractCallMethod<{ maxAssets: number }>;

  maxDifference(): ContractCallMethod<number>;

  maxMint(arg1: string): ContractCallMethod<{ maxShares: number }>;

  maxRedeem(shareHolder: string): ContractCallMethod<{ maxShares: number }>;

  maxWithdraw(shareHolder: string): ContractCallMethod<{ maxAssets: number }>;

  mint(shares: number, receiver: string): ContractSendMethod;

  name(): ContractCallMethod<string>;

  owner(): ContractCallMethod<string>;

  pause(): ContractSendMethod;

  paused(): ContractCallMethod<boolean>;

  pendingOwner(): ContractCallMethod<string>;

  previewDeposit(assets: number): ContractCallMethod<{ shares: number }>;

  previewMint(shares: number): ContractCallMethod<{ assets: number }>;

  previewRedeem(shares: number): ContractCallMethod<{ assets: number }>;

  previewWithdraw(assets: number): ContractCallMethod<{ shares: number }>;

  rebalance(): ContractSendMethod;

  redeem(shares: number, receiver: string, holder: string): ContractSendMethod;

  redeemNative(shares: number): ContractSendMethod;

  removeStrategy(index: number): ContractSendMethod;

  renounceOwnership(): ContractSendMethod;

  renounceRole(role: string, account: string): ContractSendMethod;

  revokeRole(role: string, account: string): ContractSendMethod;

  setFeeReceiver(receiver: string): ContractSendMethod;

  setMaxDeposit(value: number): ContractSendMethod;

  setMaxDifference(imaxDifference: number): ContractSendMethod;

  setPerformanceFee(fee: number): ContractSendMethod;

  setWeights(iweights: number[]): ContractSendMethod;

  setWithdrawalFee(fee: number): ContractSendMethod;

  strategies(): ContractCallMethod<string[]>;

  supportsInterface(interfaceId: string): ContractCallMethod<boolean>;

  symbol(): ContractCallMethod<string>;

  tokenPerAsset(): ContractCallMethod<number>;

  totalAssets(): ContractCallMethod<{ amount: number }>;

  totalSupply(): ContractCallMethod<number>;

  totalWeight(): ContractCallMethod<number>;

  transfer(to: string, amount: number): ContractSendMethod;

  transferFrom(from: string, to: string, amount: number): ContractSendMethod;

  transferOwnership(newOwner: string): ContractSendMethod;

  unpause(): ContractSendMethod;

  weights(): ContractCallMethod<number[]>;

  withdraw(assets: number, receiver: string, holder: string): ContractSendMethod;

  withdrawNative(assets: number): ContractSendMethod;
}
