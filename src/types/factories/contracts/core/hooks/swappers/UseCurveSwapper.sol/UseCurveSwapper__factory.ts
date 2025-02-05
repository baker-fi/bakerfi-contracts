/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  UseCurveSwapper,
  UseCurveSwapperInterface,
} from '../../../../../../contracts/core/hooks/swappers/UseCurveSwapper.sol/UseCurveSwapper';

const _abi = [
  {
    inputs: [],
    name: 'FailedToApproveAllowance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidCurveRouterContract',
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
    name: 'ETH_ADDRESS',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'curveRouter',
    outputs: [
      {
        internalType: 'contract ICurveRouterNG',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class UseCurveSwapper__factory {
  static readonly abi = _abi;
  static createInterface(): UseCurveSwapperInterface {
    return new Interface(_abi) as UseCurveSwapperInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): UseCurveSwapper {
    return new Contract(address, _abi, runner) as unknown as UseCurveSwapper;
  }
}
