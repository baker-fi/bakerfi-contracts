/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, ContractFactory, ContractTransactionResponse, Interface } from 'ethers';
import type { Signer, ContractDeployTransaction, ContractRunner } from 'ethers';
import type { NonPayableOverrides } from '../../../common';
import type { OracleMock, OracleMockInterface } from '../../../contracts/mocks/OracleMock';

const _abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'PriceOutdated',
    type: 'error',
  },
  {
    inputs: [],
    name: 'getLatestPrice',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'lastUpdate',
            type: 'uint256',
          },
        ],
        internalType: 'struct IOracle.Price',
        name: 'price',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPrecision',
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
        name: 'options',
        type: 'tuple',
      },
    ],
    name: 'getSafeLatestPrice',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'lastUpdate',
            type: 'uint256',
          },
        ],
        internalType: 'struct IOracle.Price',
        name: 'price',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'decimals',
        type: 'uint8',
      },
    ],
    name: 'setDecimals',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'exchangeRate',
        type: 'uint256',
      },
    ],
    name: 'setLatestPrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

const _bytecode =
  '0x608060405263435a6e80600055600960025534801561001d57600080fd5b5042600155610351806100316000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c806304341d991461005c5780637a1395aa1461008f5780638e15f473146100a75780639670c0bc146100c3578063fc9bb7fe146100d9575b600080fd5b61006f61006a36600461015c565b6100f0565b604080518251815260209283015192810192909252015b60405180910390f35b6100a561009d3660046101b9565b60ff16600255565b005b604080518082019091526000548152600154602082015261006f565b6100cb610146565b604051908152602001610086565b6100a56100e73660046101e3565b60005542600155565b604080518082019091526000548152600154602082018190528251906101169042610212565b1180156101235750815115155b1561014157604051633baab38160e01b815260040160405180910390fd5b919050565b6000600254600a610157919061030f565b905090565b60006040828403121561016e57600080fd5b6040516040810181811067ffffffffffffffff8211171561019f57634e487b7160e01b600052604160045260246000fd5b604052823581526020928301359281019290925250919050565b6000602082840312156101cb57600080fd5b813560ff811681146101dc57600080fd5b9392505050565b6000602082840312156101f557600080fd5b5035919050565b634e487b7160e01b600052601160045260246000fd5b81810381811115610225576102256101fc565b92915050565b600181815b8085111561026657816000190482111561024c5761024c6101fc565b8085161561025957918102915b93841c9390800290610230565b509250929050565b60008261027d57506001610225565b8161028a57506000610225565b81600181146102a057600281146102aa576102c6565b6001915050610225565b60ff8411156102bb576102bb6101fc565b50506001821b610225565b5060208310610133831016604e8410600b84101617156102e9575081810a610225565b6102f3838361022b565b8060001904821115610307576103076101fc565b029392505050565b60006101dc838361026e56fea2646970667358221220969b335bb19dc1111b39309087dc88e35ff83a81ee27d47e2249215ea9eb8ef564736f6c63430008180033';

type OracleMockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: OracleMockConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class OracleMock__factory extends ContractFactory {
  constructor(...args: OracleMockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string },
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      OracleMock & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): OracleMock__factory {
    return super.connect(runner) as OracleMock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): OracleMockInterface {
    return new Interface(_abi) as OracleMockInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): OracleMock {
    return new Contract(address, _abi, runner) as unknown as OracleMock;
  }
}
