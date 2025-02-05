/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type { UseAAVEv3, UseAAVEv3Interface } from '../../../../contracts/core/hooks/UseAAVEv3';

const _abi = [
  {
    inputs: [],
    name: 'InvalidAAVEv3Contract',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
] as const;

export class UseAAVEv3__factory {
  static readonly abi = _abi;
  static createInterface(): UseAAVEv3Interface {
    return new Interface(_abi) as UseAAVEv3Interface;
  }
  static connect(address: string, runner?: ContractRunner | null): UseAAVEv3 {
    return new Contract(address, _abi, runner) as unknown as UseAAVEv3;
  }
}
