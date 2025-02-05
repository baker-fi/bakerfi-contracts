/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  IPythEvents,
  IPythEventsInterface,
} from '../../../../contracts/interfaces/pyth/IPythEvents';

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint16',
        name: 'chainId',
        type: 'uint16',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'sequenceNumber',
        type: 'uint64',
      },
    ],
    name: 'BatchPriceFeedUpdate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'publishTime',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'int64',
        name: 'price',
        type: 'int64',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'conf',
        type: 'uint64',
      },
    ],
    name: 'PriceFeedUpdate',
    type: 'event',
  },
] as const;

export class IPythEvents__factory {
  static readonly abi = _abi;
  static createInterface(): IPythEventsInterface {
    return new Interface(_abi) as IPythEventsInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): IPythEvents {
    return new Contract(address, _abi, runner) as unknown as IPythEvents;
  }
}
