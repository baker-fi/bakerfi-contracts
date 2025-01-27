/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  UseWstETH,
  UseWstETHInterface,
} from "../../../../contracts/core/hooks/UseWstETH";

const _abi = [
  {
    inputs: [],
    name: "FailedToApproveStAllowance",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedToApproveWstAllowance",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidStETHContract",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidWstETHContract",
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

export class UseWstETH__factory {
  static readonly abi = _abi;
  static createInterface(): UseWstETHInterface {
    return new Interface(_abi) as UseWstETHInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): UseWstETH {
    return new Contract(address, _abi, runner) as unknown as UseWstETH;
  }
}
