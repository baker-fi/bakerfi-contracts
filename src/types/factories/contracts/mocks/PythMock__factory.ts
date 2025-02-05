/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, ContractFactory, ContractTransactionResponse, Interface } from 'ethers';
import type { Signer, ContractDeployTransaction, ContractRunner } from 'ethers';
import type { NonPayableOverrides } from '../../../common';
import type { PythMock, PythMockInterface } from '../../../contracts/mocks/PythMock';

const _abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
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
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'getEmaPrice',
    outputs: [
      {
        components: [
          {
            internalType: 'int64',
            name: 'price',
            type: 'int64',
          },
          {
            internalType: 'uint64',
            name: 'conf',
            type: 'uint64',
          },
          {
            internalType: 'int32',
            name: 'expo',
            type: 'int32',
          },
          {
            internalType: 'uint256',
            name: 'publishTime',
            type: 'uint256',
          },
        ],
        internalType: 'struct PythStructs.Price',
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
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'age',
        type: 'uint256',
      },
    ],
    name: 'getEmaPriceNoOlderThan',
    outputs: [
      {
        components: [
          {
            internalType: 'int64',
            name: 'price',
            type: 'int64',
          },
          {
            internalType: 'uint64',
            name: 'conf',
            type: 'uint64',
          },
          {
            internalType: 'int32',
            name: 'expo',
            type: 'int32',
          },
          {
            internalType: 'uint256',
            name: 'publishTime',
            type: 'uint256',
          },
        ],
        internalType: 'struct PythStructs.Price',
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
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'getEmaPriceUnsafe',
    outputs: [
      {
        components: [
          {
            internalType: 'int64',
            name: 'price',
            type: 'int64',
          },
          {
            internalType: 'uint64',
            name: 'conf',
            type: 'uint64',
          },
          {
            internalType: 'int32',
            name: 'expo',
            type: 'int32',
          },
          {
            internalType: 'uint256',
            name: 'publishTime',
            type: 'uint256',
          },
        ],
        internalType: 'struct PythStructs.Price',
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
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'getPrice',
    outputs: [
      {
        components: [
          {
            internalType: 'int64',
            name: 'price',
            type: 'int64',
          },
          {
            internalType: 'uint64',
            name: 'conf',
            type: 'uint64',
          },
          {
            internalType: 'int32',
            name: 'expo',
            type: 'int32',
          },
          {
            internalType: 'uint256',
            name: 'publishTime',
            type: 'uint256',
          },
        ],
        internalType: 'struct PythStructs.Price',
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
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: 'age',
        type: 'uint256',
      },
    ],
    name: 'getPriceNoOlderThan',
    outputs: [
      {
        components: [
          {
            internalType: 'int64',
            name: 'price',
            type: 'int64',
          },
          {
            internalType: 'uint64',
            name: 'conf',
            type: 'uint64',
          },
          {
            internalType: 'int32',
            name: 'expo',
            type: 'int32',
          },
          {
            internalType: 'uint256',
            name: 'publishTime',
            type: 'uint256',
          },
        ],
        internalType: 'struct PythStructs.Price',
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
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'getPriceUnsafe',
    outputs: [
      {
        components: [
          {
            internalType: 'int64',
            name: 'price',
            type: 'int64',
          },
          {
            internalType: 'uint64',
            name: 'conf',
            type: 'uint64',
          },
          {
            internalType: 'int32',
            name: 'expo',
            type: 'int32',
          },
          {
            internalType: 'uint256',
            name: 'publishTime',
            type: 'uint256',
          },
        ],
        internalType: 'struct PythStructs.Price',
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
        internalType: 'bytes[]',
        name: '',
        type: 'bytes[]',
      },
    ],
    name: 'getUpdateFee',
    outputs: [
      {
        internalType: 'uint256',
        name: 'feeAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getValidTimePeriod',
    outputs: [
      {
        internalType: 'uint256',
        name: 'validTimePeriod',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'updateData',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    name: 'parsePriceFeedUpdates',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'id',
            type: 'bytes32',
          },
          {
            components: [
              {
                internalType: 'int64',
                name: 'price',
                type: 'int64',
              },
              {
                internalType: 'uint64',
                name: 'conf',
                type: 'uint64',
              },
              {
                internalType: 'int32',
                name: 'expo',
                type: 'int32',
              },
              {
                internalType: 'uint256',
                name: 'publishTime',
                type: 'uint256',
              },
            ],
            internalType: 'struct PythStructs.Price',
            name: 'price',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'int64',
                name: 'price',
                type: 'int64',
              },
              {
                internalType: 'uint64',
                name: 'conf',
                type: 'uint64',
              },
              {
                internalType: 'int32',
                name: 'expo',
                type: 'int32',
              },
              {
                internalType: 'uint256',
                name: 'publishTime',
                type: 'uint256',
              },
            ],
            internalType: 'struct PythStructs.Price',
            name: 'emaPrice',
            type: 'tuple',
          },
        ],
        internalType: 'struct PythStructs.PriceFeed[]',
        name: 'priceFeeds',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'updateData',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    name: 'parsePriceFeedUpdatesUnique',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'id',
            type: 'bytes32',
          },
          {
            components: [
              {
                internalType: 'int64',
                name: 'price',
                type: 'int64',
              },
              {
                internalType: 'uint64',
                name: 'conf',
                type: 'uint64',
              },
              {
                internalType: 'int32',
                name: 'expo',
                type: 'int32',
              },
              {
                internalType: 'uint256',
                name: 'publishTime',
                type: 'uint256',
              },
            ],
            internalType: 'struct PythStructs.Price',
            name: 'price',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'int64',
                name: 'price',
                type: 'int64',
              },
              {
                internalType: 'uint64',
                name: 'conf',
                type: 'uint64',
              },
              {
                internalType: 'int32',
                name: 'expo',
                type: 'int32',
              },
              {
                internalType: 'uint256',
                name: 'publishTime',
                type: 'uint256',
              },
            ],
            internalType: 'struct PythStructs.Price',
            name: 'emaPrice',
            type: 'tuple',
          },
        ],
        internalType: 'struct PythStructs.PriceFeed[]',
        name: 'priceFeeds',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'updateData',
        type: 'bytes[]',
      },
    ],
    name: 'updatePriceFeeds',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes[]',
        name: 'updateData',
        type: 'bytes[]',
      },
      {
        internalType: 'bytes32[]',
        name: '',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint64[]',
        name: '',
        type: 'uint64[]',
      },
    ],
    name: 'updatePriceFeedsIfNecessary',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

