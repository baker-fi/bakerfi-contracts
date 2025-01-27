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
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface VaultSettingsInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "_initializeVaultSettings"
      | "getFeeReceiver"
      | "getMaxDeposit"
      | "getPerformanceFee"
      | "getWithdrawalFee"
      | "isAccountEnabled"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "AccountWhiteList"
      | "FeeReceiverChanged"
      | "Initialized"
      | "MaxDepositChanged"
      | "PerformanceFeeChanged"
      | "WithdrawalFeeChanged"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "_initializeVaultSettings",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getFeeReceiver",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMaxDeposit",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPerformanceFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getWithdrawalFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "isAccountEnabled",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "_initializeVaultSettings",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getFeeReceiver",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMaxDeposit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPerformanceFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getWithdrawalFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isAccountEnabled",
    data: BytesLike
  ): Result;
}

export namespace AccountWhiteListEvent {
  export type InputTuple = [account: AddressLike, enabled: boolean];
  export type OutputTuple = [account: string, enabled: boolean];
  export interface OutputObject {
    account: string;
    enabled: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace FeeReceiverChangedEvent {
  export type InputTuple = [value: AddressLike];
  export type OutputTuple = [value: string];
  export interface OutputObject {
    value: string;
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

export namespace MaxDepositChangedEvent {
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

export namespace PerformanceFeeChangedEvent {
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

export namespace WithdrawalFeeChangedEvent {
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

export interface VaultSettings extends BaseContract {
  connect(runner?: ContractRunner | null): VaultSettings;
  waitForDeployment(): Promise<this>;

  interface: VaultSettingsInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  _initializeVaultSettings: TypedContractMethod<[], [void], "nonpayable">;

  getFeeReceiver: TypedContractMethod<[], [string], "view">;

  getMaxDeposit: TypedContractMethod<[], [bigint], "view">;

  getPerformanceFee: TypedContractMethod<[], [bigint], "view">;

  getWithdrawalFee: TypedContractMethod<[], [bigint], "view">;

  isAccountEnabled: TypedContractMethod<
    [account: AddressLike],
    [boolean],
    "view"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "_initializeVaultSettings"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "getFeeReceiver"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getMaxDeposit"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getPerformanceFee"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getWithdrawalFee"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "isAccountEnabled"
  ): TypedContractMethod<[account: AddressLike], [boolean], "view">;

  getEvent(
    key: "AccountWhiteList"
  ): TypedContractEvent<
    AccountWhiteListEvent.InputTuple,
    AccountWhiteListEvent.OutputTuple,
    AccountWhiteListEvent.OutputObject
  >;
  getEvent(
    key: "FeeReceiverChanged"
  ): TypedContractEvent<
    FeeReceiverChangedEvent.InputTuple,
    FeeReceiverChangedEvent.OutputTuple,
    FeeReceiverChangedEvent.OutputObject
  >;
  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "MaxDepositChanged"
  ): TypedContractEvent<
    MaxDepositChangedEvent.InputTuple,
    MaxDepositChangedEvent.OutputTuple,
    MaxDepositChangedEvent.OutputObject
  >;
  getEvent(
    key: "PerformanceFeeChanged"
  ): TypedContractEvent<
    PerformanceFeeChangedEvent.InputTuple,
    PerformanceFeeChangedEvent.OutputTuple,
    PerformanceFeeChangedEvent.OutputObject
  >;
  getEvent(
    key: "WithdrawalFeeChanged"
  ): TypedContractEvent<
    WithdrawalFeeChangedEvent.InputTuple,
    WithdrawalFeeChangedEvent.OutputTuple,
    WithdrawalFeeChangedEvent.OutputObject
  >;

  filters: {
    "AccountWhiteList(address,bool)": TypedContractEvent<
      AccountWhiteListEvent.InputTuple,
      AccountWhiteListEvent.OutputTuple,
      AccountWhiteListEvent.OutputObject
    >;
    AccountWhiteList: TypedContractEvent<
      AccountWhiteListEvent.InputTuple,
      AccountWhiteListEvent.OutputTuple,
      AccountWhiteListEvent.OutputObject
    >;

    "FeeReceiverChanged(address)": TypedContractEvent<
      FeeReceiverChangedEvent.InputTuple,
      FeeReceiverChangedEvent.OutputTuple,
      FeeReceiverChangedEvent.OutputObject
    >;
    FeeReceiverChanged: TypedContractEvent<
      FeeReceiverChangedEvent.InputTuple,
      FeeReceiverChangedEvent.OutputTuple,
      FeeReceiverChangedEvent.OutputObject
    >;

    "Initialized(uint8)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "MaxDepositChanged(uint256)": TypedContractEvent<
      MaxDepositChangedEvent.InputTuple,
      MaxDepositChangedEvent.OutputTuple,
      MaxDepositChangedEvent.OutputObject
    >;
    MaxDepositChanged: TypedContractEvent<
      MaxDepositChangedEvent.InputTuple,
      MaxDepositChangedEvent.OutputTuple,
      MaxDepositChangedEvent.OutputObject
    >;

    "PerformanceFeeChanged(uint256)": TypedContractEvent<
      PerformanceFeeChangedEvent.InputTuple,
      PerformanceFeeChangedEvent.OutputTuple,
      PerformanceFeeChangedEvent.OutputObject
    >;
    PerformanceFeeChanged: TypedContractEvent<
      PerformanceFeeChangedEvent.InputTuple,
      PerformanceFeeChangedEvent.OutputTuple,
      PerformanceFeeChangedEvent.OutputObject
    >;

    "WithdrawalFeeChanged(uint256)": TypedContractEvent<
      WithdrawalFeeChangedEvent.InputTuple,
      WithdrawalFeeChangedEvent.OutputTuple,
      WithdrawalFeeChangedEvent.OutputObject
    >;
    WithdrawalFeeChanged: TypedContractEvent<
      WithdrawalFeeChangedEvent.InputTuple,
      WithdrawalFeeChangedEvent.OutputTuple,
      WithdrawalFeeChangedEvent.OutputObject
    >;
  };
}
