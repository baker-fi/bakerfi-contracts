/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  ICurveRouterNG,
  ICurveRouterNGInterface,
} from '../../../../contracts/interfaces/curve/ICurveRouterNG';

const _abi = [
  {
    inputs: [
      {
        internalType: 'address[11]',
        name: 'route',
        type: 'address[11]',
      },
      {
        internalType: 'uint256[5][5]',
        name: 'swapParams',
        type: 'uint256[5][5]',
      },
      {
        internalType: 'uint256',
        name: 'amountIn',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'amountOutMin',
        type: 'uint256',
      },
      {
        internalType: 'address[5]',
        name: 'pools',
        type: 'address[5]',
      },
      {
        internalType: 'address',
        name: 'receiverAddress',
        type: 'address',
      },
    ],
    name: 'exchange',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[11]',
        name: 'route',
        type: 'address[11]',
      },
      {
        internalType: 'uint256[5][5]',
        name: 'swapParams',
        type: 'uint256[5][5]',
      },
      {
        internalType: 'uint256',
        name: 'amountOut',
        type: 'uint256',
      },
      {
        internalType: 'address[5]',
        name: 'pools',
        type: 'address[5]',
      },
      {
        internalType: 'address[5]',
        name: 'basePools',
        type: 'address[5]',
      },
      {
        internalType: 'address[5]',
        name: 'baseTokens',
        type: 'address[5]',
      },
    ],
    name: 'get_dx',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[11]',
        name: 'route',
        type: 'address[11]',
      },
      {
        internalType: 'uint256[5][5]',
        name: 'swapParams',
        type: 'uint256[5][5]',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'address[5]',
        name: 'pools',
        type: 'address[5]',
      },
    ],
    name: 'get_dy',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export class ICurveRouterNG__factory {
  static readonly abi = _abi;
  static createInterface(): ICurveRouterNGInterface {
    return new Interface(_abi) as ICurveRouterNGInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): ICurveRouterNG {
    return new Contract(address, _abi, runner) as unknown as ICurveRouterNG;
  }
}
