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
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export declare namespace IQuoterV2 {
  export type QuoteExactInputSingleParamsStruct = {
    tokenIn: AddressLike;
    tokenOut: AddressLike;
    amountIn: BigNumberish;
    fee: BigNumberish;
    sqrtPriceLimitX96: BigNumberish;
  };

  export type QuoteExactInputSingleParamsStructOutput = [
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    fee: bigint,
    sqrtPriceLimitX96: bigint
  ] & {
    tokenIn: string;
    tokenOut: string;
    amountIn: bigint;
    fee: bigint;
    sqrtPriceLimitX96: bigint;
  };

  export type QuoteExactOutputSingleParamsStruct = {
    tokenIn: AddressLike;
    tokenOut: AddressLike;
    amount: BigNumberish;
    fee: BigNumberish;
    sqrtPriceLimitX96: BigNumberish;
  };

  export type QuoteExactOutputSingleParamsStructOutput = [
    tokenIn: string,
    tokenOut: string,
    amount: bigint,
    fee: bigint,
    sqrtPriceLimitX96: bigint
  ] & {
    tokenIn: string;
    tokenOut: string;
    amount: bigint;
    fee: bigint;
    sqrtPriceLimitX96: bigint;
  };
}

export interface QuoterV2MockInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "quoteExactInput"
      | "quoteExactInputSingle"
      | "quoteExactOutput"
      | "quoteExactOutputSingle"
      | "setRatio"
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: "quoteExactInput",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteExactInputSingle",
    values: [IQuoterV2.QuoteExactInputSingleParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteExactOutput",
    values: [BytesLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "quoteExactOutputSingle",
    values: [IQuoterV2.QuoteExactOutputSingleParamsStruct]
  ): string;
  encodeFunctionData(
    functionFragment: "setRatio",
    values: [BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "quoteExactInput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quoteExactInputSingle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quoteExactOutput",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "quoteExactOutputSingle",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setRatio", data: BytesLike): Result;
}

export interface QuoterV2Mock extends BaseContract {
  connect(runner?: ContractRunner | null): QuoterV2Mock;
  waitForDeployment(): Promise<this>;

  interface: QuoterV2MockInterface;

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

  quoteExactInput: TypedContractMethod<
    [path: BytesLike, amountIn: BigNumberish],
    [
      [bigint, bigint[], bigint[], bigint] & {
        amountOut: bigint;
        sqrtPriceX96AfterList: bigint[];
        initializedTicksCrossedList: bigint[];
        gasEstimate: bigint;
      }
    ],
    "nonpayable"
  >;

  quoteExactInputSingle: TypedContractMethod<
    [params: IQuoterV2.QuoteExactInputSingleParamsStruct],
    [
      [bigint, bigint, bigint, bigint] & {
        amountOut: bigint;
        sqrtPriceX96After: bigint;
        initializedTicksCrossed: bigint;
        gasEstimate: bigint;
      }
    ],
    "view"
  >;

  quoteExactOutput: TypedContractMethod<
    [path: BytesLike, amountOut: BigNumberish],
    [
      [bigint, bigint[], bigint[], bigint] & {
        amountIn: bigint;
        sqrtPriceX96AfterList: bigint[];
        initializedTicksCrossedList: bigint[];
        gasEstimate: bigint;
      }
    ],
    "nonpayable"
  >;

  quoteExactOutputSingle: TypedContractMethod<
    [params: IQuoterV2.QuoteExactOutputSingleParamsStruct],
    [
      [bigint, bigint, bigint, bigint] & {
        amountIn: bigint;
        sqrtPriceX96After: bigint;
        initializedTicksCrossed: bigint;
        gasEstimate: bigint;
      }
    ],
    "view"
  >;

  setRatio: TypedContractMethod<[ratio: BigNumberish], [void], "nonpayable">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "quoteExactInput"
  ): TypedContractMethod<
    [path: BytesLike, amountIn: BigNumberish],
    [
      [bigint, bigint[], bigint[], bigint] & {
        amountOut: bigint;
        sqrtPriceX96AfterList: bigint[];
        initializedTicksCrossedList: bigint[];
        gasEstimate: bigint;
      }
    ],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "quoteExactInputSingle"
  ): TypedContractMethod<
    [params: IQuoterV2.QuoteExactInputSingleParamsStruct],
    [
      [bigint, bigint, bigint, bigint] & {
        amountOut: bigint;
        sqrtPriceX96After: bigint;
        initializedTicksCrossed: bigint;
        gasEstimate: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "quoteExactOutput"
  ): TypedContractMethod<
    [path: BytesLike, amountOut: BigNumberish],
    [
      [bigint, bigint[], bigint[], bigint] & {
        amountIn: bigint;
        sqrtPriceX96AfterList: bigint[];
        initializedTicksCrossedList: bigint[];
        gasEstimate: bigint;
      }
    ],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "quoteExactOutputSingle"
  ): TypedContractMethod<
    [params: IQuoterV2.QuoteExactOutputSingleParamsStruct],
    [
      [bigint, bigint, bigint, bigint] & {
        amountIn: bigint;
        sqrtPriceX96After: bigint;
        initializedTicksCrossed: bigint;
        gasEstimate: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "setRatio"
  ): TypedContractMethod<[ratio: BigNumberish], [void], "nonpayable">;

  filters: {};
}
