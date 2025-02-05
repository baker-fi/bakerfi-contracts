/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
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
} from '../../common';

export interface VaultRegistryInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'getService'
      | 'getServiceFromHash'
      | 'getServiceNameHash'
      | 'owner'
      | 'registerService'
      | 'renounceOwnership'
      | 'transferOwnership'
      | 'unregisterService',
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: 'OwnershipTransferred' | 'ServiceRegistered' | 'ServiceUnregistered',
  ): EventFragment;

  encodeFunctionData(functionFragment: 'getService', values: [string]): string;
  encodeFunctionData(functionFragment: 'getServiceFromHash', values: [BytesLike]): string;
  encodeFunctionData(functionFragment: 'getServiceNameHash', values: [string]): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(functionFragment: 'registerService', values: [BytesLike, AddressLike]): string;
  encodeFunctionData(functionFragment: 'renounceOwnership', values?: undefined): string;
  encodeFunctionData(functionFragment: 'transferOwnership', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'unregisterService', values: [BytesLike]): string;

  decodeFunctionResult(functionFragment: 'getService', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getServiceFromHash', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getServiceNameHash', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'registerService', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'renounceOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'unregisterService', data: BytesLike): Result;
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

export namespace ServiceRegisteredEvent {
  export type InputTuple = [nameHash: BytesLike, service: AddressLike];
  export type OutputTuple = [nameHash: string, service: string];
  export interface OutputObject {
    nameHash: string;
    service: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ServiceUnregisteredEvent {
  export type InputTuple = [nameHash: BytesLike];
  export type OutputTuple = [nameHash: string];
  export interface OutputObject {
    nameHash: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface VaultRegistry extends BaseContract {
  connect(runner?: ContractRunner | null): VaultRegistry;
  waitForDeployment(): Promise<this>;

  interface: VaultRegistryInterface;

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

  getService: TypedContractMethod<[serviceName: string], [string], 'view'>;

  getServiceFromHash: TypedContractMethod<[serviceHash: BytesLike], [string], 'view'>;

  getServiceNameHash: TypedContractMethod<[name: string], [string], 'view'>;

  owner: TypedContractMethod<[], [string], 'view'>;

  registerService: TypedContractMethod<
    [serviceNameHash: BytesLike, serviceAddress: AddressLike],
    [void],
    'nonpayable'
  >;

  renounceOwnership: TypedContractMethod<[], [void], 'nonpayable'>;

  transferOwnership: TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;

  unregisterService: TypedContractMethod<[serviceNameHash: BytesLike], [void], 'nonpayable'>;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(
    nameOrSignature: 'getService',
  ): TypedContractMethod<[serviceName: string], [string], 'view'>;
  getFunction(
    nameOrSignature: 'getServiceFromHash',
  ): TypedContractMethod<[serviceHash: BytesLike], [string], 'view'>;
  getFunction(
    nameOrSignature: 'getServiceNameHash',
  ): TypedContractMethod<[name: string], [string], 'view'>;
  getFunction(nameOrSignature: 'owner'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'registerService',
  ): TypedContractMethod<
    [serviceNameHash: BytesLike, serviceAddress: AddressLike],
    [void],
    'nonpayable'
  >;
  getFunction(nameOrSignature: 'renounceOwnership'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'transferOwnership',
  ): TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'unregisterService',
  ): TypedContractMethod<[serviceNameHash: BytesLike], [void], 'nonpayable'>;

  getEvent(
    key: 'OwnershipTransferred',
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: 'ServiceRegistered',
  ): TypedContractEvent<
    ServiceRegisteredEvent.InputTuple,
    ServiceRegisteredEvent.OutputTuple,
    ServiceRegisteredEvent.OutputObject
  >;
  getEvent(
    key: 'ServiceUnregistered',
  ): TypedContractEvent<
    ServiceUnregisteredEvent.InputTuple,
    ServiceUnregisteredEvent.OutputTuple,
    ServiceUnregisteredEvent.OutputObject
  >;

  filters: {
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

    'ServiceRegistered(bytes32,address)': TypedContractEvent<
      ServiceRegisteredEvent.InputTuple,
      ServiceRegisteredEvent.OutputTuple,
      ServiceRegisteredEvent.OutputObject
    >;
    ServiceRegistered: TypedContractEvent<
      ServiceRegisteredEvent.InputTuple,
      ServiceRegisteredEvent.OutputTuple,
      ServiceRegisteredEvent.OutputObject
    >;

    'ServiceUnregistered(bytes32)': TypedContractEvent<
      ServiceUnregisteredEvent.InputTuple,
      ServiceUnregisteredEvent.OutputTuple,
      ServiceUnregisteredEvent.OutputObject
    >;
    ServiceUnregistered: TypedContractEvent<
      ServiceUnregisteredEvent.InputTuple,
      ServiceUnregisteredEvent.OutputTuple,
      ServiceUnregisteredEvent.OutputObject
    >;
  };
}
