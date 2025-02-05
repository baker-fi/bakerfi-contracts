/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  ContractRunner,
  ContractMethod,
  Listener,
} from 'ethers';
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from '../../../common';

export interface CommandsInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'AERODROME_SWAP'
      | 'ERC4626_VAULT_CONVERT_TO_ASSETS'
      | 'ERC4626_VAULT_CONVERT_TO_SHARES'
      | 'ERC4626_VAULT_DEPOSIT'
      | 'ERC4626_VAULT_MINT'
      | 'ERC4626_VAULT_REDEEM'
      | 'ERC4626_VAULT_WITHDRAW'
      | 'PULL_TOKEN'
      | 'PULL_TOKEN_FROM'
      | 'PUSH_TOKEN'
      | 'PUSH_TOKEN_FROM'
      | 'SEND_NATIVE'
      | 'SWEEP_NATIVE'
      | 'SWEEP_TOKENS'
      | 'THIRTY_TWO_BITS_MASK'
      | 'UNWRAP_ETH'
      | 'V2_UNISWAP_SWAP'
      | 'V3_UNISWAP_SWAP'
      | 'WRAP_ETH',
  ): FunctionFragment;

  encodeFunctionData(functionFragment: 'AERODROME_SWAP', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'ERC4626_VAULT_CONVERT_TO_ASSETS',
    values?: undefined,
  ): string;
  encodeFunctionData(
    functionFragment: 'ERC4626_VAULT_CONVERT_TO_SHARES',
    values?: undefined,
  ): string;
  encodeFunctionData(functionFragment: 'ERC4626_VAULT_DEPOSIT', values?: undefined): string;
  encodeFunctionData(functionFragment: 'ERC4626_VAULT_MINT', values?: undefined): string;
  encodeFunctionData(functionFragment: 'ERC4626_VAULT_REDEEM', values?: undefined): string;
  encodeFunctionData(functionFragment: 'ERC4626_VAULT_WITHDRAW', values?: undefined): string;
  encodeFunctionData(functionFragment: 'PULL_TOKEN', values?: undefined): string;
  encodeFunctionData(functionFragment: 'PULL_TOKEN_FROM', values?: undefined): string;
  encodeFunctionData(functionFragment: 'PUSH_TOKEN', values?: undefined): string;
  encodeFunctionData(functionFragment: 'PUSH_TOKEN_FROM', values?: undefined): string;
  encodeFunctionData(functionFragment: 'SEND_NATIVE', values?: undefined): string;
  encodeFunctionData(functionFragment: 'SWEEP_NATIVE', values?: undefined): string;
  encodeFunctionData(functionFragment: 'SWEEP_TOKENS', values?: undefined): string;
  encodeFunctionData(functionFragment: 'THIRTY_TWO_BITS_MASK', values?: undefined): string;
  encodeFunctionData(functionFragment: 'UNWRAP_ETH', values?: undefined): string;
  encodeFunctionData(functionFragment: 'V2_UNISWAP_SWAP', values?: undefined): string;
  encodeFunctionData(functionFragment: 'V3_UNISWAP_SWAP', values?: undefined): string;
  encodeFunctionData(functionFragment: 'WRAP_ETH', values?: undefined): string;

  decodeFunctionResult(functionFragment: 'AERODROME_SWAP', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'ERC4626_VAULT_CONVERT_TO_ASSETS',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'ERC4626_VAULT_CONVERT_TO_SHARES',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'ERC4626_VAULT_DEPOSIT', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'ERC4626_VAULT_MINT', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'ERC4626_VAULT_REDEEM', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'ERC4626_VAULT_WITHDRAW', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'PULL_TOKEN', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'PULL_TOKEN_FROM', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'PUSH_TOKEN', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'PUSH_TOKEN_FROM', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'SEND_NATIVE', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'SWEEP_NATIVE', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'SWEEP_TOKENS', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'THIRTY_TWO_BITS_MASK', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'UNWRAP_ETH', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'V2_UNISWAP_SWAP', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'V3_UNISWAP_SWAP', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'WRAP_ETH', data: BytesLike): Result;
}

export interface Commands extends BaseContract {
  connect(runner?: ContractRunner | null): Commands;
  waitForDeployment(): Promise<this>;

  interface: CommandsInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined,
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>,
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent,
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(event?: TCEvent): Promise<this>;

  AERODROME_SWAP: TypedContractMethod<[], [bigint], 'view'>;

  ERC4626_VAULT_CONVERT_TO_ASSETS: TypedContractMethod<[], [bigint], 'view'>;

  ERC4626_VAULT_CONVERT_TO_SHARES: TypedContractMethod<[], [bigint], 'view'>;

  ERC4626_VAULT_DEPOSIT: TypedContractMethod<[], [bigint], 'view'>;

  ERC4626_VAULT_MINT: TypedContractMethod<[], [bigint], 'view'>;

  ERC4626_VAULT_REDEEM: TypedContractMethod<[], [bigint], 'view'>;

  ERC4626_VAULT_WITHDRAW: TypedContractMethod<[], [bigint], 'view'>;

  PULL_TOKEN: TypedContractMethod<[], [bigint], 'view'>;

  PULL_TOKEN_FROM: TypedContractMethod<[], [bigint], 'view'>;

  PUSH_TOKEN: TypedContractMethod<[], [bigint], 'view'>;

  PUSH_TOKEN_FROM: TypedContractMethod<[], [bigint], 'view'>;

  SEND_NATIVE: TypedContractMethod<[], [bigint], 'view'>;

  SWEEP_NATIVE: TypedContractMethod<[], [bigint], 'view'>;

  SWEEP_TOKENS: TypedContractMethod<[], [bigint], 'view'>;

  THIRTY_TWO_BITS_MASK: TypedContractMethod<[], [bigint], 'view'>;

  UNWRAP_ETH: TypedContractMethod<[], [bigint], 'view'>;

  V2_UNISWAP_SWAP: TypedContractMethod<[], [bigint], 'view'>;

  V3_UNISWAP_SWAP: TypedContractMethod<[], [bigint], 'view'>;

  WRAP_ETH: TypedContractMethod<[], [bigint], 'view'>;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'AERODROME_SWAP'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'ERC4626_VAULT_CONVERT_TO_ASSETS',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'ERC4626_VAULT_CONVERT_TO_SHARES',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'ERC4626_VAULT_DEPOSIT'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'ERC4626_VAULT_MINT'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'ERC4626_VAULT_REDEEM'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'ERC4626_VAULT_WITHDRAW'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'PULL_TOKEN'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'PULL_TOKEN_FROM'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'PUSH_TOKEN'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'PUSH_TOKEN_FROM'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'SEND_NATIVE'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'SWEEP_NATIVE'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'SWEEP_TOKENS'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'THIRTY_TWO_BITS_MASK'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'UNWRAP_ETH'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'V2_UNISWAP_SWAP'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'V3_UNISWAP_SWAP'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'WRAP_ETH'): TypedContractMethod<[], [bigint], 'view'>;

  filters: {};
}
