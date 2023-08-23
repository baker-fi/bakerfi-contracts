import {Model, Web3Connection, Web3ConnectionOptions, Deployable, XPromiseEvent} from '@taikai/dappkit';

import AAVEv3StrategyJson from '../../../../artifacts/contracts/core/AAVEv3Strategy.sol/AAVEv3Strategy.json';
import { AAVEv3StrategyMethods } from 'src/contracts/laundromat/interfaces/aave-v3-strategy';
import * as Events from 'src/contracts/laundromat/events/aave-v3-strategy'
import {PastEventOptions} from 'web3-eth-contract';
import {AbiItem} from 'web3-utils';

export class AAVEv3Strategy extends Model<AAVEv3StrategyMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, AAVEv3StrategyJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(owner: string, registry: string) {
    const deployOptions = {
      data: AAVEv3StrategyJson.bytecode,
      arguments: [
        owner, registry
      ]
    }
    return this.deploy(deployOptions, this.connection.Account);
  }

    async _convertETHInWSt(amountIn: number) { 
    return this.callTx(this.contract.methods._convertETHInWSt(amountIn));
  }

  async _convertWstInETH(amountIn: number) { 
    return this.callTx(this.contract.methods._convertWstInETH(amountIn));
  }


  async exit() { 
    return this.sendTx(this.contract.methods.exit());
  }

  async getPosition() { 
    return this.callTx(this.contract.methods.getPosition());
  }

  async harvest() { 
    return this.sendTx(this.contract.methods.harvest());
  }

  async onFlashLoan(initiator: string, token: string, amount: number, fee: number, callData: string) { 
    return this.sendTx(this.contract.methods.onFlashLoan(initiator, token, amount, fee, callData));
  }

  async owner() { 
    return this.callTx(this.contract.methods.owner());
  }

  async renounceOwnership() { 
    return this.sendTx(this.contract.methods.renounceOwnership());
  }

  async totalAssets() { 
    return this.callTx(this.contract.methods.totalAssets());
  }

  async transferOwnership(newOwner: string) { 
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async getOwnershipTransferredEvents(filter: PastEventOptions): XPromiseEvent<Events.OwnershipTransferredEvent> {
    return this.contract.self.getPastEvents('OwnershipTransferred', filter);
  }

  async getStrategyLossEvents(filter: PastEventOptions): XPromiseEvent<Events.StrategyLossEvent> {
    return this.contract.self.getPastEvents('StrategyLoss', filter);
  }

  async getStrategyProfitEvents(filter: PastEventOptions): XPromiseEvent<Events.StrategyProfitEvent> {
    return this.contract.self.getPastEvents('StrategyProfit', filter);
  }

}