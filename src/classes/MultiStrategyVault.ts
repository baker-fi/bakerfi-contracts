import {
  Model,
  Web3Connection,
  Web3ConnectionOptions,
  Deployable,
  XPromiseEvent,
} from '@taikai/dappkit';

import MultiStrategyVaultJson from '../../artifacts/contracts/core/MultiStrategyVault.sol/MultiStrategyVault.json';
import { MultiStrategyVaultMethods } from 'src/interfaces/MultiStrategyVault';
import * as Events from '@events/MultiStrategyVault';
import { PastEventOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

export class MultiStrategyVault extends Model<MultiStrategyVaultMethods> implements Deployable {
  constructor(web3Connection: Web3Connection | Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, MultiStrategyVaultJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi() {
    const deployOptions = {
      data: MultiStrategyVaultJson.bytecode,
      arguments: [],
    };
    return this.deploy(deployOptions, this.connection.Account);
  }

  async DEFAULT_ADMIN_ROLE() {
    return this.callTx(this.contract.methods.DEFAULT_ADMIN_ROLE());
  }

  async MAX_TOTAL_WEIGHT() {
    return this.callTx(this.contract.methods.MAX_TOTAL_WEIGHT());
  }

  async PAUSER_ROLE() {
    return this.callTx(this.contract.methods.PAUSER_ROLE());
  }

  async _initializeVaultSettings() {
    return this.sendTx(this.contract.methods._initializeVaultSettings());
  }

  async acceptOwnership() {
    return this.sendTx(this.contract.methods.acceptOwnership());
  }

  async addStrategy(strategy: string) {
    return this.sendTx(this.contract.methods.addStrategy(strategy));
  }

  async allowance(owner: string, spender: string) {
    return this.callTx(this.contract.methods.allowance(owner, spender));
  }

  async approve(spender: string, amount: number) {
    return this.sendTx(this.contract.methods.approve(spender, amount));
  }

  async asset() {
    return this.callTx(this.contract.methods.asset());
  }

  async balanceOf(account: string) {
    return this.callTx(this.contract.methods.balanceOf(account));
  }

  async convertToAssets(shares: number) {
    return this.callTx(this.contract.methods.convertToAssets(shares));
  }

  async convertToShares(assets: number) {
    return this.callTx(this.contract.methods.convertToShares(assets));
  }

  async decimals() {
    return this.callTx(this.contract.methods.decimals());
  }

  async decreaseAllowance(spender: string, subtractedValue: number) {
    return this.sendTx(this.contract.methods.decreaseAllowance(spender, subtractedValue));
  }

  async deposit(assets: number, receiver: string) {
    return this.sendTx(this.contract.methods.deposit(assets, receiver));
  }

  async depositNative(receiver: string) {
    return this.sendTx(this.contract.methods.depositNative(receiver));
  }

  async enableAccount(account: string, enabled: boolean) {
    return this.sendTx(this.contract.methods.enableAccount(account, enabled));
  }

  async getFeeReceiver() {
    return this.callTx(this.contract.methods.getFeeReceiver());
  }

  async getMaxDeposit() {
    return this.callTx(this.contract.methods.getMaxDeposit());
  }

  async getPerformanceFee() {
    return this.callTx(this.contract.methods.getPerformanceFee());
  }

  async getRoleAdmin(role: string) {
    return this.callTx(this.contract.methods.getRoleAdmin(role));
  }

  async getWithdrawalFee() {
    return this.callTx(this.contract.methods.getWithdrawalFee());
  }

  async grantRole(role: string, account: string) {
    return this.sendTx(this.contract.methods.grantRole(role, account));
  }

  async hasRole(role: string, account: string) {
    return this.callTx(this.contract.methods.hasRole(role, account));
  }

  async increaseAllowance(spender: string, addedValue: number) {
    return this.sendTx(this.contract.methods.increaseAllowance(spender, addedValue));
  }

  async initialize(
    initialOwner: string,
    tokenName: string,
    tokenSymbol: string,
    iAsset: string,
    istrategies: string[],
    iweights: number[],
    weth: string,
  ) {
    return this.sendTx(
      this.contract.methods.initialize(
        initialOwner,
        tokenName,
        tokenSymbol,
        iAsset,
        istrategies,
        iweights,
        weth,
      ),
    );
  }

  async isAccountEnabled(account: string) {
    return this.callTx(this.contract.methods.isAccountEnabled(account));
  }

  async maxDeposit(arg1: string) {
    return this.callTx(this.contract.methods.maxDeposit(arg1));
  }

  async maxDifference() {
    return this.callTx(this.contract.methods.maxDifference());
  }

  async maxMint(arg1: string) {
    return this.callTx(this.contract.methods.maxMint(arg1));
  }

  async maxRedeem(shareHolder: string) {
    return this.callTx(this.contract.methods.maxRedeem(shareHolder));
  }

  async maxWithdraw(shareHolder: string) {
    return this.callTx(this.contract.methods.maxWithdraw(shareHolder));
  }

  async mint(shares: number, receiver: string) {
    return this.sendTx(this.contract.methods.mint(shares, receiver));
  }

  async name() {
    return this.callTx(this.contract.methods.name());
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async pause() {
    return this.sendTx(this.contract.methods.pause());
  }

  async paused() {
    return this.callTx(this.contract.methods.paused());
  }

  async pendingOwner() {
    return this.callTx(this.contract.methods.pendingOwner());
  }

  async previewDeposit(assets: number) {
    return this.callTx(this.contract.methods.previewDeposit(assets));
  }

  async previewMint(shares: number) {
    return this.callTx(this.contract.methods.previewMint(shares));
  }

  async previewRedeem(shares: number) {
    return this.callTx(this.contract.methods.previewRedeem(shares));
  }

  async previewWithdraw(assets: number) {
    return this.callTx(this.contract.methods.previewWithdraw(assets));
  }

  async rebalance() {
    return this.sendTx(this.contract.methods.rebalance());
  }

  async redeem(shares: number, receiver: string, holder: string) {
    return this.sendTx(this.contract.methods.redeem(shares, receiver, holder));
  }

  async redeemNative(shares: number) {
    return this.sendTx(this.contract.methods.redeemNative(shares));
  }

  async removeStrategy(index: number) {
    return this.sendTx(this.contract.methods.removeStrategy(index));
  }

  async renounceOwnership() {
    return this.sendTx(this.contract.methods.renounceOwnership());
  }

  async renounceRole(role: string, account: string) {
    return this.sendTx(this.contract.methods.renounceRole(role, account));
  }

  async revokeRole(role: string, account: string) {
    return this.sendTx(this.contract.methods.revokeRole(role, account));
  }

  async setFeeReceiver(receiver: string) {
    return this.sendTx(this.contract.methods.setFeeReceiver(receiver));
  }

  async setMaxDeposit(value: number) {
    return this.sendTx(this.contract.methods.setMaxDeposit(value));
  }

  async setMaxDifference(imaxDifference: number) {
    return this.sendTx(this.contract.methods.setMaxDifference(imaxDifference));
  }

  async setPerformanceFee(fee: number) {
    return this.sendTx(this.contract.methods.setPerformanceFee(fee));
  }

  async setWeights(iweights: number[]) {
    return this.sendTx(this.contract.methods.setWeights(iweights));
  }

  async setWithdrawalFee(fee: number) {
    return this.sendTx(this.contract.methods.setWithdrawalFee(fee));
  }

  async strategies() {
    return this.callTx(this.contract.methods.strategies());
  }

  async supportsInterface(interfaceId: string) {
    return this.callTx(this.contract.methods.supportsInterface(interfaceId));
  }

  async symbol() {
    return this.callTx(this.contract.methods.symbol());
  }

  async tokenPerAsset() {
    return this.callTx(this.contract.methods.tokenPerAsset());
  }

  async totalAssets() {
    return this.callTx(this.contract.methods.totalAssets());
  }

  async totalSupply() {
    return this.callTx(this.contract.methods.totalSupply());
  }

  async totalWeight() {
    return this.callTx(this.contract.methods.totalWeight());
  }

  async transfer(to: string, amount: number) {
    return this.sendTx(this.contract.methods.transfer(to, amount));
  }

  async transferFrom(from: string, to: string, amount: number) {
    return this.sendTx(this.contract.methods.transferFrom(from, to, amount));
  }

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async unpause() {
    return this.sendTx(this.contract.methods.unpause());
  }

  async weights() {
    return this.callTx(this.contract.methods.weights());
  }

  async withdraw(assets: number, receiver: string, holder: string) {
    return this.sendTx(this.contract.methods.withdraw(assets, receiver, holder));
  }

  async withdrawNative(assets: number) {
    return this.sendTx(this.contract.methods.withdrawNative(assets));
  }

  async getAccountWhiteListEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.AccountWhiteListEvent> {
    return this.contract.self.getPastEvents('AccountWhiteList', filter);
  }

  async getAddStrategyEvents(filter: PastEventOptions): XPromiseEvent<Events.AddStrategyEvent> {
    return this.contract.self.getPastEvents('AddStrategy', filter);
  }

  async getApprovalEvents(filter: PastEventOptions): XPromiseEvent<Events.ApprovalEvent> {
    return this.contract.self.getPastEvents('Approval', filter);
  }

  async getDepositEvents(filter: PastEventOptions): XPromiseEvent<Events.DepositEvent> {
    return this.contract.self.getPastEvents('Deposit', filter);
  }

  async getFeeReceiverChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.FeeReceiverChangedEvent> {
    return this.contract.self.getPastEvents('FeeReceiverChanged', filter);
  }

  async getInitializedEvents(filter: PastEventOptions): XPromiseEvent<Events.InitializedEvent> {
    return this.contract.self.getPastEvents('Initialized', filter);
  }

  async getMaxDepositChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.MaxDepositChangedEvent> {
    return this.contract.self.getPastEvents('MaxDepositChanged', filter);
  }

  async getMaxDifferenceUpdatedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.MaxDifferenceUpdatedEvent> {
    return this.contract.self.getPastEvents('MaxDifferenceUpdated', filter);
  }

  async getOwnershipTransferStartedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.OwnershipTransferStartedEvent> {
    return this.contract.self.getPastEvents('OwnershipTransferStarted', filter);
  }

  async getOwnershipTransferredEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.OwnershipTransferredEvent> {
    return this.contract.self.getPastEvents('OwnershipTransferred', filter);
  }

  async getPausedEvents(filter: PastEventOptions): XPromiseEvent<Events.PausedEvent> {
    return this.contract.self.getPastEvents('Paused', filter);
  }

  async getPerformanceFeeChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.PerformanceFeeChangedEvent> {
    return this.contract.self.getPastEvents('PerformanceFeeChanged', filter);
  }

  async getRemoveStrategyEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.RemoveStrategyEvent> {
    return this.contract.self.getPastEvents('RemoveStrategy', filter);
  }

  async getRoleAdminChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.RoleAdminChangedEvent> {
    return this.contract.self.getPastEvents('RoleAdminChanged', filter);
  }

  async getRoleGrantedEvents(filter: PastEventOptions): XPromiseEvent<Events.RoleGrantedEvent> {
    return this.contract.self.getPastEvents('RoleGranted', filter);
  }

  async getRoleRevokedEvents(filter: PastEventOptions): XPromiseEvent<Events.RoleRevokedEvent> {
    return this.contract.self.getPastEvents('RoleRevoked', filter);
  }

  async getTransferEvents(filter: PastEventOptions): XPromiseEvent<Events.TransferEvent> {
    return this.contract.self.getPastEvents('Transfer', filter);
  }

  async getUnpausedEvents(filter: PastEventOptions): XPromiseEvent<Events.UnpausedEvent> {
    return this.contract.self.getPastEvents('Unpaused', filter);
  }

  async getWeightsUpdatedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.WeightsUpdatedEvent> {
    return this.contract.self.getPastEvents('WeightsUpdated', filter);
  }

  async getWithdrawEvents(filter: PastEventOptions): XPromiseEvent<Events.WithdrawEvent> {
    return this.contract.self.getPastEvents('Withdraw', filter);
  }

  async getWithdrawalFeeChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.WithdrawalFeeChangedEvent> {
    return this.contract.self.getPastEvents('WithdrawalFeeChanged', filter);
  }
}
