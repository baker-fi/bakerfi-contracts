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
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from 'ethers';
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from '../../../common';

export declare namespace IOracle {
  export type PriceOptionsStruct = {
    maxAge: BigNumberish;
    maxConf: BigNumberish;
  };

  export type PriceOptionsStructOutput = [maxAge: bigint, maxConf: bigint] & {
    maxAge: bigint;
    maxConf: bigint;
  };
}

export interface IStrategyLeverageInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'asset'
      | 'deploy'
      | 'getCollateralAsset'
      | 'getDebAsset'
      | 'getPosition'
      | 'harvest'
      | 'totalAssets'
      | 'undeploy',
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | 'StrategyAmountUpdate'
      | 'StrategyDeploy'
      | 'StrategyLoss'
      | 'StrategyProfit'
      | 'StrategyUndeploy',
  ): EventFragment;

  encodeFunctionData(functionFragment: 'asset', values?: undefined): string;
  encodeFunctionData(functionFragment: 'deploy', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'getCollateralAsset', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getDebAsset', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getPosition', values: [IOracle.PriceOptionsStruct]): string;
  encodeFunctionData(functionFragment: 'harvest', values?: undefined): string;
  encodeFunctionData(functionFragment: 'totalAssets', values?: undefined): string;
  encodeFunctionData(functionFragment: 'undeploy', values: [BigNumberish]): string;

  decodeFunctionResult(functionFragment: 'asset', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'deploy', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getCollateralAsset', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getDebAsset', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getPosition', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'harvest', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'totalAssets', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'undeploy', data: BytesLike): Result;
}

