/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  IVaultRegistry,
  IVaultRegistryInterface,
} from "../../../../contracts/interfaces/core/IVaultRegistry";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
      {
        indexed: false,
        internalType: "address",
        name: "service",
        type: "address",
      },
    ],
    name: "ServiceRegistered",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "nameHash",
        type: "bytes32",
      },
    ],
    name: "ServiceUnregistered",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "serviceName",
        type: "string",
      },
    ],
    name: "getService",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "serviceHash",
        type: "bytes32",
      },
    ],
    name: "getServiceFromHash",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "serviceNameHash",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "serviceAddress",
        type: "address",
      },
    ],
    name: "registerService",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "serviceNameHash",
        type: "bytes32",
      },
    ],
    name: "unregisterService",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class IVaultRegistry__factory {
  static readonly abi = _abi;
  static createInterface(): IVaultRegistryInterface {
    return new Interface(_abi) as IVaultRegistryInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): IVaultRegistry {
    return new Contract(address, _abi, runner) as unknown as IVaultRegistry;
  }
}