const _bytecode =
  '0x608060405234801561001057600080fd5b50600060208190527f43fe3676a6c1a13c64dc563c6beb6fa0bb65e3040dfb85adeca46597c1c6fa8980546001600160a01b031990811673fffffffe000000000000000000000000000414bb17909155427f43fe3676a6c1a13c64dc563c6beb6fa0bb65e3040dfb85adeca46597c1c6fa8a8190557f4c64a4d854571d0c3366c01f28d7e1c9873dd7faa917a123faa8fbe9187051f28054831673fffffffe000000000000000000000000000388761790557f4c64a4d854571d0c3366c01f28d7e1c9873dd7faa917a123faa8fbe9187051f38190557f15ecddd26d49e1a8f1de9376ebebc03916ede873447c1255d2d5891b92ce57179092527f07dfce96b504362a4ab5b6e364f256f368e7a8bedbb918248b20b868d3e74a93805490911673fffffffe0000000000000000000000000003bcff1790557f07dfce96b504362a4ab5b6e364f256f368e7a8bedbb918248b20b868d3e74a9455610d0a806101796000396000f3fe6080604052600436106100a75760003560e01c8063accca7f911610064578063accca7f9146100e2578063b5dcc911146100ac578063b9256d2814610142578063d47eed4514610157578063e18910a314610188578063ef9e5e281461019b57600080fd5b806331d98b3f146100ac5780634716e9c5146100e2578063711a2e28146101025780639474f45b146100ac57806396834ad3146100ac578063a4ae35e014610122575b600080fd5b3480156100b857600080fd5b506100cc6100c736600461084d565b6101ae565b6040516100d9919061089b565b60405180910390f35b6100f56100f0366004610910565b610264565b6040516100d9919061099f565b34801561010e57600080fd5b506100cc61011d366004610a0d565b61027b565b34801561012e57600080fd5b506100cc61013d366004610a0d565b610379565b610155610150366004610a2f565b610425565b005b34801561016357600080fd5b5061017a610172366004610ac8565b505060015490565b6040519081526020016100d9565b34801561019457600080fd5b504261017a565b6101556101a9366004610ac8565b610438565b60408051608081018252600080825260208201819052918101829052606081019190915260008281526020819052604081205460070b121561020b5760405162461bcd60e51b815260040161020290610b09565b60405180910390fd5b506000908152602081815260409182902082516080810184528154600781900b82526001600160401b03600160401b82041693820193909352600160801b90920460030b92820192909252600190910154606082015290565b60606102708787610447565b979650505050505050565b60408051608081018252600080825260208201819052918101829052606081019190915260008381526020819052604081205460070b12156102cf5760405162461bcd60e51b815260040161020290610b09565b60008381526020819052604090206001015482111561031c5760405162461bcd60e51b81526020600482015260096024820152684f6c6420507269636560b81b6044820152606401610202565b506000828152602081815260409182902082516080810184528154600781900b82526001600160401b03600160401b82041693820193909352600160801b90920460030b9282019290925260019091015460608201525b92915050565b60408051608081018252600080825260208201819052918101829052606081019190915260008381526020819052604081205460070b12156103cd5760405162461bcd60e51b815260040161020290610b09565b60008381526020819052604090206001015482906103eb9042610b35565b111561031c5760405162461bcd60e51b81526020600482015260096024820152684f6c6420507269636560b81b6044820152606401610202565b61042f8686610447565b50505050505050565b6104428282610447565b505050565b6060816001600160401b0381111561046157610461610b56565b6040519080825280602002602001820160405280156104f157816020015b6104de604080516060808201835260008083528351608081018552818152602081810183905294810182905291820152909182019081526040805160808101825260008082526020828101829052928201819052606082015291015290565b81526020019060019003908161047f5790505b50905060015434101561052f5760405162461bcd60e51b81526020600482015260066024820152654e6f2046656560d01b6044820152606401610202565b60005b828110156108465783838281811061054c5761054c610b6c565b905060200281019061055e9190610b82565b81019061056b9190610c5f565b82828151811061057d5761057d610b6c565b602002602001018190525060008083838151811061059d5761059d610b6c565b6020908102919091018101515182528101919091526040016000205460070b1561083e578181815181106105d3576105d3610b6c565b602002602001015160200151600001516000808484815181106105f8576105f8610b6c565b602002602001015160000151815260200190815260200160002060000160006101000a8154816001600160401b03021916908360070b6001600160401b0316021790555081818151811061064e5761064e610b6c565b6020026020010151602001516040015160008084848151811061067357610673610b6c565b602002602001015160000151815260200190815260200160002060000160106101000a81548163ffffffff021916908360030b63ffffffff1602179055508181815181106106c3576106c3610b6c565b602002602001015160200151602001516000808484815181106106e8576106e8610b6c565b602002602001015160000151815260200190815260200160002060000160086101000a8154816001600160401b0302191690836001600160401b031602179055504260008084848151811061073f5761073f610b6c565b60200260200101516000015181526020019081526020016000206001018190555081818151811061077257610772610b6c565b6020026020010151600001517fd06a6b7f4918494b3719217d1802786c1f5112a6c1d88fe2cfec00b4584f6aec8383815181106107b1576107b1610b6c565b602002602001015160200151606001518484815181106107d3576107d3610b6c565b602002602001015160200151600001518585815181106107f5576107f5610b6c565b60200260200101516020015160200151604051610835939291906001600160401b03938416815260079290920b6020830152909116604082015260600190565b60405180910390a25b600101610532565b5092915050565b60006020828403121561085f57600080fd5b5035919050565b805160070b82526001600160401b036020820151166020830152604081015160030b6040830152606081015160608301525050565b608081016103738284610866565b60008083601f8401126108bb57600080fd5b5081356001600160401b038111156108d257600080fd5b6020830191508360208260051b85010111156108ed57600080fd5b9250929050565b80356001600160401b038116811461090b57600080fd5b919050565b6000806000806000806080878903121561092957600080fd5b86356001600160401b038082111561094057600080fd5b61094c8a838b016108a9565b9098509650602089013591508082111561096557600080fd5b5061097289828a016108a9565b90955093506109859050604088016108f4565b9150610993606088016108f4565b90509295509295509295565b602080825282518282018190526000919060409081850190868401855b82811015610a0057815180518552868101516109da88870182610866565b508501516109eb60a0860182610866565b506101209390930192908501906001016109bc565b5091979650505050505050565b60008060408385031215610a2057600080fd5b50508035926020909101359150565b60008060008060008060608789031215610a4857600080fd5b86356001600160401b0380821115610a5f57600080fd5b610a6b8a838b016108a9565b90985096506020890135915080821115610a8457600080fd5b610a908a838b016108a9565b90965094506040890135915080821115610aa957600080fd5b50610ab689828a016108a9565b979a9699509497509295939492505050565b60008060208385031215610adb57600080fd5b82356001600160401b03811115610af157600080fd5b610afd858286016108a9565b90969095509350505050565b602080825260129082015271125b9d985b1a5908141c9a58d9481199595960721b604082015260600190565b8181038181111561037357634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052604160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b6000808335601e19843603018112610b9957600080fd5b8301803591506001600160401b03821115610bb357600080fd5b6020019150368190038213156108ed57600080fd5b600060808284031215610bda57600080fd5b604051608081018181106001600160401b0382111715610c0a57634e487b7160e01b600052604160045260246000fd5b6040529050808235600781900b8114610c2257600080fd5b8152610c30602084016108f4565b602082015260408301358060030b8114610c4957600080fd5b6040820152606092830135920191909152919050565b60006101208284031215610c7257600080fd5b604051606081018181106001600160401b0382111715610ca257634e487b7160e01b600052604160045260246000fd5b60405282358152610cb68460208501610bc8565b6020820152610cc88460a08501610bc8565b6040820152939250505056fea264697066735822122018f144205654f73c63559096a5f2ab7c88d3a18f2af079bf57dc2a56a8a138ae64736f6c63430008180033';

type PythMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PythMockConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PythMock__factory extends ContractFactory {
  constructor(...args: PythMockConstructorParams) {
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
      PythMock & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): PythMock__factory {
    return super.connect(runner) as PythMock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PythMockInterface {
    return new Interface(_abi) as PythMockInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): PythMock {
    return new Contract(address, _abi, runner) as unknown as PythMock;
  }
}
