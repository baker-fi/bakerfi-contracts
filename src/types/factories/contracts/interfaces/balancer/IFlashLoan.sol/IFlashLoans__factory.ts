/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  IFlashLoans,
  IFlashLoansInterface,
} from '../../../../../contracts/interfaces/balancer/IFlashLoan.sol/IFlashLoans';

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'recipient',
        type: 'address',
      },
      {
        internalType: 'address[]',
        name: 'tokens',
        type: 'address[]',
      },
      {
        internalType: 'uint256[]',
        name: 'amounts',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes',
        name: 'userData',
        type: 'bytes',
      },
    ],
    name: 'flashLoan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export class IFlashLoans__factory {
  static readonly abi = _abi;
  static createInterface(): IFlashLoansInterface {
    return new Interface(_abi) as IFlashLoansInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): IFlashLoans {
    return new Contract(address, _abi, runner) as unknown as IFlashLoans;
  }
}
