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

export interface StrategyLeverageSettingsInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'getLoanToValue'
      | 'getMaxLoanToValue'
      | 'getMaxSlippage'
      | 'getNrLoops'
      | 'getPriceMaxAge'
      | 'getPriceMaxConf'
      | 'governor'
      | 'owner'
      | 'renounceOwnership'
      | 'setLoanToValue'
      | 'setMaxLoanToValue'
      | 'setMaxSlippage'
      | 'setNrLoops'
      | 'setPriceMaxAge'
      | 'setPriceMaxConf'
      | 'transferGovernorship'
      | 'transferOwnership',
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | 'GovernshipTransferred'
      | 'Initialized'
      | 'LoanToValueChanged'
      | 'MaxLoanToValueChanged'
      | 'MaxSlippageChanged'
      | 'NrLoopsChanged'
      | 'OwnershipTransferred'
      | 'PriceMaxAgeChanged'
      | 'PriceMaxConfChanged',
  ): EventFragment;

  encodeFunctionData(functionFragment: 'getLoanToValue', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getMaxLoanToValue', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getMaxSlippage', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getNrLoops', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getPriceMaxAge', values?: undefined): string;
  encodeFunctionData(functionFragment: 'getPriceMaxConf', values?: undefined): string;
  encodeFunctionData(functionFragment: 'governor', values?: undefined): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'renounceOwnership', values?: undefined): string;
  encodeFunctionData(functionFragment: 'setLoanToValue', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'setMaxLoanToValue', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'setMaxSlippage', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'setNrLoops', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'setPriceMaxAge', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'setPriceMaxConf', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'transferGovernorship', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'transferOwnership', values: [AddressLike]): string;

  decodeFunctionResult(functionFragment: 'getLoanToValue', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getMaxLoanToValue', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getMaxSlippage', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getNrLoops', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getPriceMaxAge', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getPriceMaxConf', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'governor', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'renounceOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setLoanToValue', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setMaxLoanToValue', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setMaxSlippage', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setNrLoops', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setPriceMaxAge', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setPriceMaxConf', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferGovernorship', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferOwnership', data: BytesLike): Result;
}

