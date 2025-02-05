/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  IFlashLoanRecipient,
  IFlashLoanRecipientInterface,
} from '../../../../../contracts/interfaces/balancer/IFlashLoan.sol/IFlashLoanRecipient';

const _abi = [
  {
    inputs: [
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
        internalType: 'uint256[]',
        name: 'feeAmounts',
        type: 'uint256[]',
      },
      {
        internalType: 'bytes',
        name: 'userData',
        type: 'bytes',
      },
    ],
    name: 'receiveFlashLoan',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export class IFlashLoanRecipient__factory {
  static readonly abi = _abi;
  static createInterface(): IFlashLoanRecipientInterface {
    return new Interface(_abi) as IFlashLoanRecipientInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): IFlashLoanRecipient {
    return new Contract(address, _abi, runner) as unknown as IFlashLoanRecipient;
  }
}
