import {Model, Web3Connection, Web3ConnectionOptions, Deployable, XPromiseEvent} from '@taikai/dappkit';

import LaundromatVaultJson from '../../../../artifacts/contracts/core/LaundromatVault.sol/LaundromatVault.json';
import { LaundromatVaultMethods } from 'src/contracts/laundromat/interfaces/laundromat-vault';
import * as Events from 'src/contracts/laundromat/events/laundromat-vault'
import {PastEventOptions} from 'web3-eth-contract';
import {AbiItem} from 'web3-utils';

export class LaundromatVault extends Model<LaundromatVaultMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, LaundromatVaultJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(owner: string, registry: string, strategy: string) {
    const deployOptions = {
      data: LaundromatVaultJson.bytecode,
      arguments: [
        owner, registry, strategy
      ]
    }
    return this.deploy(deployOptions, this.connection.Account);
  }

    async DOMAIN_SEPARATOR() { 
    return this.callTx(this.contract.methods.DOMAIN_SEPARATOR());
  }

  async _registry() { 
    return this.callTx(this.contract.methods._registry());
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

  async deposit(receiver: string, value: bigint) { 
    return this.sendTx(this.contract.methods.deposit(receiver), value);
  }

  async eip712Domain() { 
    return this.callTx(this.contract.methods.eip712Domain());
  }

  async harvest() { 
    return this.sendTx(this.contract.methods.harvest());
  }

  async increaseAllowance(spender: string, addedValue: number) { 
    return this.sendTx(this.contract.methods.increaseAllowance(spender, addedValue));
  }

  async loanToValue() { 
    return this.callTx(this.contract.methods.loanToValue());
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

  async renounceOwnership() { 
    return this.sendTx(this.contract.methods.renounceOwnership());
  }

  async symbol() { 
    return this.callTx(this.contract.methods.symbol());
  }

  async tokenPerETh() { 
    return this.callTx(this.contract.methods.tokenPerETh());
  }

  async totalCollateral() { 
    return this.callTx(this.contract.methods.totalCollateral());
  }

  async totalDebt() { 
    return this.callTx(this.contract.methods.totalDebt());
  }

  async totalPosition() { 
    return this.callTx(this.contract.methods.totalPosition());
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

  async withdraw(shares: number, receiver: string) { 
    return this.sendTx(this.contract.methods.withdraw(shares, receiver));
  }

  async getApprovalEvents(filter: PastEventOptions): XPromiseEvent<Events.ApprovalEvent> {
    return this.contract.self.getPastEvents('Approval', filter);
  }

  async getDepositEvents(filter: PastEventOptions): XPromiseEvent<Events.DepositEvent> {
    return this.contract.self.getPastEvents('Deposit', filter);
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