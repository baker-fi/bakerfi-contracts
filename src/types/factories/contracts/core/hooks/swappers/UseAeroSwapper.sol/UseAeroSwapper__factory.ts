/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  UseAeroSwapper,
  UseAeroSwapperInterface,
} from '../../../../../../contracts/core/hooks/swappers/UseAeroSwapper.sol/UseAeroSwapper';

const _abi = [
  {
    inputs: [],
    name: 'FailedToApproveAllowanceForSwapRouter',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAeroRouterContract',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOutputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SwapFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'aeroRouter',
    outputs: [
      {
        internalType: 'contract ISwapRouter',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class UseAeroSwapper__factory {
  static readonly abi = _abi;
  static createInterface(): UseAeroSwapperInterface {
    return new Interface(_abi) as UseAeroSwapperInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): UseAeroSwapper {
    return new Contract(address, _abi, runner) as unknown as UseAeroSwapper;
  }
}
