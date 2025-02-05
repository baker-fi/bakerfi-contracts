/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  IERC6372,
  IERC6372Interface,
} from '../../../../@openzeppelin/contracts/interfaces/IERC6372';

const _abi = [
  {
    inputs: [],
    name: 'CLOCK_MODE',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'clock',
    outputs: [
      {
        internalType: 'uint48',
        name: '',
        type: 'uint48',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class IERC6372__factory {
  static readonly abi = _abi;
  static createInterface(): IERC6372Interface {
    return new Interface(_abi) as IERC6372Interface;
  }
  static connect(address: string, runner?: ContractRunner | null): IERC6372 {
    return new Contract(address, _abi, runner) as unknown as IERC6372;
  }
}
