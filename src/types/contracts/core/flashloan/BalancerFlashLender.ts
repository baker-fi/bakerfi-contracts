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
} from '../../../common';

export interface BalancerFlashLenderInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'CALLBACK_SUCCESS'
      | 'flashFee'
      | 'flashLoan'
      | 'maxFlashLoan'
      | 'receiveFlashLoan',
  ): FunctionFragment;

  encodeFunctionData(functionFragment: 'CALLBACK_SUCCESS', values?: undefined): string;
  encodeFunctionData(functionFragment: 'flashFee', values: [AddressLike, BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'flashLoan',
    values: [AddressLike, AddressLike, BigNumberish, BytesLike],
  ): string;
  encodeFunctionData(functionFragment: 'maxFlashLoan', values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: 'receiveFlashLoan',
    values: [AddressLike[], BigNumberish[], BigNumberish[], BytesLike],
  ): string;

  decodeFunctionResult(functionFragment: 'CALLBACK_SUCCESS', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'flashFee', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'flashLoan', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'maxFlashLoan', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'receiveFlashLoan', data: BytesLike): Result;
}

export interface BalancerFlashLender extends BaseContract {
  connect(runner?: ContractRunner | null): BalancerFlashLender;
  waitForDeployment(): Promise<this>;

  interface: BalancerFlashLenderInterface;

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

  CALLBACK_SUCCESS: TypedContractMethod<[], [string], 'view'>;

  flashFee: TypedContractMethod<[arg0: AddressLike, amount: BigNumberish], [bigint], 'view'>;

  flashLoan: TypedContractMethod<
    [borrower: AddressLike, token: AddressLike, amount: BigNumberish, data: BytesLike],
    [boolean],
    'nonpayable'
  >;

  maxFlashLoan: TypedContractMethod<[token: AddressLike], [bigint], 'view'>;

  receiveFlashLoan: TypedContractMethod<
    [
      tokens: AddressLike[],
      amounts: BigNumberish[],
      feeAmounts: BigNumberish[],
      userData: BytesLike,
    ],
    [void],
    'nonpayable'
  >;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'CALLBACK_SUCCESS'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'flashFee',
  ): TypedContractMethod<[arg0: AddressLike, amount: BigNumberish], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'flashLoan',
  ): TypedContractMethod<
    [borrower: AddressLike, token: AddressLike, amount: BigNumberish, data: BytesLike],
    [boolean],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'maxFlashLoan',
  ): TypedContractMethod<[token: AddressLike], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'receiveFlashLoan',
  ): TypedContractMethod<
    [
      tokens: AddressLike[],
      amounts: BigNumberish[],
      feeAmounts: BigNumberish[],
      userData: BytesLike,
    ],
    [void],
    'nonpayable'
  >;

  filters: {};
}
