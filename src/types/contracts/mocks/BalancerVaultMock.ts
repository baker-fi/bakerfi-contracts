/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  AddressLike,
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
} from '../../common';

export declare namespace IVault {
  export type SingleSwapStruct = {
    poolId: BytesLike;
    kind: BigNumberish;
    assetIn: AddressLike;
    assetOut: AddressLike;
    amount: BigNumberish;
    userData: BytesLike;
  };

  export type SingleSwapStructOutput = [
    poolId: string,
    kind: bigint,
    assetIn: string,
    assetOut: string,
    amount: bigint,
    userData: string,
  ] & {
    poolId: string;
    kind: bigint;
    assetIn: string;
    assetOut: string;
    amount: bigint;
    userData: string;
  };

  export type FundManagementStruct = {
    sender: AddressLike;
    fromInternalBalance: boolean;
    recipient: AddressLike;
    toInternalBalance: boolean;
  };

  export type FundManagementStructOutput = [
    sender: string,
    fromInternalBalance: boolean,
    recipient: string,
    toInternalBalance: boolean,
  ] & {
    sender: string;
    fromInternalBalance: boolean;
    recipient: string;
    toInternalBalance: boolean;
  };
}

export interface BalancerVaultMockInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'flashLoan'
      | 'getFlashLoanFeePercentage'
      | 'getProtocolFeesCollector'
      | 'querySwap'
      | 'swap',
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: 'flashLoan',
    values: [AddressLike, AddressLike[], BigNumberish[], BytesLike],
  ): string;
  encodeFunctionData(functionFragment: 'getFlashLoanFeePercentage', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getProtocolFeesCollector', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'querySwap',
    values: [IVault.SingleSwapStruct, IVault.FundManagementStruct],
  ): string;
  encodeFunctionData(
    functionFragment: 'swap',
    values: [IVault.SingleSwapStruct, IVault.FundManagementStruct, BigNumberish, BigNumberish],
  ): string;

  decodeFunctionResult(functionFragment: 'flashLoan', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getFlashLoanFeePercentage', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getProtocolFeesCollector', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'querySwap', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'swap', data: BytesLike): Result;
}

export interface BalancerVaultMock extends BaseContract {
  connect(runner?: ContractRunner | null): BalancerVaultMock;
  waitForDeployment(): Promise<this>;

  interface: BalancerVaultMockInterface;

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

  flashLoan: TypedContractMethod<
    [recipient: AddressLike, tokens: AddressLike[], amounts: BigNumberish[], userData: BytesLike],
    [void],
    'nonpayable'
  >;

  getFlashLoanFeePercentage: TypedContractMethod<[], [bigint], 'view'>;

  getProtocolFeesCollector: TypedContractMethod<[], [string], 'view'>;

  querySwap: TypedContractMethod<
    [arg0: IVault.SingleSwapStruct, arg1: IVault.FundManagementStruct],
    [bigint],
    'view'
  >;

  swap: TypedContractMethod<
    [
      arg0: IVault.SingleSwapStruct,
      arg1: IVault.FundManagementStruct,
      arg2: BigNumberish,
      arg3: BigNumberish,
    ],
    [bigint],
    'payable'
  >;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(
    nameOrSignature: 'flashLoan',
  ): TypedContractMethod<
    [recipient: AddressLike, tokens: AddressLike[], amounts: BigNumberish[], userData: BytesLike],
    [void],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'getFlashLoanFeePercentage',
  ): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'getProtocolFeesCollector',
  ): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'querySwap',
  ): TypedContractMethod<
    [arg0: IVault.SingleSwapStruct, arg1: IVault.FundManagementStruct],
    [bigint],
    'view'
  >;
  getFunction(
    nameOrSignature: 'swap',
  ): TypedContractMethod<
    [
      arg0: IVault.SingleSwapStruct,
      arg1: IVault.FundManagementStruct,
      arg2: BigNumberish,
      arg3: BigNumberish,
    ],
    [bigint],
    'payable'
  >;

  filters: {};
}
