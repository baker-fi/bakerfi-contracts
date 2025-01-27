/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  UseStETH,
  UseStETHInterface,
} from "../../../../contracts/core/hooks/UseStETH";

const _abi = [
  {
    inputs: [],
    name: "UseStETHInvalidStETHContract",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
] as const;

export class UseStETH__factory {
  static readonly abi = _abi;
  static createInterface(): UseStETHInterface {
    return new Interface(_abi) as UseStETHInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): UseStETH {
    return new Contract(address, _abi, runner) as unknown as UseStETH;
  }
}
