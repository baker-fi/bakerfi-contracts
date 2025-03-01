/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, ContractFactory, ContractTransactionResponse, Interface } from 'ethers';
import type { Signer, ContractDeployTransaction, ContractRunner } from 'ethers';
import type { NonPayableOverrides } from '../../../common';
import type {
  UniV2Library,
  UniV2LibraryInterface,
} from '../../../contracts/libraries/UniV2Library';

const _abi = [
  {
    inputs: [],
    name: 'FailedToApproveAllowance',
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
] as const;

const _bytecode =
  '0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea26469706673582212209346d4caca3358cc19537bbed6de7f6c7a29d0fffe33ccc6ca08390d91ef6da464736f6c63430008180033';

type UniV2LibraryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UniV2LibraryConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UniV2Library__factory extends ContractFactory {
  constructor(...args: UniV2LibraryConstructorParams) {
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
      UniV2Library & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): UniV2Library__factory {
    return super.connect(runner) as UniV2Library__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UniV2LibraryInterface {
    return new Interface(_abi) as UniV2LibraryInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): UniV2Library {
    return new Contract(address, _abi, runner) as unknown as UniV2Library;
  }
}
