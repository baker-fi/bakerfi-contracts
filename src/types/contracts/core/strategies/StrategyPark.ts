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
} from "../../../common";

export interface StrategyParkInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "asset"
      | "deploy"
      | "harvest"
      | "owner"
      | "renounceOwnership"
      | "totalAssets"
      | "transferOwnership"
      | "undeploy"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "OwnershipTransferred"
      | "StrategyAmountUpdate"
      | "StrategyDeploy"
      | "StrategyLoss"
      | "StrategyProfit"
      | "StrategyUndeploy"
  ): EventFragment;

  encodeFunctionData(functionFragment: "asset", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "deploy",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "harvest", values?: undefined): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "totalAssets",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "undeploy",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "asset", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deploy", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "harvest", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalAssets",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "undeploy", data: BytesLike): Result;
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

export interface StrategyPark extends BaseContract {
  connect(runner?: ContractRunner | null): StrategyPark;
  waitForDeployment(): Promise<this>;

  interface: StrategyParkInterface;

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

  asset: TypedContractMethod<[], [string], "view">;

  deploy: TypedContractMethod<[amount: BigNumberish], [bigint], "nonpayable">;

  harvest: TypedContractMethod<[], [bigint], "nonpayable">;

  owner: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  totalAssets: TypedContractMethod<[], [bigint], "view">;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  undeploy: TypedContractMethod<[amount: BigNumberish], [bigint], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "asset"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "deploy"
  ): TypedContractMethod<[amount: BigNumberish], [bigint], "nonpayable">;
  getFunction(
    nameOrSignature: "harvest"
  ): TypedContractMethod<[], [bigint], "nonpayable">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "totalAssets"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "undeploy"
  ): TypedContractMethod<[amount: BigNumberish], [bigint], "nonpayable">;

  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "StrategyAmountUpdate"
  ): TypedContractEvent<
    StrategyAmountUpdateEvent.InputTuple,
    StrategyAmountUpdateEvent.OutputTuple,
    StrategyAmountUpdateEvent.OutputObject
  >;
  getEvent(
    key: "StrategyDeploy"
  ): TypedContractEvent<
    StrategyDeployEvent.InputTuple,
    StrategyDeployEvent.OutputTuple,
    StrategyDeployEvent.OutputObject
  >;
  getEvent(
    key: "StrategyLoss"
  ): TypedContractEvent<
    StrategyLossEvent.InputTuple,
    StrategyLossEvent.OutputTuple,
    StrategyLossEvent.OutputObject
  >;
  getEvent(
    key: "StrategyProfit"
  ): TypedContractEvent<
    StrategyProfitEvent.InputTuple,
    StrategyProfitEvent.OutputTuple,
    StrategyProfitEvent.OutputObject
  >;
  getEvent(
    key: "StrategyUndeploy"
  ): TypedContractEvent<
    StrategyUndeployEvent.InputTuple,
    StrategyUndeployEvent.OutputTuple,
    StrategyUndeployEvent.OutputObject
  >;

  filters: {
    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "StrategyAmountUpdate(uint256)": TypedContractEvent<
      StrategyAmountUpdateEvent.InputTuple,
      StrategyAmountUpdateEvent.OutputTuple,
      StrategyAmountUpdateEvent.OutputObject
    >;
    StrategyAmountUpdate: TypedContractEvent<
      StrategyAmountUpdateEvent.InputTuple,
      StrategyAmountUpdateEvent.OutputTuple,
      StrategyAmountUpdateEvent.OutputObject
    >;

    "StrategyDeploy(address,uint256)": TypedContractEvent<
      StrategyDeployEvent.InputTuple,
      StrategyDeployEvent.OutputTuple,
      StrategyDeployEvent.OutputObject
    >;
    StrategyDeploy: TypedContractEvent<
      StrategyDeployEvent.InputTuple,
      StrategyDeployEvent.OutputTuple,
      StrategyDeployEvent.OutputObject
    >;

    "StrategyLoss(uint256)": TypedContractEvent<
      StrategyLossEvent.InputTuple,
      StrategyLossEvent.OutputTuple,
      StrategyLossEvent.OutputObject
    >;
    StrategyLoss: TypedContractEvent<
      StrategyLossEvent.InputTuple,
      StrategyLossEvent.OutputTuple,
      StrategyLossEvent.OutputObject
    >;

    "StrategyProfit(uint256)": TypedContractEvent<
      StrategyProfitEvent.InputTuple,
      StrategyProfitEvent.OutputTuple,
      StrategyProfitEvent.OutputObject
    >;
    StrategyProfit: TypedContractEvent<
      StrategyProfitEvent.InputTuple,
      StrategyProfitEvent.OutputTuple,
      StrategyProfitEvent.OutputObject
    >;

    "StrategyUndeploy(address,uint256)": TypedContractEvent<
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
