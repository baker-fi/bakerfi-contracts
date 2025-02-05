/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Contract, ContractFactory, ContractTransactionResponse, Interface } from 'ethers';
import type { Signer, ContractDeployTransaction, ContractRunner } from 'ethers';
import type { NonPayableOverrides } from '../../../common';
import type { VaultSettings, VaultSettingsInterface } from '../../../contracts/core/VaultSettings';

const _abi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'InvalidAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidMaxLoanToValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPercentage',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WhiteListAlreadyEnabled',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WhiteListFailedToAdd',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WhiteListFailedToRemove',
    type: 'error',
  },
  {
    inputs: [],
    name: 'WhiteListNotEnabled',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'enabled',
        type: 'bool',
      },
    ],
    name: 'AccountWhiteList',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'value',
        type: 'address',
      },
    ],
    name: 'FeeReceiverChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'MaxDepositChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'PerformanceFeeChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'WithdrawalFeeChanged',
    type: 'event',
  },
  {
    inputs: [],
    name: '_initializeVaultSettings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFeeReceiver',
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
    name: 'getMaxDeposit',
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
    inputs: [],
    name: 'getPerformanceFee',
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
    inputs: [],
    name: 'getWithdrawalFee',
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
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'isAccountEnabled',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

const _bytecode =
  '0x608060405234801561001057600080fd5b5061001961001e565b6100dd565b600054610100900460ff161561008a5760405162461bcd60e51b815260206004820152602760248201527f496e697469616c697a61626c653a20636f6e747261637420697320696e697469604482015266616c697a696e6760c81b606482015260840160405180910390fd5b60005460ff908116146100db576000805460ff191660ff9081179091556040519081527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b565b61021a806100ec6000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c8063235c360314610067578063a4dbc6a81461007e578063b8b359cc14610086578063cd435cdd146100a9578063d8e159f8146100b3578063e8a35392146100bb575b600080fd5b6002545b6040519081526020015b60405180910390f35b60045461006b565b6100996100943660046101bb565b6100d6565b6040519015158152602001610075565b6100b16100fa565b005b60015461006b565b6003546040516001600160a01b039091168152602001610075565b60006100e2600561018c565b15806100f457506100f4600583610196565b92915050565b600054610100900460ff166101695760405162461bcd60e51b815260206004820152602b60248201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960448201526a6e697469616c697a696e6760a81b606482015260840160405180910390fd5b629896806001819055600255600380546001600160a01b03191690556000600455565b60006100f4825490565b6001600160a01b038116600090815260018301602052604081205415155b9392505050565b6000602082840312156101cd57600080fd5b81356001600160a01b03811681146101b457600080fdfea2646970667358221220717373fde6adc975d12c44f4c016160c6dad787107ceeccc969c59d172d3788064736f6c63430008180033';

type VaultSettingsConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VaultSettingsConstructorParams,
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VaultSettings__factory extends ContractFactory {
  constructor(...args: VaultSettingsConstructorParams) {
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
      VaultSettings & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): VaultSettings__factory {
    return super.connect(runner) as VaultSettings__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VaultSettingsInterface {
    return new Interface(_abi) as VaultSettingsInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): VaultSettings {
    return new Contract(address, _abi, runner) as unknown as VaultSettings;
  }
}
