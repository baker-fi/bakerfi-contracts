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
} from '../../../../common';

export interface UseIERC4626MockInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'approveTokenForVault'
      | 'governor'
      | 'initialize'
      | 'isTokenApprovedForVault'
      | 'owner'
      | 'renounceOwnership'
      | 'test__depositVault'
      | 'test__mintVault'
      | 'test__redeemVault'
      | 'test__withdrawVault'
      | 'transferGovernorship'
      | 'transferOwnership'
      | 'unapproveTokenForVault',
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: 'GovernshipTransferred' | 'Initialized' | 'OwnershipTransferred',
  ): EventFragment;

  encodeFunctionData(
    functionFragment: 'approveTokenForVault',
    values: [AddressLike, AddressLike],
  ): string;
  encodeFunctionData(functionFragment: 'governor', values?: undefined): string;
  encodeFunctionData(functionFragment: 'initialize', values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: 'isTokenApprovedForVault',
    values: [AddressLike, AddressLike],
  ): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'renounceOwnership', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'test__depositVault',
    values: [AddressLike, BigNumberish, AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'test__mintVault',
    values: [AddressLike, BigNumberish, AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'test__redeemVault',
    values: [AddressLike, BigNumberish, AddressLike, AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(
    functionFragment: 'test__withdrawVault',
    values: [AddressLike, BigNumberish, AddressLike, AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: 'transferGovernorship', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'transferOwnership', values: [AddressLike]): string;
  encodeFunctionData(
    functionFragment: 'unapproveTokenForVault',
    values: [AddressLike, AddressLike],
  ): string;

  decodeFunctionResult(functionFragment: 'approveTokenForVault', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'governor', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'initialize', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'isTokenApprovedForVault', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'renounceOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'test__depositVault', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'test__mintVault', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'test__redeemVault', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'test__withdrawVault', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferGovernorship', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'unapproveTokenForVault', data: BytesLike): Result;
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

export interface UseIERC4626Mock extends BaseContract {
  connect(runner?: ContractRunner | null): UseIERC4626Mock;
  waitForDeployment(): Promise<this>;

  interface: UseIERC4626MockInterface;

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

  approveTokenForVault: TypedContractMethod<
    [vault: AddressLike, token: AddressLike],
    [void],
    'nonpayable'
  >;

  governor: TypedContractMethod<[], [string], 'view'>;

  initialize: TypedContractMethod<[initialOwner: AddressLike], [void], 'nonpayable'>;

  isTokenApprovedForVault: TypedContractMethod<
    [vault: AddressLike, token: AddressLike],
    [boolean],
    'view'
  >;

  owner: TypedContractMethod<[], [string], 'view'>;

  renounceOwnership: TypedContractMethod<[], [void], 'nonpayable'>;

  test__depositVault: TypedContractMethod<
    [vault: AddressLike, assets: BigNumberish, receiver: AddressLike, minShares: BigNumberish],
    [bigint],
    'nonpayable'
  >;

  test__mintVault: TypedContractMethod<
    [vault: AddressLike, shares: BigNumberish, receiver: AddressLike, maxAssets: BigNumberish],
    [bigint],
    'nonpayable'
  >;

  test__redeemVault: TypedContractMethod<
    [
      vault: AddressLike,
      shares: BigNumberish,
      receiver: AddressLike,
      owner: AddressLike,
      minAssets: BigNumberish,
    ],
    [bigint],
    'nonpayable'
  >;

  test__withdrawVault: TypedContractMethod<
    [
      vault: AddressLike,
      assets: BigNumberish,
      receiver: AddressLike,
      owner: AddressLike,
      maxShares: BigNumberish,
    ],
    [bigint],
    'nonpayable'
  >;

  transferGovernorship: TypedContractMethod<[_newGovernor: AddressLike], [void], 'nonpayable'>;

  transferOwnership: TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;

  unapproveTokenForVault: TypedContractMethod<
    [vault: AddressLike, token: AddressLike],
    [void],
    'nonpayable'
  >;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(
    nameOrSignature: 'approveTokenForVault',
  ): TypedContractMethod<[vault: AddressLike, token: AddressLike], [void], 'nonpayable'>;
  getFunction(nameOrSignature: 'governor'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'initialize',
  ): TypedContractMethod<[initialOwner: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'isTokenApprovedForVault',
  ): TypedContractMethod<[vault: AddressLike, token: AddressLike], [boolean], 'view'>;
  getFunction(nameOrSignature: 'owner'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'renounceOwnership'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'test__depositVault',
  ): TypedContractMethod<
    [vault: AddressLike, assets: BigNumberish, receiver: AddressLike, minShares: BigNumberish],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'test__mintVault',
  ): TypedContractMethod<
    [vault: AddressLike, shares: BigNumberish, receiver: AddressLike, maxAssets: BigNumberish],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'test__redeemVault',
  ): TypedContractMethod<
    [
      vault: AddressLike,
      shares: BigNumberish,
      receiver: AddressLike,
      owner: AddressLike,
      minAssets: BigNumberish,
    ],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'test__withdrawVault',
  ): TypedContractMethod<
    [
      vault: AddressLike,
      assets: BigNumberish,
      receiver: AddressLike,
      owner: AddressLike,
      maxShares: BigNumberish,
    ],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'transferGovernorship',
  ): TypedContractMethod<[_newGovernor: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'transferOwnership',
  ): TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'unapproveTokenForVault',
  ): TypedContractMethod<[vault: AddressLike, token: AddressLike], [void], 'nonpayable'>;

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
    key: 'OwnershipTransferred',
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
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
  };
}
