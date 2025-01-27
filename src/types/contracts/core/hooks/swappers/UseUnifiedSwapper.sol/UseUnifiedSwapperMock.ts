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
} from "../../../../../common";

export declare namespace UseUnifiedSwapper {
  export type RouteInfoStruct = {
    provider: BigNumberish;
    router: AddressLike;
    uniV3Tier: BigNumberish;
    tickSpacing: BigNumberish;
  };

  export type RouteInfoStructOutput = [
    provider: bigint,
    router: string,
    uniV3Tier: bigint,
    tickSpacing: bigint
  ] & {
    provider: bigint;
    router: string;
    uniV3Tier: bigint;
    tickSpacing: bigint;
  };
}

export declare namespace ISwapHandler {
  export type SwapParamsStruct = {
    underlyingIn: AddressLike;
    underlyingOut: AddressLike;
    mode: BigNumberish;
    amountIn: BigNumberish;
    amountOut: BigNumberish;
    payload: BytesLike;
  };

  export type SwapParamsStructOutput = [
    underlyingIn: string,
    underlyingOut: string,
    mode: bigint,
    amountIn: bigint,
    amountOut: bigint,
    payload: string
  ] & {
    underlyingIn: string;
    underlyingOut: string;
    mode: bigint;
    amountIn: bigint;
    amountOut: bigint;
    payload: string;
  };
}

export interface UseUnifiedSwapperMockInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "disableRoute"
      | "enableRoute"
      | "governor"
      | "isRouteEnabled"
      | "owner"
      | "renounceOwnership"
      | "test__swap"
      | "transferGovernorship"
      | "transferOwnership"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "GovernshipTransferred"
      | "Initialized"
      | "OwnershipTransferred"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "disableRoute",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "enableRoute",
    values: [AddressLike, AddressLike, UseUnifiedSwapper.RouteInfoStruct]
  ): string;
  encodeFunctionData(functionFragment: "governor", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "isRouteEnabled",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "test__swap",
    values: [ISwapHandler.SwapParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "transferGovernorship",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "disableRoute",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "enableRoute",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "governor", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "isRouteEnabled",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "test__swap", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferGovernorship",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
}

export namespace GovernshipTransferredEvent {
  export type InputTuple = [
    previousGovernor: AddressLike,
    newGovernor: AddressLike
  ];
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

export interface UseUnifiedSwapperMock extends BaseContract {
  connect(runner?: ContractRunner | null): UseUnifiedSwapperMock;
  waitForDeployment(): Promise<this>;

  interface: UseUnifiedSwapperMockInterface;

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

  disableRoute: TypedContractMethod<
    [tokenIn: AddressLike, tokenOut: AddressLike],
    [void],
    "nonpayable"
  >;

  enableRoute: TypedContractMethod<
    [
      tokenIn: AddressLike,
      tokenOut: AddressLike,
      routeInfo: UseUnifiedSwapper.RouteInfoStruct
    ],
    [void],
    "nonpayable"
  >;

  governor: TypedContractMethod<[], [string], "view">;

  isRouteEnabled: TypedContractMethod<
    [tokenIn: AddressLike, tokenOut: AddressLike],
    [boolean],
    "view"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  test__swap: TypedContractMethod<
    [params: ISwapHandler.SwapParamsStruct],
    [[bigint, bigint] & { amountIn: bigint; amountOut: bigint }],
    "nonpayable"
  >;

  transferGovernorship: TypedContractMethod<
    [_newGovernor: AddressLike],
    [void],
    "nonpayable"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "disableRoute"
  ): TypedContractMethod<
    [tokenIn: AddressLike, tokenOut: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "enableRoute"
  ): TypedContractMethod<
    [
      tokenIn: AddressLike,
      tokenOut: AddressLike,
      routeInfo: UseUnifiedSwapper.RouteInfoStruct
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "governor"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "isRouteEnabled"
  ): TypedContractMethod<
    [tokenIn: AddressLike, tokenOut: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "test__swap"
  ): TypedContractMethod<
    [params: ISwapHandler.SwapParamsStruct],
    [[bigint, bigint] & { amountIn: bigint; amountOut: bigint }],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferGovernorship"
  ): TypedContractMethod<[_newGovernor: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;

  getEvent(
    key: "GovernshipTransferred"
  ): TypedContractEvent<
    GovernshipTransferredEvent.InputTuple,
    GovernshipTransferredEvent.OutputTuple,
    GovernshipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;

  filters: {
    "GovernshipTransferred(address,address)": TypedContractEvent<
      GovernshipTransferredEvent.InputTuple,
      GovernshipTransferredEvent.OutputTuple,
      GovernshipTransferredEvent.OutputObject
    >;
    GovernshipTransferred: TypedContractEvent<
      GovernshipTransferredEvent.InputTuple,
      GovernshipTransferredEvent.OutputTuple,
      GovernshipTransferredEvent.OutputObject
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
  };
}
