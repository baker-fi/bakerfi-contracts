import {
  Model,
  Web3Connection,
  Web3ConnectionOptions,
  Deployable,
  XPromiseEvent,
} from '@taikai/dappkit';

import VaultRouterJson from '../../artifacts/contracts/core/VaultRouter.sol/VaultRouter.json';
import { VaultRouterMethods } from 'src/interfaces/VaultRouter';
import * as Events from 'src/events/VaultRouter';
import { PastEventOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { RouterCommand } from 'src/interfaces/VaultRouter';
export class VaultRouter extends Model<VaultRouterMethods> implements Deployable {
  constructor(web3Connection: Web3Connection | Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, VaultRouterJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi() {
    const deployOptions = {
      data: VaultRouterJson.bytecode,
      arguments: [],
    };
    return this.deploy(deployOptions, this.connection.Account);
  }

  async acceptOwnership() {
    return this.sendTx(this.contract.methods.acceptOwnership());
  }

  async approveTokenForVault(vault: string, token: string) {
    return this.sendTx(this.contract.methods.approveTokenForVault(vault, token));
  }

  async approveTokenToSwap(token: string) {
    return this.sendTx(this.contract.methods.approveTokenToSwap(token));
  }

  async execute(commands: RouterCommand[]) {
    return this.sendTx(this.contract.methods.execute(commands));
  }

  async initialize(initialOwner: string, router: string, weth: string) {
    return this.sendTx(this.contract.methods.initialize(initialOwner, router, weth));
  }

  async isTokenApprovedForVault(vault: string, token: string) {
    return this.callTx(this.contract.methods.isTokenApprovedForVault(vault, token));
  }

  async isTokenApprovedToSwap(token: string) {
    return this.callTx(this.contract.methods.isTokenApprovedToSwap(token));
  }

  async owner() {
    return this.callTx(this.contract.methods.owner());
  }

  async pendingOwner() {
    return this.callTx(this.contract.methods.pendingOwner());
  }

  async renounceOwnership() {
    return this.sendTx(this.contract.methods.renounceOwnership());
  }

  async transferOwnership(newOwner: string) {
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async unapproveTokenForVault(vault: string, token: string) {
    return this.sendTx(this.contract.methods.unapproveTokenForVault(vault, token));
  }

  async unapproveTokenToSwap(token: string) {
    return this.sendTx(this.contract.methods.unapproveTokenToSwap(token));
  }

  async getInitializedEvents(filter: PastEventOptions): XPromiseEvent<Events.InitializedEvent> {
    return this.contract.self.getPastEvents('Initialized', filter);
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

  async getSwapEvents(filter: PastEventOptions): XPromiseEvent<Events.SwapEvent> {
    return this.contract.self.getPastEvents('Swap', filter);
  }
}
