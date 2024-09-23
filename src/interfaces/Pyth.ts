import { ContractSendMethod } from 'web3-eth-contract';
import { ContractCallMethod } from '@taikai/dappkit';

export interface IPythMethods {
  getEmaPrice(
    id: string,
  ): ContractCallMethod<{ price: number; conf: number; expo: number; publishTime: number }>;

  getEmaPriceNoOlderThan(
    id: string,
    age: number,
  ): ContractCallMethod<{ price: number; conf: number; expo: number; publishTime: number }>;

  getEmaPriceUnsafe(
    id: string,
  ): ContractCallMethod<{ price: number; conf: number; expo: number; publishTime: number }>;

  getPrice(
    id: string,
  ): ContractCallMethod<{ price: number; conf: number; expo: number; publishTime: number }>;

  getPriceNoOlderThan(
    id: string,
    age: number,
  ): ContractCallMethod<{ price: number; conf: number; expo: number; publishTime: number }>;

  getPriceUnsafe(
    id: string,
  ): ContractCallMethod<{ price: number; conf: number; expo: number; publishTime: number }>;

  getUpdateFee(updateData: string[]): ContractCallMethod<{ feeAmount: number }>;

  getValidTimePeriod(): ContractCallMethod<{ validTimePeriod: number }>;

  parsePriceFeedUpdates(
    updateData: string[],
    priceIds: string[],
    minPublishTime: number,
    maxPublishTime: number,
  ): ContractSendMethod;

  parsePriceFeedUpdatesUnique(
    updateData: string[],
    priceIds: string[],
    minPublishTime: number,
    maxPublishTime: number,
  ): ContractSendMethod;

  updatePriceFeeds(updateData: string[]): ContractSendMethod;

  updatePriceFeedsIfNecessary(
    updateData: string[],
    priceIds: string[],
    publishTimes: number[],
  ): ContractSendMethod;
}
