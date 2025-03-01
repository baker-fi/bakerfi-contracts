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
} from '../../../../../common';

export interface UseCurveSwapperInterface extends Interface {
  getFunction(nameOrSignature: 'ETH_ADDRESS' | 'curveRouter'): FunctionFragment;

  encodeFunctionData(functionFragment: 'ETH_ADDRESS', values?: undefined): string;
  encodeFunctionData(functionFragment: 'curveRouter', values?: undefined): string;

  decodeFunctionResult(functionFragment: 'ETH_ADDRESS', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'curveRouter', data: BytesLike): Result;
}

export interface UseCurveSwapper extends BaseContract {
  connect(runner?: ContractRunner | null): UseCurveSwapper;
  waitForDeployment(): Promise<this>;

  interface: UseCurveSwapperInterface;

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

  ETH_ADDRESS: TypedContractMethod<[], [string], 'view'>;

  curveRouter: TypedContractMethod<[], [string], 'view'>;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'ETH_ADDRESS'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'curveRouter'): TypedContractMethod<[], [string], 'view'>;

  filters: {};
}
