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
  RebaseLibraryTest,
  RebaseLibraryTestInterface,
} from "../../../contracts/tests/RebaseLibraryTest";

const _abi = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "elastic",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "base",
            type: "uint256",
          },
        ],
        internalType: "struct Rebase",
        name: "total",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "elastic",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "roundUp",
        type: "bool",
      },
    ],
    name: "toBase",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "elastic",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "base",
            type: "uint256",
          },
        ],
        internalType: "struct Rebase",
        name: "total",
        type: "tuple",
      },
      {
        internalType: "uint256",
        name: "base",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "roundUp",
        type: "bool",
      },
    ],
    name: "toElastic",
    outputs: [
      {
        internalType: "uint256",
        name: "elastic",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610294806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80634c5f04121461003b57806362f04b1514610060575b600080fd5b61004e610049366004610161565b610073565b60405190815260200160405180910390f35b61004e61006e366004610161565b61008a565b6000610080848484610097565b90505b9392505050565b6000610080848484610109565b600083602001516000036100ac575081610083565b602084015184516100bd9085610206565b6100c79190610223565b90508180156100f15750835160208501518491906100e59084610206565b6100ef9190610223565b105b15610083578061010081610245565b95945050505050565b8251600090158061011c57506020840151155b15610128575081610083565b835160208501516101399085610206565b6101439190610223565b90508180156100f15750602084015184518491906100e59084610206565b6000806000838503608081121561017757600080fd5b604081121561018557600080fd5b506040516040810181811067ffffffffffffffff821117156101b757634e487b7160e01b600052604160045260246000fd5b604090815285358252602080870135908301529093508401359150606084013580151581146101e557600080fd5b809150509250925092565b634e487b7160e01b600052601160045260246000fd5b808202811582820484141761021d5761021d6101f0565b92915050565b60008261024057634e487b7160e01b600052601260045260246000fd5b500490565b600060018201610257576102576101f0565b506001019056fea264697066735822122032bbfe16c901e1f738bedbce91fa1ab0d27e6e4a906e3e2bf0e659a5ccbebddc64736f6c63430008180033";

type RebaseLibraryTestConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: RebaseLibraryTestConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class RebaseLibraryTest__factory extends ContractFactory {
  constructor(...args: RebaseLibraryTestConstructorParams) {
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
      RebaseLibraryTest & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): RebaseLibraryTest__factory {
    return super.connect(runner) as RebaseLibraryTest__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): RebaseLibraryTestInterface {
    return new Interface(_abi) as RebaseLibraryTestInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): RebaseLibraryTest {
    return new Contract(address, _abi, runner) as unknown as RebaseLibraryTest;
  }
}
