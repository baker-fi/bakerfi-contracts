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
} from '../../common';

export interface LeverageTestInterface extends Interface {
  getFunction(
    nameOrSignature: 'calcDeltaPosition' | 'calculateDebtToPay' | 'calculateLeverageRatio',
  ): FunctionFragment;

  encodeFunctionData(
    functionFragment: 'calcDeltaPosition',
    values: [BigNumberish, BigNumberish, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'calculateDebtToPay',
    values: [BigNumberish, BigNumberish, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'calculateLeverageRatio',
    values: [BigNumberish, BigNumberish, BigNumberish],
  ): string;

  decodeFunctionResult(functionFragment: 'calcDeltaPosition', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'calculateDebtToPay', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'calculateLeverageRatio', data: BytesLike): Result;
}

export interface LeverageTest extends BaseContract {
  connect(runner?: ContractRunner | null): LeverageTest;
  waitForDeployment(): Promise<this>;

  interface: LeverageTestInterface;

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

  calcDeltaPosition: TypedContractMethod<
    [
      percentageToBurn: BigNumberish,
      totalCollateralBaseInEth: BigNumberish,
      totalDebtBaseInEth: BigNumberish,
    ],
    [
      [bigint, bigint] & {
        deltaCollateralInETH: bigint;
        deltaDebtInETH: bigint;
      },
    ],
    'view'
  >;

  calculateDebtToPay: TypedContractMethod<
    [targetLoanToValue: BigNumberish, collateral: BigNumberish, debt: BigNumberish],
    [bigint],
    'view'
  >;

  calculateLeverageRatio: TypedContractMethod<
    [baseValue: BigNumberish, loanToValue: BigNumberish, nrLoops: BigNumberish],
    [bigint],
    'view'
  >;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'calcDeltaPosition'): TypedContractMethod<
    [
      percentageToBurn: BigNumberish,
      totalCollateralBaseInEth: BigNumberish,
      totalDebtBaseInEth: BigNumberish,
    ],
    [
      [bigint, bigint] & {
        deltaCollateralInETH: bigint;
        deltaDebtInETH: bigint;
      },
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'calculateDebtToPay',
  ): TypedContractMethod<
    [targetLoanToValue: BigNumberish, collateral: BigNumberish, debt: BigNumberish],
    [bigint],
    'view'
  >;
  getFunction(
    nameOrSignature: 'calculateLeverageRatio',
  ): TypedContractMethod<
    [baseValue: BigNumberish, loanToValue: BigNumberish, nrLoops: BigNumberish],
    [bigint],
    'view'
  >;

  filters: {};
}
