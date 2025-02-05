/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  IStrategyLeverage,
  IStrategyLeverageInterface,
} from '../../../../contracts/interfaces/core/IStrategyLeverage';

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'newDeployment',
        type: 'uint256',
      },
    ],
    name: 'StrategyAmountUpdate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'StrategyDeploy',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'StrategyLoss',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'StrategyProfit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'StrategyUndeploy',
    type: 'event',
  },
  {
    inputs: [],
    name: 'asset',
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
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'deploy',
    outputs: [
      {
        internalType: 'uint256',
        name: 'deployedAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCollateralAsset',
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
    name: 'getDebAsset',
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
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'maxAge',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxConf',
            type: 'uint256',
          },
        ],
        internalType: 'struct IOracle.PriceOptions',
        name: 'priceOptions',
        type: 'tuple',
      },
    ],
    name: 'getPosition',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalCollateralInUSD',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalDebtInUSD',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'loanToValue',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'harvest',
    outputs: [
      {
        internalType: 'int256',
        name: 'balanceChange',
        type: 'int256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [
      {
        internalType: 'uint256',
        name: 'assets',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'undeploy',
    outputs: [
      {
        internalType: 'uint256',
        name: 'undeployedAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export class IStrategyLeverage__factory {
  static readonly abi = _abi;
  static createInterface(): IStrategyLeverageInterface {
    return new Interface(_abi) as IStrategyLeverageInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): IStrategyLeverage {
    return new Contract(address, _abi, runner) as unknown as IStrategyLeverage;
  }
}
