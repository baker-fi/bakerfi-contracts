import {Model, Web3Connection, Web3ConnectionOptions, Deployable, XPromiseEvent} from '@taikai/dappkit';

import UniV3SwapperJson from '../../../../artifacts/contracts/core/swappers/UniV3Swapper.sol/UniV3Swapper.json';
import { UniV3SwapperMethods } from 'src/contracts/laundromat/interfaces/uni-v3-swapper';
import * as Events from 'src/contracts/laundromat/events/uni-v3-swapper'
import {PastEventOptions} from 'web3-eth-contract';
import {AbiItem} from 'web3-utils';

export class UniV3Swapper extends Model<UniV3SwapperMethods> implements Deployable {
  constructor(web3Connection: Web3Connection|Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, UniV3SwapperJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi(registry: string, owner: string) {
    const deployOptions = {
      data: UniV3SwapperJson.bytecode,
      arguments: [
        registry, owner
      ]
    }
    return this.deploy(deployOptions, this.connection.Account);
  }

    async addFeeTier(fromToken: string, toToken: string, fee: number) { 
    return this.sendTx(this.contract.methods.addFeeTier(fromToken, toToken, fee));
  }

  async executeSwap(params: {'params': { 'underlyingIn': string;'underlyingOut': string;'mode': number;'amountIn': number;'amountOut': number;'payload': string; };}) { 
    return this.sendTx(this.contract.methods.executeSwap(params));
  }

  async getFeeTier(fromToken: string, toToken: string) { 
    return this.callTx(this.contract.methods.getFeeTier(fromToken, toToken));
  }

  async owner() { 
    return this.callTx(this.contract.methods.owner());
  }

  async removeFeeTier(fromToken: string, toToken: string) { 
    return this.sendTx(this.contract.methods.removeFeeTier(fromToken, toToken));
  }

  async renounceOwnership() { 
    return this.sendTx(this.contract.methods.renounceOwnership());
  }

  async transferOwnership(newOwner: string) { 
    return this.sendTx(this.contract.methods.transferOwnership(newOwner));
  }

  async getOwnershipTransferredEvents(filter: PastEventOptions): XPromiseEvent<Events.OwnershipTransferredEvent> {
    return this.contract.self.getPastEvents('OwnershipTransferred', filter);
  }

  async getSwapEvents(filter: PastEventOptions): XPromiseEvent<Events.SwapEvent> {
    return this.contract.self.getPastEvents('Swap', filter);
  }

}