import {
  Model,
  Web3Connection,
  Web3ConnectionOptions,
  Deployable,
  XPromiseEvent,
} from '@taikai/dappkit';

import IPythJson from '../../artifacts/contracts/interfaces/pyth/IPyth.sol/IPyth.json';
import { IPythMethods } from 'src/interfaces/Pyth';
import * as Events from 'src/events/Pyth';
import { PastEventOptions } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

export class Pyth extends Model<IPythMethods> implements Deployable {
  constructor(web3Connection: Web3Connection | Web3ConnectionOptions, contractAddress?: string) {
    super(web3Connection, IPythJson.abi as AbiItem[], contractAddress);
  }

  async deployJsonAbi() {
    const deployOptions = {
      data: IPythJson.bytecode,
      arguments: [],
    };
    return this.deploy(deployOptions, this.connection.Account);
  }

  async getEmaPrice(id: string) {
    return this.callTx(this.contract.methods.getEmaPrice(id));
  }

  async getEmaPriceNoOlderThan(id: string, age: number) {
    return this.callTx(this.contract.methods.getEmaPriceNoOlderThan(id, age));
  }

  async getEmaPriceUnsafe(id: string) {
    return this.callTx(this.contract.methods.getEmaPriceUnsafe(id));
  }

  async getPrice(id: string) {
    return this.callTx(this.contract.methods.getPrice(id));
  }

  async getPriceNoOlderThan(id: string, age: number) {
    return this.callTx(this.contract.methods.getPriceNoOlderThan(id, age));
  }

  async getPriceUnsafe(id: string) {
    return this.callTx(this.contract.methods.getPriceUnsafe(id));
  }

  async getUpdateFee(updateData: string[]) {
    return this.callTx(this.contract.methods.getUpdateFee(updateData));
  }

  async getValidTimePeriod() {
    return this.callTx(this.contract.methods.getValidTimePeriod());
  }

  async parsePriceFeedUpdates(
    updateData: string[],
    priceIds: string[],
    minPublishTime: number,
    maxPublishTime: number,
  ) {
    return this.sendTx(
      this.contract.methods.parsePriceFeedUpdates(
        updateData,
        priceIds,
        minPublishTime,
        maxPublishTime,
      ),
    );
  }

  async parsePriceFeedUpdatesUnique(
    updateData: string[],
    priceIds: string[],
    minPublishTime: number,
    maxPublishTime: number,
  ) {
    return this.sendTx(
      this.contract.methods.parsePriceFeedUpdatesUnique(
        updateData,
        priceIds,
        minPublishTime,
        maxPublishTime,
      ),
    );
  }

  async updatePriceFeeds(updateData: string[], fee: number) {
    return this.sendTx(this.contract.methods.updatePriceFeeds(updateData), fee);
  }

  async updatePriceFeedsIfNecessary(
    updateData: string[],
    priceIds: string[],
    publishTimes: number[],
  ) {
    return this.sendTx(
      this.contract.methods.updatePriceFeedsIfNecessary(updateData, priceIds, publishTimes),
    );
  }

  async getBatchPriceFeedUpdateEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.BatchPriceFeedUpdateEvent> {
    return this.contract.self.getPastEvents('BatchPriceFeedUpdate', filter);
  }

  async getPriceFeedUpdateEvents(
    filter: PastEventOptions,
  ): XPromiseEvent<Events.PriceFeedUpdateEvent> {
    return this.contract.self.getPastEvents('PriceFeedUpdate', filter);
  }
}
