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
} from '../../common';

export interface ERC20MockInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'DOMAIN_SEPARATOR'
      | 'allowance'
      | 'approve'
      | 'balanceOf'
      | 'decimals'
      | 'decreaseAllowance'
      | 'eip712Domain'
      | 'increaseAllowance'
      | 'name'
      | 'nonces'
      | 'owner'
      | 'permit'
      | 'renounceOwnership'
      | 'setDecimals'
      | 'symbol'
      | 'totalSupply'
      | 'transfer'
      | 'transferFrom'
      | 'transferOwnership',
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | 'Approval'
      | 'EIP712DomainChanged'
      | 'OwnershipTransferred'
      | 'Transfer',
  ): EventFragment;

  encodeFunctionData(functionFragment: 'DOMAIN_SEPARATOR', values?: undefined): string;
  encodeFunctionData(functionFragment: 'allowance', values: [AddressLike, AddressLike]): string;
  encodeFunctionData(functionFragment: 'approve', values: [AddressLike, BigNumberish]): string;
  encodeFunctionData(functionFragment: 'balanceOf', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'decimals', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'decreaseAllowance',
    values: [AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: 'eip712Domain', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'increaseAllowance',
    values: [AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: 'name', values?: undefined): string;
  encodeFunctionData(functionFragment: 'nonces', values: [AddressLike]): string;
  encodeFunctionData(functionFragment: 'owner', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'permit',
    values: [
      AddressLike,
      AddressLike,
      BigNumberish,
      BigNumberish,
      BigNumberish,
      BytesLike,
      BytesLike,
    ],
  ): string;
  encodeFunctionData(functionFragment: 'renounceOwnership', values?: undefined): string;
  encodeFunctionData(functionFragment: 'setDecimals', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'symbol', values?: undefined): string;
  encodeFunctionData(functionFragment: 'totalSupply', values?: undefined): string;
  encodeFunctionData(functionFragment: 'transfer', values: [AddressLike, BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'transferFrom',
    values: [AddressLike, AddressLike, BigNumberish],
  ): string;
  encodeFunctionData(functionFragment: 'transferOwnership', values: [AddressLike]): string;

  decodeFunctionResult(functionFragment: 'DOMAIN_SEPARATOR', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'allowance', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'approve', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'balanceOf', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'decimals', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'decreaseAllowance', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'eip712Domain', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'increaseAllowance', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'name', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'nonces', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'owner', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'permit', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'renounceOwnership', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'setDecimals', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'symbol', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'totalSupply', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transfer', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferFrom', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'transferOwnership', data: BytesLike): Result;
}

export namespace ApprovalEvent {
  export type InputTuple = [owner: AddressLike, spender: AddressLike, value: BigNumberish];
  export type OutputTuple = [owner: string, spender: string, value: bigint];
  export interface OutputObject {
    owner: string;
    spender: string;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace EIP712DomainChangedEvent {
  export type InputTuple = [];
  export type OutputTuple = [];
  export interface OutputObject {}
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

export namespace TransferEvent {
  export type InputTuple = [from: AddressLike, to: AddressLike, value: BigNumberish];
  export type OutputTuple = [from: string, to: string, value: bigint];
  export interface OutputObject {
    from: string;
    to: string;
    value: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ERC20Mock extends BaseContract {
  connect(runner?: ContractRunner | null): ERC20Mock;
  waitForDeployment(): Promise<this>;

  interface: ERC20MockInterface;

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

  DOMAIN_SEPARATOR: TypedContractMethod<[], [string], 'view'>;

  allowance: TypedContractMethod<[owner: AddressLike, spender: AddressLike], [bigint], 'view'>;

  approve: TypedContractMethod<
    [spender: AddressLike, amount: BigNumberish],
    [boolean],
    'nonpayable'
  >;

  balanceOf: TypedContractMethod<[account: AddressLike], [bigint], 'view'>;

  decimals: TypedContractMethod<[], [bigint], 'view'>;

  decreaseAllowance: TypedContractMethod<
    [spender: AddressLike, subtractedValue: BigNumberish],
    [boolean],
    'nonpayable'
  >;

  eip712Domain: TypedContractMethod<
    [],
    [
      [string, string, string, bigint, string, string, bigint[]] & {
        fields: string;
        name: string;
        version: string;
        chainId: bigint;
        verifyingContract: string;
        salt: string;
        extensions: bigint[];
      },
    ],
    'view'
  >;

  increaseAllowance: TypedContractMethod<
    [spender: AddressLike, addedValue: BigNumberish],
    [boolean],
    'nonpayable'
  >;

  name: TypedContractMethod<[], [string], 'view'>;

  nonces: TypedContractMethod<[owner: AddressLike], [bigint], 'view'>;

  owner: TypedContractMethod<[], [string], 'view'>;

  permit: TypedContractMethod<
    [
      owner: AddressLike,
      spender: AddressLike,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
    ],
    [void],
    'nonpayable'
  >;

  renounceOwnership: TypedContractMethod<[], [void], 'nonpayable'>;

  setDecimals: TypedContractMethod<[decimals_: BigNumberish], [void], 'nonpayable'>;

  symbol: TypedContractMethod<[], [string], 'view'>;

  totalSupply: TypedContractMethod<[], [bigint], 'view'>;

  transfer: TypedContractMethod<[to: AddressLike, amount: BigNumberish], [boolean], 'nonpayable'>;

  transferFrom: TypedContractMethod<
    [from: AddressLike, to: AddressLike, amount: BigNumberish],
    [boolean],
    'nonpayable'
  >;

  transferOwnership: TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'DOMAIN_SEPARATOR'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'allowance',
  ): TypedContractMethod<[owner: AddressLike, spender: AddressLike], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'approve',
  ): TypedContractMethod<[spender: AddressLike, amount: BigNumberish], [boolean], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'balanceOf',
  ): TypedContractMethod<[account: AddressLike], [bigint], 'view'>;
  getFunction(nameOrSignature: 'decimals'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'decreaseAllowance',
  ): TypedContractMethod<
    [spender: AddressLike, subtractedValue: BigNumberish],
    [boolean],
    'nonpayable'
  >;
  getFunction(nameOrSignature: 'eip712Domain'): TypedContractMethod<
    [],
    [
      [string, string, string, bigint, string, string, bigint[]] & {
        fields: string;
        name: string;
        version: string;
        chainId: bigint;
        verifyingContract: string;
        salt: string;
        extensions: bigint[];
      },
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'increaseAllowance',
  ): TypedContractMethod<[spender: AddressLike, addedValue: BigNumberish], [boolean], 'nonpayable'>;
  getFunction(nameOrSignature: 'name'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'nonces',
  ): TypedContractMethod<[owner: AddressLike], [bigint], 'view'>;
  getFunction(nameOrSignature: 'owner'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'permit',
  ): TypedContractMethod<
    [
      owner: AddressLike,
      spender: AddressLike,
      value: BigNumberish,
      deadline: BigNumberish,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
    ],
    [void],
    'nonpayable'
  >;
  getFunction(nameOrSignature: 'renounceOwnership'): TypedContractMethod<[], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'setDecimals',
  ): TypedContractMethod<[decimals_: BigNumberish], [void], 'nonpayable'>;
  getFunction(nameOrSignature: 'symbol'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'totalSupply'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'transfer',
  ): TypedContractMethod<[to: AddressLike, amount: BigNumberish], [boolean], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'transferFrom',
  ): TypedContractMethod<
    [from: AddressLike, to: AddressLike, amount: BigNumberish],
    [boolean],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'transferOwnership',
  ): TypedContractMethod<[newOwner: AddressLike], [void], 'nonpayable'>;

  getEvent(
    key: 'Approval',
  ): TypedContractEvent<
    ApprovalEvent.InputTuple,
    ApprovalEvent.OutputTuple,
    ApprovalEvent.OutputObject
  >;
  getEvent(
    key: 'EIP712DomainChanged',
  ): TypedContractEvent<
    EIP712DomainChangedEvent.InputTuple,
    EIP712DomainChangedEvent.OutputTuple,
    EIP712DomainChangedEvent.OutputObject
  >;
  getEvent(
    key: 'OwnershipTransferred',
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: 'Transfer',
  ): TypedContractEvent<
    TransferEvent.InputTuple,
    TransferEvent.OutputTuple,
    TransferEvent.OutputObject
  >;

  filters: {
    'Approval(address,address,uint256)': TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;
    Approval: TypedContractEvent<
      ApprovalEvent.InputTuple,
      ApprovalEvent.OutputTuple,
      ApprovalEvent.OutputObject
    >;

    'EIP712DomainChanged()': TypedContractEvent<
      EIP712DomainChangedEvent.InputTuple,
      EIP712DomainChangedEvent.OutputTuple,
      EIP712DomainChangedEvent.OutputObject
    >;
    EIP712DomainChanged: TypedContractEvent<
      EIP712DomainChangedEvent.InputTuple,
      EIP712DomainChangedEvent.OutputTuple,
      EIP712DomainChangedEvent.OutputObject
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

    'Transfer(address,address,uint256)': TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
    Transfer: TypedContractEvent<
      TransferEvent.InputTuple,
      TransferEvent.OutputTuple,
      TransferEvent.OutputObject
    >;
  };
}