export namespace StrategyAmountUpdateEvent {
  export type InputTuple = [newDeployment: BigNumberish];
  export type OutputTuple = [newDeployment: bigint];
  export interface OutputObject {
    newDeployment: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace StrategyDeployEvent {
  export type InputTuple = [from: AddressLike, amount: BigNumberish];
  export type OutputTuple = [from: string, amount: bigint];
  export interface OutputObject {
    from: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace StrategyLossEvent {
  export type InputTuple = [amount: BigNumberish];
  export type OutputTuple = [amount: bigint];
  export interface OutputObject {
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace StrategyProfitEvent {
  export type InputTuple = [amount: BigNumberish];
  export type OutputTuple = [amount: bigint];
  export interface OutputObject {
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace StrategyUndeployEvent {
  export type InputTuple = [from: AddressLike, amount: BigNumberish];
  export type OutputTuple = [from: string, amount: bigint];
  export interface OutputObject {
    from: string;
    amount: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IStrategyLeverage extends BaseContract {
  connect(runner?: ContractRunner | null): IStrategyLeverage;
  waitForDeployment(): Promise<this>;

  interface: IStrategyLeverageInterface;

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

  asset: TypedContractMethod<[], [string], 'view'>;

  deploy: TypedContractMethod<[amount: BigNumberish], [bigint], 'nonpayable'>;

  getCollateralAsset: TypedContractMethod<[], [string], 'view'>;

  getDebAsset: TypedContractMethod<[], [string], 'view'>;

  getPosition: TypedContractMethod<
    [priceOptions: IOracle.PriceOptionsStruct],
    [
      [bigint, bigint, bigint] & {
        totalCollateralInUSD: bigint;
        totalDebtInUSD: bigint;
        loanToValue: bigint;
      },
    ],
    'view'
  >;

  harvest: TypedContractMethod<[], [bigint], 'nonpayable'>;

  totalAssets: TypedContractMethod<[], [bigint], 'view'>;

  undeploy: TypedContractMethod<[amount: BigNumberish], [bigint], 'nonpayable'>;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'asset'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'deploy',
  ): TypedContractMethod<[amount: BigNumberish], [bigint], 'nonpayable'>;
  getFunction(nameOrSignature: 'getCollateralAsset'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'getDebAsset'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'getPosition'): TypedContractMethod<
    [priceOptions: IOracle.PriceOptionsStruct],
    [
      [bigint, bigint, bigint] & {
        totalCollateralInUSD: bigint;
        totalDebtInUSD: bigint;
        loanToValue: bigint;
      },
    ],
    'view'
  >;
  getFunction(nameOrSignature: 'harvest'): TypedContractMethod<[], [bigint], 'nonpayable'>;
  getFunction(nameOrSignature: 'totalAssets'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'undeploy',
  ): TypedContractMethod<[amount: BigNumberish], [bigint], 'nonpayable'>;

  getEvent(
    key: 'StrategyAmountUpdate',
  ): TypedContractEvent<
    StrategyAmountUpdateEvent.InputTuple,
    StrategyAmountUpdateEvent.OutputTuple,
    StrategyAmountUpdateEvent.OutputObject
  >;
  getEvent(
    key: 'StrategyDeploy',
  ): TypedContractEvent<
    StrategyDeployEvent.InputTuple,
    StrategyDeployEvent.OutputTuple,
    StrategyDeployEvent.OutputObject
  >;
  getEvent(
    key: 'StrategyLoss',
  ): TypedContractEvent<
    StrategyLossEvent.InputTuple,
    StrategyLossEvent.OutputTuple,
    StrategyLossEvent.OutputObject
  >;
  getEvent(
    key: 'StrategyProfit',
  ): TypedContractEvent<
    StrategyProfitEvent.InputTuple,
    StrategyProfitEvent.OutputTuple,
    StrategyProfitEvent.OutputObject
  >;
  getEvent(
    key: 'StrategyUndeploy',
  ): TypedContractEvent<
    StrategyUndeployEvent.InputTuple,
    StrategyUndeployEvent.OutputTuple,
    StrategyUndeployEvent.OutputObject
  >;

  filters: {
    'StrategyAmountUpdate(uint256)': TypedContractEvent<
      StrategyAmountUpdateEvent.InputTuple,
      StrategyAmountUpdateEvent.OutputTuple,
      StrategyAmountUpdateEvent.OutputObject
    >;
    StrategyAmountUpdate: TypedContractEvent<
      StrategyAmountUpdateEvent.InputTuple,
      StrategyAmountUpdateEvent.OutputTuple,
      StrategyAmountUpdateEvent.OutputObject
    >;

    'StrategyDeploy(address,uint256)': TypedContractEvent<
      StrategyDeployEvent.InputTuple,
      StrategyDeployEvent.OutputTuple,
      StrategyDeployEvent.OutputObject
    >;
    StrategyDeploy: TypedContractEvent<
      StrategyDeployEvent.InputTuple,
      StrategyDeployEvent.OutputTuple,
      StrategyDeployEvent.OutputObject
    >;

    'StrategyLoss(uint256)': TypedContractEvent<
      StrategyLossEvent.InputTuple,
      StrategyLossEvent.OutputTuple,
      StrategyLossEvent.OutputObject
    >;
    StrategyLoss: TypedContractEvent<
      StrategyLossEvent.InputTuple,
      StrategyLossEvent.OutputTuple,
      StrategyLossEvent.OutputObject
    >;

    'StrategyProfit(uint256)': TypedContractEvent<
      StrategyProfitEvent.InputTuple,
      StrategyProfitEvent.OutputTuple,
      StrategyProfitEvent.OutputObject
    >;
    StrategyProfit: TypedContractEvent<
      StrategyProfitEvent.InputTuple,
      StrategyProfitEvent.OutputTuple,
      StrategyProfitEvent.OutputObject
    >;

    'StrategyUndeploy(address,uint256)': TypedContractEvent<
      StrategyUndeployEvent.InputTuple,
      StrategyUndeployEvent.OutputTuple,
      StrategyUndeployEvent.OutputObject
    >;
    StrategyUndeploy: TypedContractEvent<
      StrategyUndeployEvent.InputTuple,
      StrategyUndeployEvent.OutputTuple,
      StrategyUndeployEvent.OutputObject
    >;
  };
}
