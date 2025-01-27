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

export interface StrategyLeverageAAVEv3Interface extends Interface {
  getFunction(
    nameOrSignature:
      | "asset"
      | "deploy"
      | "disableRoute"
      | "enableRoute"
      | "getBalances"
      | "getCollateralAsset"
      | "getDebAsset"
      | "getLoanToValue"
      | "getMaxLoanToValue"
      | "getMaxSlippage"
      | "getNrLoops"
      | "getOracle"
      | "getPosition"
      | "getPriceMaxAge"
      | "getPriceMaxConf"
      | "governor"
      | "harvest"
      | "initialize"
      | "initializeV4"
      | "isRouteEnabled"
      | "onFlashLoan"
      | "owner"
      | "renounceOwnership"
      | "setLoanToValue"
      | "setMaxLoanToValue"
      | "setMaxSlippage"
      | "setNrLoops"
      | "setOracle"
      | "setPriceMaxAge"
      | "setPriceMaxConf"
      | "totalAssets"
      | "transferGovernorship"
      | "transferOwnership"
      | "undeploy"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "GovernshipTransferred"
      | "Initialized"
      | "LoanToValueChanged"
      | "MaxLoanToValueChanged"
      | "MaxSlippageChanged"
      | "NrLoopsChanged"
      | "OwnershipTransferred"
      | "PriceMaxAgeChanged"
      | "PriceMaxConfChanged"
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
  encodeFunctionData(
    functionFragment: "disableRoute",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "enableRoute",
    values: [AddressLike, AddressLike, UseUnifiedSwapper.RouteInfoStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getBalances",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getCollateralAsset",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getDebAsset",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLoanToValue",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMaxLoanToValue",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMaxSlippage",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getNrLoops",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getOracle", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getPosition",
    values: [IOracle.PriceOptionsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "getPriceMaxAge",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPriceMaxConf",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "governor", values?: undefined): string;
  encodeFunctionData(functionFragment: "harvest", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "initializeV4",
    values: [
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      AddressLike,
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "isRouteEnabled",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "onFlashLoan",
    values: [AddressLike, AddressLike, BigNumberish, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setLoanToValue",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setMaxLoanToValue",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setMaxSlippage",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setNrLoops",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setOracle",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setPriceMaxAge",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setPriceMaxConf",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "totalAssets",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferGovernorship",
    values: [AddressLike]
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
  decodeFunctionResult(
    functionFragment: "disableRoute",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "enableRoute",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getBalances",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getCollateralAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDebAsset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLoanToValue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMaxLoanToValue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMaxSlippage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getNrLoops", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getOracle", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPosition",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPriceMaxAge",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPriceMaxConf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "governor", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "harvest", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "initializeV4",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isRouteEnabled",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "onFlashLoan",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setLoanToValue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMaxLoanToValue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMaxSlippage",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setNrLoops", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "setOracle", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setPriceMaxAge",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setPriceMaxConf",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "totalAssets",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferGovernorship",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "undeploy", data: BytesLike): Result;
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

export interface StrategyLeverageAAVEv3 extends BaseContract {
  connect(runner?: ContractRunner | null): StrategyLeverageAAVEv3;
  waitForDeployment(): Promise<this>;

  interface: StrategyLeverageAAVEv3Interface;

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

  getBalances: TypedContractMethod<
    [],
    [[bigint, bigint] & { collateralBalance: bigint; debtBalance: bigint }],
    "view"
  >;

  getCollateralAsset: TypedContractMethod<[], [string], "view">;

  getDebAsset: TypedContractMethod<[], [string], "view">;

  getLoanToValue: TypedContractMethod<[], [bigint], "view">;

  getMaxLoanToValue: TypedContractMethod<[], [bigint], "view">;

  getMaxSlippage: TypedContractMethod<[], [bigint], "view">;

  getNrLoops: TypedContractMethod<[], [bigint], "view">;

  getOracle: TypedContractMethod<[], [string], "view">;

  getPosition: TypedContractMethod<
    [priceOptions: IOracle.PriceOptionsStruct],
    [
      [bigint, bigint, bigint] & {
        totalCollateralInAsset: bigint;
        totalDebtInAsset: bigint;
        loanToValue: bigint;
      }
    ],
    "view"
  >;

  getPriceMaxAge: TypedContractMethod<[], [bigint], "view">;

  getPriceMaxConf: TypedContractMethod<[], [bigint], "view">;

  governor: TypedContractMethod<[], [string], "view">;

  harvest: TypedContractMethod<[], [bigint], "nonpayable">;

  initialize: TypedContractMethod<
    [
      initialOwner: AddressLike,
      initialGovernor: AddressLike,
      collateralToken: AddressLike,
      debtToken: AddressLike,
      oracle: AddressLike,
      flashLender: AddressLike,
      aaveV3Pool: AddressLike,
      eModeCategory: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  initializeV4: TypedContractMethod<
    [
      initialOwner: AddressLike,
      initialGovernor: AddressLike,
      flashLender: AddressLike,
      collateralToken: AddressLike,
      debtToken: AddressLike,
      oracle: AddressLike,
      aaveV3Pool: AddressLike,
      fromVersion: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  isRouteEnabled: TypedContractMethod<
    [tokenIn: AddressLike, tokenOut: AddressLike],
    [boolean],
    "view"
  >;

  onFlashLoan: TypedContractMethod<
    [
      initiator: AddressLike,
      token: AddressLike,
      amount: BigNumberish,
      fee: BigNumberish,
      callData: BytesLike
    ],
    [string],
    "nonpayable"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  setLoanToValue: TypedContractMethod<
    [loanToValue: BigNumberish],
    [void],
    "nonpayable"
  >;

  setMaxLoanToValue: TypedContractMethod<
    [maxLoanToValue: BigNumberish],
    [void],
    "nonpayable"
  >;

  setMaxSlippage: TypedContractMethod<
    [slippage: BigNumberish],
    [void],
    "nonpayable"
  >;

  setNrLoops: TypedContractMethod<
    [nrLoops: BigNumberish],
    [void],
    "nonpayable"
  >;

  setOracle: TypedContractMethod<[oracle: AddressLike], [void], "nonpayable">;

  setPriceMaxAge: TypedContractMethod<
    [value: BigNumberish],
    [void],
    "nonpayable"
  >;

  setPriceMaxConf: TypedContractMethod<
    [value: BigNumberish],
    [void],
    "nonpayable"
  >;

  totalAssets: TypedContractMethod<[], [bigint], "view">;

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
    nameOrSignature: "getBalances"
  ): TypedContractMethod<
    [],
    [[bigint, bigint] & { collateralBalance: bigint; debtBalance: bigint }],
    "view"
  >;
  getFunction(
    nameOrSignature: "getCollateralAsset"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getDebAsset"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getLoanToValue"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getMaxLoanToValue"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getMaxSlippage"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getNrLoops"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getOracle"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getPosition"
  ): TypedContractMethod<
    [priceOptions: IOracle.PriceOptionsStruct],
    [
      [bigint, bigint, bigint] & {
        totalCollateralInAsset: bigint;
        totalDebtInAsset: bigint;
        loanToValue: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "getPriceMaxAge"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getPriceMaxConf"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "governor"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "harvest"
  ): TypedContractMethod<[], [bigint], "nonpayable">;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<
    [
      initialOwner: AddressLike,
      initialGovernor: AddressLike,
      collateralToken: AddressLike,
      debtToken: AddressLike,
      oracle: AddressLike,
      flashLender: AddressLike,
      aaveV3Pool: AddressLike,
      eModeCategory: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "initializeV4"
  ): TypedContractMethod<
    [
      initialOwner: AddressLike,
      initialGovernor: AddressLike,
      flashLender: AddressLike,
      collateralToken: AddressLike,
      debtToken: AddressLike,
      oracle: AddressLike,
      aaveV3Pool: AddressLike,
      fromVersion: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "isRouteEnabled"
  ): TypedContractMethod<
    [tokenIn: AddressLike, tokenOut: AddressLike],
    [boolean],
    "view"
  >;
  getFunction(
    nameOrSignature: "onFlashLoan"
  ): TypedContractMethod<
    [
      initiator: AddressLike,
      token: AddressLike,
      amount: BigNumberish,
      fee: BigNumberish,
      callData: BytesLike
    ],
    [string],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setLoanToValue"
  ): TypedContractMethod<[loanToValue: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setMaxLoanToValue"
  ): TypedContractMethod<[maxLoanToValue: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setMaxSlippage"
  ): TypedContractMethod<[slippage: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setNrLoops"
  ): TypedContractMethod<[nrLoops: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setOracle"
  ): TypedContractMethod<[oracle: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setPriceMaxAge"
  ): TypedContractMethod<[value: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setPriceMaxConf"
  ): TypedContractMethod<[value: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "totalAssets"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "transferGovernorship"
  ): TypedContractMethod<[_newGovernor: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "undeploy"
  ): TypedContractMethod<[amount: BigNumberish], [bigint], "nonpayable">;

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
    key: "LoanToValueChanged"
  ): TypedContractEvent<
    LoanToValueChangedEvent.InputTuple,
    LoanToValueChangedEvent.OutputTuple,
    LoanToValueChangedEvent.OutputObject
  >;
  getEvent(
    key: "MaxLoanToValueChanged"
  ): TypedContractEvent<
    MaxLoanToValueChangedEvent.InputTuple,
    MaxLoanToValueChangedEvent.OutputTuple,
    MaxLoanToValueChangedEvent.OutputObject
  >;
  getEvent(
    key: "MaxSlippageChanged"
  ): TypedContractEvent<
    MaxSlippageChangedEvent.InputTuple,
    MaxSlippageChangedEvent.OutputTuple,
    MaxSlippageChangedEvent.OutputObject
  >;
  getEvent(
    key: "NrLoopsChanged"
  ): TypedContractEvent<
    NrLoopsChangedEvent.InputTuple,
    NrLoopsChangedEvent.OutputTuple,
    NrLoopsChangedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "PriceMaxAgeChanged"
  ): TypedContractEvent<
    PriceMaxAgeChangedEvent.InputTuple,
    PriceMaxAgeChangedEvent.OutputTuple,
    PriceMaxAgeChangedEvent.OutputObject
  >;
  getEvent(
    key: "PriceMaxConfChanged"
  ): TypedContractEvent<
    PriceMaxConfChangedEvent.InputTuple,
    PriceMaxConfChangedEvent.OutputTuple,
    PriceMaxConfChangedEvent.OutputObject
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

    "LoanToValueChanged(uint256)": TypedContractEvent<
      LoanToValueChangedEvent.InputTuple,
      LoanToValueChangedEvent.OutputTuple,
      LoanToValueChangedEvent.OutputObject
    >;
    LoanToValueChanged: TypedContractEvent<
      LoanToValueChangedEvent.InputTuple,
      LoanToValueChangedEvent.OutputTuple,
      LoanToValueChangedEvent.OutputObject
    >;

    "MaxLoanToValueChanged(uint256)": TypedContractEvent<
      MaxLoanToValueChangedEvent.InputTuple,
      MaxLoanToValueChangedEvent.OutputTuple,
      MaxLoanToValueChangedEvent.OutputObject
    >;
    MaxLoanToValueChanged: TypedContractEvent<
      MaxLoanToValueChangedEvent.InputTuple,
      MaxLoanToValueChangedEvent.OutputTuple,
      MaxLoanToValueChangedEvent.OutputObject
    >;

    "MaxSlippageChanged(uint256)": TypedContractEvent<
      MaxSlippageChangedEvent.InputTuple,
      MaxSlippageChangedEvent.OutputTuple,
      MaxSlippageChangedEvent.OutputObject
    >;
    MaxSlippageChanged: TypedContractEvent<
      MaxSlippageChangedEvent.InputTuple,
      MaxSlippageChangedEvent.OutputTuple,
      MaxSlippageChangedEvent.OutputObject
    >;

    "NrLoopsChanged(uint256)": TypedContractEvent<
      NrLoopsChangedEvent.InputTuple,
      NrLoopsChangedEvent.OutputTuple,
      NrLoopsChangedEvent.OutputObject
    >;
    NrLoopsChanged: TypedContractEvent<
      NrLoopsChangedEvent.InputTuple,
      NrLoopsChangedEvent.OutputTuple,
      NrLoopsChangedEvent.OutputObject
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

    "PriceMaxAgeChanged(uint256)": TypedContractEvent<
      PriceMaxAgeChangedEvent.InputTuple,
      PriceMaxAgeChangedEvent.OutputTuple,
      PriceMaxAgeChangedEvent.OutputObject
    >;
    PriceMaxAgeChanged: TypedContractEvent<
      PriceMaxAgeChangedEvent.InputTuple,
      PriceMaxAgeChangedEvent.OutputTuple,
      PriceMaxAgeChangedEvent.OutputObject
    >;

    "PriceMaxConfChanged(uint256)": TypedContractEvent<
      PriceMaxConfChangedEvent.InputTuple,
      PriceMaxConfChangedEvent.OutputTuple,
      PriceMaxConfChangedEvent.OutputObject
    >;
    PriceMaxConfChanged: TypedContractEvent<
      PriceMaxConfChangedEvent.InputTuple,
      PriceMaxConfChangedEvent.OutputTuple,
      PriceMaxConfChangedEvent.OutputObject
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
