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

export interface ICurveRouterNGInterface extends Interface {
  getFunction(nameOrSignature: 'exchange' | 'get_dx' | 'get_dy'): FunctionFragment;

  encodeFunctionData(
    functionFragment: 'exchange',
    values: [
      AddressLike[],
      [
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      ],
      BigNumberish,
      BigNumberish,
      [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
      AddressLike,
    ],
  ): string;
  encodeFunctionData(
    functionFragment: 'get_dx',
    values: [
      AddressLike[],
      [
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      ],
      BigNumberish,
      [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
      [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
      [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
    ],
  ): string;
  encodeFunctionData(
    functionFragment: 'get_dy',
    values: [
      AddressLike[],
      [
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      ],
      BigNumberish,
      [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
    ],
  ): string;

  decodeFunctionResult(functionFragment: 'exchange', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'get_dx', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'get_dy', data: BytesLike): Result;
}

export interface ICurveRouterNG extends BaseContract {
  connect(runner?: ContractRunner | null): ICurveRouterNG;
  waitForDeployment(): Promise<this>;

  interface: ICurveRouterNGInterface;

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

  exchange: TypedContractMethod<
    [
      route: AddressLike[],
      swapParams: [
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      ],
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      pools: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
      receiverAddress: AddressLike,
    ],
    [bigint],
    'payable'
  >;

  get_dx: TypedContractMethod<
    [
      route: AddressLike[],
      swapParams: [
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      ],
      amountOut: BigNumberish,
      pools: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
      basePools: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
      baseTokens: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
    ],
    [bigint],
    'view'
  >;

  get_dy: TypedContractMethod<
    [
      route: AddressLike[],
      swapParams: [
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      ],
      amount: BigNumberish,
      pools: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
    ],
    [bigint],
    'view'
  >;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(
    nameOrSignature: 'exchange',
  ): TypedContractMethod<
    [
      route: AddressLike[],
      swapParams: [
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      ],
      amountIn: BigNumberish,
      amountOutMin: BigNumberish,
      pools: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
      receiverAddress: AddressLike,
    ],
    [bigint],
    'payable'
  >;
  getFunction(
    nameOrSignature: 'get_dx',
  ): TypedContractMethod<
    [
      route: AddressLike[],
      swapParams: [
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      ],
      amountOut: BigNumberish,
      pools: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
      basePools: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
      baseTokens: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
    ],
    [bigint],
    'view'
  >;
  getFunction(
    nameOrSignature: 'get_dy',
  ): TypedContractMethod<
    [
      route: AddressLike[],
      swapParams: [
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
        [BigNumberish, BigNumberish, BigNumberish, BigNumberish, BigNumberish],
      ],
      amount: BigNumberish,
      pools: [AddressLike, AddressLike, AddressLike, AddressLike, AddressLike],
    ],
    [bigint],
    'view'
  >;

  filters: {};
}