export namespace GovernshipTransferredEvent {
  export type InputTuple = [previousGovernor: AddressLike, newGovernor: AddressLike];
  export type OutputTuple = [previousGovernor: string, newGovernor: string];
  export interface OutputObject {
    previousGovernor: string;
    newGovernor: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace LoanToValueChangedEvent {
  export type InputTuple = [value: BigNumberish];
  export type OutputTuple = [value: bigint];
  export interface OutputObject {
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace MaxLoanToValueChangedEvent {
  export type InputTuple = [value: BigNumberish];
  export type OutputTuple = [value: bigint];
  export interface OutputObject {
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace MaxSlippageChangedEvent {
  export type InputTuple = [value: BigNumberish];
  export type OutputTuple = [value: bigint];
  export interface OutputObject {
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace NrLoopsChangedEvent {
  export type InputTuple = [value: BigNumberish];
  export type OutputTuple = [value: bigint];
  export interface OutputObject {
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PriceMaxAgeChangedEvent {
  export type InputTuple = [value: BigNumberish];
  export type OutputTuple = [value: bigint];
  export interface OutputObject {
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PriceMaxConfChangedEvent {
  export type InputTuple = [value: BigNumberish];
  export type OutputTuple = [value: bigint];
  export interface OutputObject {
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface StrategyLeverageSettings extends BaseContract {
  connect(runner?: ContractRunner | null): StrategyLeverageSettings;
  waitForDeployment(): Promise<this>;

  interface: StrategyLeverageSettingsInterface;

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

  getLoanToValue: TypedContractMethod<[], [bigint], 'view'>;

  getMaxLoanToValue: TypedContractMethod<[], [bigint], 'view'>;

  getMaxSlippage: TypedContractMethod<[], [bigint], 'view'>;

  getNrLoops: TypedContractMethod<[], [bigint], 'view'>;

  getPriceMaxAge: TypedContractMethod<[], [bigint], 'view'>;

  getPriceMaxConf: TypedContractMethod<[], [bigint], 'view'>;

  governor: TypedContractMethod<[], [string], 'view'>;

  owner: TypedContractMethod<[], [string], 'view'>;

  renounceOwnership: TypedContractMethod<[], [void], 'nonpayable'>;

  setLoanToValue: TypedContractMethod<[loanToValue: BigNumberish], [void], 'nonpayable'>;

  setMaxLoanToValue: TypedContractMethod<[maxLoanToValue: BigNumberish], [void], 'nonpayable'>;

  setMaxSlippage: TypedContractMethod<[slippage: BigNumberish], [void], 'nonpayable'>;

  setNrLoops: TypedContractMethod<[nrLoops: BigNumberish], [void], 'nonpayable'>;

  setPriceMaxAge: TypedContractMethod<[value: BigNumberish], [void], 'nonpayable'>;

  setPriceMaxConf: TypedContractMethod<[value: BigNumberish], [void], 'nonpayable'>;

  transferGovernorship: TypedContractMethod<[_newGovernor: AddressLike], [void], 'nonpayable'>;

  transferOwnership: TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'getLoanToValue'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'getMaxLoanToValue'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'getMaxSlippage'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'getNrLoops'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'getPriceMaxAge'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'getPriceMaxConf'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'governor'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'owner'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'renounceOwnership'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setLoanToValue',
  ): TypedContractMethod<[loanToValue: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setMaxLoanToValue',
  ): TypedContractMethod<[maxLoanToValue: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setMaxSlippage',
  ): TypedContractMethod<[slippage: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setNrLoops',
  ): TypedContractMethod<[nrLoops: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setPriceMaxAge',
  ): TypedContractMethod<[value: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setPriceMaxConf',
  ): TypedContractMethod<[value: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'transferGovernorship',
  ): TypedContractMethod<[_newGovernor: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'transferOwnership',
  ): TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;

  getEvent(
    key: 'GovernshipTransferred',
  ): TypedContractEvent<
    GovernshipTransferredEvent.InputTuple,
    GovernshipTransferredEvent.OutputTuple,
    GovernshipTransferredEvent.OutputObject
  >;
  getEvent(
    key: 'Initialized',
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: 'LoanToValueChanged',
  ): TypedContractEvent<
    LoanToValueChangedEvent.InputTuple,
    LoanToValueChangedEvent.OutputTuple,
    LoanToValueChangedEvent.OutputObject
  >;
  getEvent(
    key: 'MaxLoanToValueChanged',
  ): TypedContractEvent<
    MaxLoanToValueChangedEvent.InputTuple,
    MaxLoanToValueChangedEvent.OutputTuple,
    MaxLoanToValueChangedEvent.OutputObject
  >;
  getEvent(
    key: 'MaxSlippageChanged',
  ): TypedContractEvent<
    MaxSlippageChangedEvent.InputTuple,
    MaxSlippageChangedEvent.OutputTuple,
    MaxSlippageChangedEvent.OutputObject
  >;
  getEvent(
    key: 'NrLoopsChanged',
  ): TypedContractEvent<
    NrLoopsChangedEvent.InputTuple,
    NrLoopsChangedEvent.OutputTuple,
    NrLoopsChangedEvent.OutputObject
  >;
  getEvent(
    key: 'OwnershipTransferred',
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: 'PriceMaxAgeChanged',
  ): TypedContractEvent<
    PriceMaxAgeChangedEvent.InputTuple,
    PriceMaxAgeChangedEvent.OutputTuple,
    PriceMaxAgeChangedEvent.OutputObject
  >;
  getEvent(
    key: 'PriceMaxConfChanged',
  ): TypedContractEvent<
    PriceMaxConfChangedEvent.InputTuple,
    PriceMaxConfChangedEvent.OutputTuple,
    PriceMaxConfChangedEvent.OutputObject
  >;

  filters: {
    'GovernshipTransferred(address,address)': TypedContractEvent<
      GovernshipTransferredEvent.InputTuple,
      GovernshipTransferredEvent.OutputTuple,
      GovernshipTransferredEvent.OutputObject
    >;
    GovernshipTransferred: TypedContractEvent<
      GovernshipTransferredEvent.InputTuple,
      GovernshipTransferredEvent.OutputTuple,
      GovernshipTransferredEvent.OutputObject
    >;

    'Initialized(uint8)': TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    'LoanToValueChanged(uint256)': TypedContractEvent<
      LoanToValueChangedEvent.InputTuple,
      LoanToValueChangedEvent.OutputTuple,
      LoanToValueChangedEvent.OutputObject
    >;
    LoanToValueChanged: TypedContractEvent<
      LoanToValueChangedEvent.InputTuple,
      LoanToValueChangedEvent.OutputTuple,
      LoanToValueChangedEvent.OutputObject
    >;

    'MaxLoanToValueChanged(uint256)': TypedContractEvent<
      MaxLoanToValueChangedEvent.InputTuple,
      MaxLoanToValueChangedEvent.OutputTuple,
      MaxLoanToValueChangedEvent.OutputObject
    >;
    MaxLoanToValueChanged: TypedContractEvent<
      MaxLoanToValueChangedEvent.InputTuple,
      MaxLoanToValueChangedEvent.OutputTuple,
      MaxLoanToValueChangedEvent.OutputObject
    >;

    'MaxSlippageChanged(uint256)': TypedContractEvent<
      MaxSlippageChangedEvent.InputTuple,
      MaxSlippageChangedEvent.OutputTuple,
      MaxSlippageChangedEvent.OutputObject
    >;
    MaxSlippageChanged: TypedContractEvent<
      MaxSlippageChangedEvent.InputTuple,
      MaxSlippageChangedEvent.OutputTuple,
      MaxSlippageChangedEvent.OutputObject
    >;

    'NrLoopsChanged(uint256)': TypedContractEvent<
      NrLoopsChangedEvent.InputTuple,
      NrLoopsChangedEvent.OutputTuple,
      NrLoopsChangedEvent.OutputObject
    >;
    NrLoopsChanged: TypedContractEvent<
      NrLoopsChangedEvent.InputTuple,
      NrLoopsChangedEvent.OutputTuple,
      NrLoopsChangedEvent.OutputObject
    >;

    'OwnershipTransferred(address,address)': TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    'PriceMaxAgeChanged(uint256)': TypedContractEvent<
      PriceMaxAgeChangedEvent.InputTuple,
      PriceMaxAgeChangedEvent.OutputTuple,
      PriceMaxAgeChangedEvent.OutputObject
    >;
    PriceMaxAgeChanged: TypedContractEvent<
      PriceMaxAgeChangedEvent.InputTuple,
      PriceMaxAgeChangedEvent.OutputTuple,
      PriceMaxAgeChangedEvent.OutputObject
    >;

    'PriceMaxConfChanged(uint256)': TypedContractEvent<
      PriceMaxConfChangedEvent.InputTuple,
      PriceMaxConfChangedEvent.OutputTuple,
      PriceMaxConfChangedEvent.OutputObject
    >;
    PriceMaxConfChanged: TypedContractEvent<
      PriceMaxConfChangedEvent.InputTuple,
      PriceMaxConfChangedEvent.OutputTuple,
      PriceMaxConfChangedEvent.OutputObject
    >;
  };
}
