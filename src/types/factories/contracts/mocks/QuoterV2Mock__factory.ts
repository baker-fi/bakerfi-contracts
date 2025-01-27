/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  QuoterV2Mock,
  QuoterV2MockInterface,
} from "../../../contracts/mocks/QuoterV2Mock";

const _abi = [
  {
    inputs: [
      {
        internalType: "bytes",
        name: "path",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
    ],
    name: "quoteExactInput",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "uint160[]",
        name: "sqrtPriceX96AfterList",
        type: "uint160[]",
      },
      {
        internalType: "uint32[]",
        name: "initializedTicksCrossedList",
        type: "uint32[]",
      },
      {
        internalType: "uint256",
        name: "gasEstimate",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenOut",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amountIn",
            type: "uint256",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct IQuoterV2.QuoteExactInputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactInputSingle",
    outputs: [
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
      {
        internalType: "uint160",
        name: "sqrtPriceX96After",
        type: "uint160",
      },
      {
        internalType: "uint32",
        name: "initializedTicksCrossed",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "gasEstimate",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "path",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "amountOut",
        type: "uint256",
      },
    ],
    name: "quoteExactOutput",
    outputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint160[]",
        name: "sqrtPriceX96AfterList",
        type: "uint160[]",
      },
      {
        internalType: "uint32[]",
        name: "initializedTicksCrossedList",
        type: "uint32[]",
      },
      {
        internalType: "uint256",
        name: "gasEstimate",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "tokenIn",
            type: "address",
          },
          {
            internalType: "address",
            name: "tokenOut",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            internalType: "uint24",
            name: "fee",
            type: "uint24",
          },
          {
            internalType: "uint160",
            name: "sqrtPriceLimitX96",
            type: "uint160",
          },
        ],
        internalType: "struct IQuoterV2.QuoteExactOutputSingleParams",
        name: "params",
        type: "tuple",
      },
    ],
    name: "quoteExactOutputSingle",
    outputs: [
      {
        internalType: "uint256",
        name: "amountIn",
        type: "uint256",
      },
      {
        internalType: "uint160",
        name: "sqrtPriceX96After",
        type: "uint160",
      },
      {
        internalType: "uint32",
        name: "initializedTicksCrossed",
        type: "uint32",
      },
      {
        internalType: "uint256",
        name: "gasEstimate",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "ratio",
        type: "uint256",
      },
    ],
    name: "setRatio",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x6080604052633b9aca00600055633b9aca0060015534801561002057600080fd5b5061043f806100306000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c80632f80bb1d1461005c578063b2237ba314610091578063bd21704a146100a6578063c6a5026a146100ec578063cdca17531461005c575b600080fd5b61007861006a366004610196565b506000916060915081908390565b6040516100889493929190610230565b60405180910390f35b6100a461009f3660046102cd565b600155565b005b6100b96100b4366004610399565b6100ff565b604080519485526001600160a01b03909316602085015263ffffffff909116918301919091526060820152608001610088565b6100b96100fa366004610399565b610134565b600080600080600054600154866040015161011a91906103bc565b61012491906103e7565b9560009550859450849350915050565b600080600080600154600054866040015161011a91906103bc565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff8111828210171561018e5761018e61014f565b604052919050565b600080604083850312156101a957600080fd5b823567ffffffffffffffff808211156101c157600080fd5b818501915085601f8301126101d557600080fd5b81356020828211156101e9576101e961014f565b6101fb601f8301601f19168201610165565b9250818352878183860101111561021157600080fd5b8181850182850137600091830181019190915290969401359450505050565b600060808201868352602060808185015281875180845260a086019150828901935060005b8181101561027a5784516001600160a01b031683529383019391830191600101610255565b50508481036040860152865180825290820192508187019060005b818110156102b757825163ffffffff1685529383019391830191600101610295565b5050505060609290920192909252949350505050565b6000602082840312156102df57600080fd5b5035919050565b6001600160a01b03811681146102fb57600080fd5b50565b600060a0828403121561031057600080fd5b60405160a0810181811067ffffffffffffffff821117156103335761033361014f565b6040529050808235610344816102e6565b81526020830135610354816102e6565b602082015260408381013590820152606083013562ffffff8116811461037957600080fd5b6060820152608083013561038c816102e6565b6080919091015292915050565b600060a082840312156103ab57600080fd5b6103b583836102fe565b9392505050565b80820281158282048414176103e157634e487b7160e01b600052601160045260246000fd5b92915050565b60008261040457634e487b7160e01b600052601260045260246000fd5b50049056fea2646970667358221220ffdde1144ad6b2adc08d9b3909c1fa998f8ec988cb8e98c02099d7475d39051c64736f6c63430008180033";

type QuoterV2MockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: QuoterV2MockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class QuoterV2Mock__factory extends ContractFactory {
  constructor(...args: QuoterV2MockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      QuoterV2Mock & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): QuoterV2Mock__factory {
    return super.connect(runner) as QuoterV2Mock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): QuoterV2MockInterface {
    return new Interface(_abi) as QuoterV2MockInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): QuoterV2Mock {
    return new Contract(address, _abi, runner) as unknown as QuoterV2Mock;
  }
}
