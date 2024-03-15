import {Model, Web3Connection, Web3ConnectionOptions, Deployable, XPromiseEvent} from '@taikai/dappkit';

import BakerFiVaultJson from '../../artifacts/contracts/core/Vault.sol/Vault.json';
import { BakerFiVaultMethods } from '@interfaces/Vault';
import * as Events from '@events/Vault'
import {PastEventOptions} from 'web3-eth-contract';
import {AbiItem} from 'web3-utils';

export class Vault extends Model<BakerFiVaultMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, BakerFiVaultJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(initialOwner: string, registry: string, strategy: string) {
    const deployOptions = {
      data: BakerFiVaultJson.bytecode,
      arguments: [
        initialOwner, registry, strategy
      ]
    }
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

  async deposit(receiver: string) { 
    return this.sendTx(this.contract.methods.deposit(receiver));
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

  async permit(owner: string, spender: string, value: number, deadline: number, v: number, r: string, s: string) { 
    return this.sendTx(this.contract.methods.permit(owner, spender, value, deadline, v, r, s));
  }

  async rebalance() { 
    return this.sendTx(this.contract.methods.rebalance());
  }

  async renounceOwnership() { 
    return this.sendTx(this.contract.methods.renounceOwnership());
  }

  async settings() { 
    return this.callTx(this.contract.methods.settings());
  }

  async settingsA() { 
    return this.callTx(this.contract.methods.settingsA());
  }

  async symbol() { 
    return this.callTx(this.contract.methods.symbol());
  }

  async tokenPerETH() { 
    return this.callTx(this.contract.methods.tokenPerETH());
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

  async withdraw(shares: number) { 
    return this.sendTx(this.contract.methods.withdraw(shares));
  }

  async getApprovalEvents(filter: PastEventOptions): XPromiseEvent<Events.ApprovalEvent> {
    return this.contract.self.getPastEvents('Approval', filter);
  }

  async getDepositEvents(filter: PastEventOptions): XPromiseEvent<Events.DepositEvent> {
    return this.contract.self.getPastEvents('Deposit', filter);
  }

  async getEIP712DomainChangedEvents(filter: PastEventOptions): XPromiseEvent<Events.EIP712DomainChangedEvent> {
    return this.contract.self.getPastEvents('EIP712DomainChanged', filter);
  }

  async getOwnershipTransferredEvents(filter: PastEventOptions): XPromiseEvent<Events.OwnershipTransferredEvent> {
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

}