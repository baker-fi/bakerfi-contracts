import {
  Model,
  Web3Connection,
  Web3ConnectionOptions,
  Deployable,
  XPromiseEvent,
} from '@taikai/dappkit';

import BakerFiVaultJson from '../../artifacts/contracts/core/Vault.sol/Vault.json';
import { VaultMethods } from '@interfaces/Vault';
import * as Events from '@events/Vault';
import { PastEventOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

export class Vault extends Model<VaultMethods> implements Deployable {
  constructor(web3Connection: Web3Connection | Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, BakerFiVaultJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(initialOwner: string, registry: string, strategy: string) {
    const deployOptions = {
      data: BakerFiVaultJson.bytecode,
      arguments: [initialOwner, registry, strategy],
    };
    return this.deploy(deployOptions, this.connection.Account);
  }

  async DOMAIN_SEPARATOR() {
    return this.callTx(this.contract.methods.DOMAIN_SEPARATOR());
  }

  async allowance(owner: string, spender: string) {
    return this.callTx(this.contract.methods.allowance(owner, spender));
  }

  async approve(spender: string, amount: number) {
    return this.sendTx(this.contract.methods.approve(spender, amount));
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

  async depositNative(receiver: string, value: number) {
    return this.sendTx(this.contract.methods.depositNative(receiver), value);
  }

  async eip712Domain() {
    return this.callTx(this.contract.methods.eip712Domain());
  }

  async increaseAllowance(spender: string, addedValue: number) {
    return this.sendTx(this.contract.methods.increaseAllowance(spender, addedValue));
  }

  async name() {
    return this.callTx(this.contract.methods.name());
  }

  async nonces(owner: string) {
    return this.callTx(this.contract.methods.nonces(owner));
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async paused() {
    return this.callTx(this.contract.methods.paused());
  }

  async permit(
    owner: string,
    spender: string,
    value: number,
    deadline: number,
    v: number,
    r: string,
    s: string,
  ) {
    return this.sendTx(this.contract.methods.permit(owner, spender, value, deadline, v, r, s));
  }

  async rebalance() {
    return this.sendTx(this.contract.methods.rebalance());
  }

  async renounceOwnership() {
    return this.sendTx(this.contract.methods.renounceOwnership());
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

  async transfer(to: string, amount: number) {
    return this.sendTx(this.contract.methods.transfer(to, amount));
  }

  async transferFrom(from: string, to: string, amount: number) {
    return this.sendTx(this.contract.methods.transferFrom(from, to, amount));
  }

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async redeemNative(shares: number) {
    return this.sendTx(this.contract.methods.redeemNative(shares));
  }

  async maxDeposit(receiver: string) {
    return this.callTx(this.contract.methods.maxDeposit(receiver));
  }

  async previewDeposit(assets: number) {
    return this.callTx(this.contract.methods.previewDeposit(assets));
  }
  async deposit(assets: number, receiver: string) {
    return this.sendTx(this.contract.methods.deposit(assets, receiver));
  }

  async maxMint(receiver: string) {
    return this.callTx(this.contract.methods.maxMint(receiver));
  }

  async previewMint(shares: number) {
    return this.callTx(this.contract.methods.previewMint(shares));
  }

  async mint(shares: number, receiver: string) {
    return this.sendTx(this.contract.methods.mint(shares, receiver));
  }

  async maxWithdraw(owner: string) {
    return this.callTx(this.contract.methods.maxWithdraw(owner));
  }

  async previewWithdraw(assets: number) {
    return this.callTx(this.contract.methods.previewWithdraw(assets));
  }

  async withdraw(assets: number, receiver: string, owner: string) {
    return this.sendTx(this.contract.methods.withdraw(assets, receiver, owner));
  }

  async maxRedeem(owner: string) {
    return this.callTx(this.contract.methods.maxRedeem(owner));
  }

  async previewRedeem(shares: number) {
    return this.callTx(this.contract.methods.previewRedeem(shares));
  }

  async redeem(shares: number, receiver: string, owner: string) {
    return this.sendTx(this.contract.methods.redeem(shares, receiver, owner));
  }

  async asset() {
    return this.callTx(this.contract.methods.asset());
  }

  async pause(shares: number) {
    return this.sendTx(this.contract.methods.pause());
  }

  async unpause(shares: number) {
    return this.sendTx(this.contract.methods.unpause());
  }

  async getApprovalEvents(filter: PastEventOptions): XPromiseEvent<Events.ApprovalEvent> {
    return this.contract.self.getPastEvents('Approval', filter);
  }

  async getDepositEvents(filter: PastEventOptions): XPromiseEvent<Events.DepositEvent> {
    return this.contract.self.getPastEvents('Deposit', filter);
  }

  async getEIP712DomainChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.EIP712DomainChangedEvent> {
    return this.contract.self.getPastEvents('EIP712DomainChanged', filter);
  }

  async getOwnershipTransferredEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.OwnershipTransferredEvent> {
    return this.contract.self.getPastEvents('OwnershipTransferred', filter);
  }

  async getPausedEvents(filter: PastEventOptions): XPromiseEvent<Events.PausedEvent> {
    return this.contract.self.getPastEvents('Paused', filter);
  }

  async getTransferEvents(filter: PastEventOptions): XPromiseEvent<Events.TransferEvent> {
    return this.contract.self.getPastEvents('Transfer', filter);
  }

  async getUnpausedEvents(filter: PastEventOptions): XPromiseEvent<Events.UnpausedEvent> {
    return this.contract.self.getPastEvents('Unpaused', filter);
  }

  async getWithdrawEvents(filter: PastEventOptions): XPromiseEvent<Events.WithdrawEvent> {
    return this.contract.self.getPastEvents('Withdraw', filter);
  }

  async getFeeReceiverChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.FeeReceiverChangedEvent> {
    return this.contract.self.getPastEvents('FeeReceiverChanged', filter);
  }

  async getPerformanceFeeChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.PerformanceFeeChangedEvent> {
    return this.contract.self.getPastEvents('PerformanceFeeChanged', filter);
  }

  async getWithdrawalFeeChangedEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.WithdrawalFeeChangedEvent> {
    return this.contract.self.getPastEvents('WithdrawalFeeChanged', filter);
  }

  async getAccountWhiteListEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.AccountWhiteListEvent> {
    return this.contract.self.getPastEvents('AccountWhiteList', filter);
  }

  async getFeeReceiver() {
    return this.callTx(this.contract.methods.getFeeReceiver());
  }

  async getPerformanceFee() {
    return this.callTx(this.contract.methods.getPerformanceFee());
  }

  async getWithdrawalFee() {
    return this.callTx(this.contract.methods.getWithdrawalFee());
  }

  async setFeeReceiver(receiver: string) {
    return this.sendTx(this.contract.methods.setFeeReceiver(receiver));
  }

  async setPerformanceFee(fee: number) {
    return this.sendTx(this.contract.methods.setPerformanceFee(fee));
  }

  async setWithdrawalFee(fee: number) {
    return this.sendTx(this.contract.methods.setWithdrawalFee(fee));
  }

  async enableAccount(account: string, enabled: boolean) {
    return this.sendTx(this.contract.methods.enableAccount(account, enabled));
  }

  async isAccountEnabled(account: string) {
    return this.callTx(this.contract.methods.isAccountEnabled(account));
  }

  async getMaxDeposit() {
    return this.callTx(this.contract.methods.getMaxDeposit());
  }

  async setMaxDepositIn(amount: number) {
    return this.sendTx(this.contract.methods.setMaxDeposit(amount));
  }
}
