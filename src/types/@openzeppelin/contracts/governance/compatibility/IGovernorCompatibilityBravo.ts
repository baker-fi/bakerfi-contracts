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

export declare namespace IGovernorCompatibilityBravo {
  export type ReceiptStruct = {
    hasVoted: boolean;
    support: BigNumberish;
    votes: BigNumberish;
  };

  export type ReceiptStructOutput = [hasVoted: boolean, support: bigint, votes: bigint] & {
    hasVoted: boolean;
    support: bigint;
    votes: bigint;
  };
}

export interface IGovernorCompatibilityBravoInterface extends Interface {
  getFunction(
    nameOrSignature:
      | 'CLOCK_MODE'
      | 'COUNTING_MODE'
      | 'cancel(uint256)'
      | 'cancel(address[],uint256[],bytes[],bytes32)'
      | 'castVote'
      | 'castVoteBySig'
      | 'castVoteWithReason'
      | 'castVoteWithReasonAndParams'
      | 'castVoteWithReasonAndParamsBySig'
      | 'clock'
      | 'execute(address[],uint256[],bytes[],bytes32)'
      | 'execute(uint256)'
      | 'getActions'
      | 'getReceipt'
      | 'getVotes'
      | 'getVotesWithParams'
      | 'hasVoted'
      | 'hashProposal'
      | 'name'
      | 'proposalDeadline'
      | 'proposalProposer'
      | 'proposalSnapshot'
      | 'proposals'
      | 'propose(address[],uint256[],bytes[],string)'
      | 'propose(address[],uint256[],string[],bytes[],string)'
      | 'queue'
      | 'quorum'
      | 'quorumVotes'
      | 'state'
      | 'supportsInterface'
      | 'version'
      | 'votingDelay'
      | 'votingPeriod',
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | 'ProposalCanceled'
      | 'ProposalCreated'
      | 'ProposalExecuted'
      | 'VoteCast'
      | 'VoteCastWithParams',
  ): EventFragment;

  encodeFunctionData(functionFragment: 'CLOCK_MODE', values?: undefined): string;
  encodeFunctionData(functionFragment: 'COUNTING_MODE', values?: undefined): string;
  encodeFunctionData(functionFragment: 'cancel(uint256)', values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'cancel(address[],uint256[],bytes[],bytes32)',
    values: [AddressLike[], BigNumberish[], BytesLike[], BytesLike],
  ): string;
  encodeFunctionData(functionFragment: 'castVote', values: [BigNumberish, BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'castVoteBySig',
    values: [BigNumberish, BigNumberish, BigNumberish, BytesLike, BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'castVoteWithReason',
    values: [BigNumberish, BigNumberish, string],
  ): string;
  encodeFunctionData(
    functionFragment: 'castVoteWithReasonAndParams',
    values: [BigNumberish, BigNumberish, string, BytesLike],
  ): string;
  encodeFunctionData(
    functionFragment: 'castVoteWithReasonAndParamsBySig',
    values: [BigNumberish, BigNumberish, string, BytesLike, BigNumberish, BytesLike, BytesLike],
  ): string;
  encodeFunctionData(functionFragment: 'clock', values?: undefined): string;
  encodeFunctionData(
    functionFragment: 'execute(address[],uint256[],bytes[],bytes32)',
    values: [AddressLike[], BigNumberish[], BytesLike[], BytesLike],
  ): string;
  encodeFunctionData(functionFragment: 'execute(uint256)', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'getActions', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'getReceipt', values: [BigNumberish, AddressLike]): string;
  encodeFunctionData(functionFragment: 'getVotes', values: [AddressLike, BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'getVotesWithParams',
    values: [AddressLike, BigNumberish, BytesLike],
  ): string;
  encodeFunctionData(functionFragment: 'hasVoted', values: [BigNumberish, AddressLike]): string;
  encodeFunctionData(
    functionFragment: 'hashProposal',
    values: [AddressLike[], BigNumberish[], BytesLike[], BytesLike],
  ): string;
  encodeFunctionData(functionFragment: 'name', values?: undefined): string;
  encodeFunctionData(functionFragment: 'proposalDeadline', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'proposalProposer', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'proposalSnapshot', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'proposals', values: [BigNumberish]): string;
  encodeFunctionData(
    functionFragment: 'propose(address[],uint256[],bytes[],string)',
    values: [AddressLike[], BigNumberish[], BytesLike[], string],
  ): string;
  encodeFunctionData(
    functionFragment: 'propose(address[],uint256[],string[],bytes[],string)',
    values: [AddressLike[], BigNumberish[], string[], BytesLike[], string],
  ): string;
  encodeFunctionData(functionFragment: 'queue', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'quorum', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'quorumVotes', values?: undefined): string;
  encodeFunctionData(functionFragment: 'state', values: [BigNumberish]): string;
  encodeFunctionData(functionFragment: 'supportsInterface', values: [BytesLike]): string;
  encodeFunctionData(functionFragment: 'version', values?: undefined): string;
  encodeFunctionData(functionFragment: 'votingDelay', values?: undefined): string;
  encodeFunctionData(functionFragment: 'votingPeriod', values?: undefined): string;

  decodeFunctionResult(functionFragment: 'CLOCK_MODE', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'COUNTING_MODE', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'cancel(uint256)', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'cancel(address[],uint256[],bytes[],bytes32)',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'castVote', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'castVoteBySig', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'castVoteWithReason', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'castVoteWithReasonAndParams', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'castVoteWithReasonAndParamsBySig',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'clock', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'execute(address[],uint256[],bytes[],bytes32)',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'execute(uint256)', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getActions', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getReceipt', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getVotes', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'getVotesWithParams', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'hasVoted', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'hashProposal', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'name', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'proposalDeadline', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'proposalProposer', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'proposalSnapshot', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'proposals', data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: 'propose(address[],uint256[],bytes[],string)',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(
    functionFragment: 'propose(address[],uint256[],string[],bytes[],string)',
    data: BytesLike,
  ): Result;
  decodeFunctionResult(functionFragment: 'queue', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'quorum', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'quorumVotes', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'state', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'supportsInterface', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'version', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'votingDelay', data: BytesLike): Result;
  decodeFunctionResult(functionFragment: 'votingPeriod', data: BytesLike): Result;
}

export namespace ProposalCanceledEvent {
  export type InputTuple = [proposalId: BigNumberish];
  export type OutputTuple = [proposalId: bigint];
  export interface OutputObject {
    proposalId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ProposalCreatedEvent {
  export type InputTuple = [
    proposalId: BigNumberish,
    proposer: AddressLike,
    targets: AddressLike[],
    values: BigNumberish[],
    signatures: string[],
    calldatas: BytesLike[],
    voteStart: BigNumberish,
    voteEnd: BigNumberish,
    description: string,
  ];
  export type OutputTuple = [
    proposalId: bigint,
    proposer: string,
    targets: string[],
    values: bigint[],
    signatures: string[],
    calldatas: string[],
    voteStart: bigint,
    voteEnd: bigint,
    description: string,
  ];
  export interface OutputObject {
    proposalId: bigint;
    proposer: string;
    targets: string[];
    values: bigint[];
    signatures: string[];
    calldatas: string[];
    voteStart: bigint;
    voteEnd: bigint;
    description: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ProposalExecutedEvent {
  export type InputTuple = [proposalId: BigNumberish];
  export type OutputTuple = [proposalId: bigint];
  export interface OutputObject {
    proposalId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace VoteCastEvent {
  export type InputTuple = [
    voter: AddressLike,
    proposalId: BigNumberish,
    support: BigNumberish,
    weight: BigNumberish,
    reason: string,
  ];
  export type OutputTuple = [
    voter: string,
    proposalId: bigint,
    support: bigint,
    weight: bigint,
    reason: string,
  ];
  export interface OutputObject {
    voter: string;
    proposalId: bigint;
    support: bigint;
    weight: bigint;
    reason: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace VoteCastWithParamsEvent {
  export type InputTuple = [
    voter: AddressLike,
    proposalId: BigNumberish,
    support: BigNumberish,
    weight: BigNumberish,
    reason: string,
    params: BytesLike,
  ];
  export type OutputTuple = [
    voter: string,
    proposalId: bigint,
    support: bigint,
    weight: bigint,
    reason: string,
    params: string,
  ];
  export interface OutputObject {
    voter: string;
    proposalId: bigint;
    support: bigint;
    weight: bigint;
    reason: string;
    params: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface IGovernorCompatibilityBravo extends BaseContract {
  connect(runner?: ContractRunner | null): IGovernorCompatibilityBravo;
  waitForDeployment(): Promise<this>;

  interface: IGovernorCompatibilityBravoInterface;

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

  CLOCK_MODE: TypedContractMethod<[], [string], 'view'>;

  COUNTING_MODE: TypedContractMethod<[], [string], 'view'>;

  'cancel(uint256)': TypedContractMethod<[proposalId: BigNumberish], [void], 'nonpayable'>;

  'cancel(address[],uint256[],bytes[],bytes32)': TypedContractMethod<
    [
      targets: AddressLike[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      descriptionHash: BytesLike,
    ],
    [bigint],
    'nonpayable'
  >;

  castVote: TypedContractMethod<
    [proposalId: BigNumberish, support: BigNumberish],
    [bigint],
    'nonpayable'
  >;

  castVoteBySig: TypedContractMethod<
    [proposalId: BigNumberish, support: BigNumberish, v: BigNumberish, r: BytesLike, s: BytesLike],
    [bigint],
    'nonpayable'
  >;

  castVoteWithReason: TypedContractMethod<
    [proposalId: BigNumberish, support: BigNumberish, reason: string],
    [bigint],
    'nonpayable'
  >;

  castVoteWithReasonAndParams: TypedContractMethod<
    [proposalId: BigNumberish, support: BigNumberish, reason: string, params: BytesLike],
    [bigint],
    'nonpayable'
  >;

  castVoteWithReasonAndParamsBySig: TypedContractMethod<
    [
      proposalId: BigNumberish,
      support: BigNumberish,
      reason: string,
      params: BytesLike,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
    ],
    [bigint],
    'nonpayable'
  >;

  clock: TypedContractMethod<[], [bigint], 'view'>;

  'execute(address[],uint256[],bytes[],bytes32)': TypedContractMethod<
    [
      targets: AddressLike[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      descriptionHash: BytesLike,
    ],
    [bigint],
    'payable'
  >;

  'execute(uint256)': TypedContractMethod<[proposalId: BigNumberish], [void], 'payable'>;

  getActions: TypedContractMethod<
    [proposalId: BigNumberish],
    [
      [string[], bigint[], string[], string[]] & {
        targets: string[];
        values: bigint[];
        signatures: string[];
        calldatas: string[];
      },
    ],
    'view'
  >;

  getReceipt: TypedContractMethod<
    [proposalId: BigNumberish, voter: AddressLike],
    [IGovernorCompatibilityBravo.ReceiptStructOutput],
    'view'
  >;

  getVotes: TypedContractMethod<[account: AddressLike, timepoint: BigNumberish], [bigint], 'view'>;

  getVotesWithParams: TypedContractMethod<
    [account: AddressLike, timepoint: BigNumberish, params: BytesLike],
    [bigint],
    'view'
  >;

  hasVoted: TypedContractMethod<
    [proposalId: BigNumberish, account: AddressLike],
    [boolean],
    'view'
  >;

  hashProposal: TypedContractMethod<
    [
      targets: AddressLike[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      descriptionHash: BytesLike,
    ],
    [bigint],
    'view'
  >;

  name: TypedContractMethod<[], [string], 'view'>;

  proposalDeadline: TypedContractMethod<[proposalId: BigNumberish], [bigint], 'view'>;

  proposalProposer: TypedContractMethod<[proposalId: BigNumberish], [string], 'view'>;

  proposalSnapshot: TypedContractMethod<[proposalId: BigNumberish], [bigint], 'view'>;

  proposals: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, string, bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean] & {
        id: bigint;
        proposer: string;
        eta: bigint;
        startBlock: bigint;
        endBlock: bigint;
        forVotes: bigint;
        againstVotes: bigint;
        abstainVotes: bigint;
        canceled: boolean;
        executed: boolean;
      },
    ],
    'view'
  >;

  'propose(address[],uint256[],bytes[],string)': TypedContractMethod<
    [targets: AddressLike[], values: BigNumberish[], calldatas: BytesLike[], description: string],
    [bigint],
    'nonpayable'
  >;

  'propose(address[],uint256[],string[],bytes[],string)': TypedContractMethod<
    [
      targets: AddressLike[],
      values: BigNumberish[],
      signatures: string[],
      calldatas: BytesLike[],
      description: string,
    ],
    [bigint],
    'nonpayable'
  >;

  queue: TypedContractMethod<[proposalId: BigNumberish], [void], 'nonpayable'>;

  quorum: TypedContractMethod<[timepoint: BigNumberish], [bigint], 'view'>;

  quorumVotes: TypedContractMethod<[], [bigint], 'view'>;

  state: TypedContractMethod<[proposalId: BigNumberish], [bigint], 'view'>;

  supportsInterface: TypedContractMethod<[interfaceId: BytesLike], [boolean], 'view'>;

  version: TypedContractMethod<[], [string], 'view'>;

  votingDelay: TypedContractMethod<[], [bigint], 'view'>;

  votingPeriod: TypedContractMethod<[], [bigint], 'view'>;

  getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;

  getFunction(nameOrSignature: 'CLOCK_MODE'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'COUNTING_MODE'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'cancel(uint256)',
  ): TypedContractMethod<[proposalId: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'cancel(address[],uint256[],bytes[],bytes32)',
  ): TypedContractMethod<
    [
      targets: AddressLike[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      descriptionHash: BytesLike,
    ],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'castVote',
  ): TypedContractMethod<[proposalId: BigNumberish, support: BigNumberish], [bigint], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'castVoteBySig',
  ): TypedContractMethod<
    [proposalId: BigNumberish, support: BigNumberish, v: BigNumberish, r: BytesLike, s: BytesLike],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'castVoteWithReason',
  ): TypedContractMethod<
    [proposalId: BigNumberish, support: BigNumberish, reason: string],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'castVoteWithReasonAndParams',
  ): TypedContractMethod<
    [proposalId: BigNumberish, support: BigNumberish, reason: string, params: BytesLike],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'castVoteWithReasonAndParamsBySig',
  ): TypedContractMethod<
    [
      proposalId: BigNumberish,
      support: BigNumberish,
      reason: string,
      params: BytesLike,
      v: BigNumberish,
      r: BytesLike,
      s: BytesLike,
    ],
    [bigint],
    'nonpayable'
  >;
  getFunction(nameOrSignature: 'clock'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'execute(address[],uint256[],bytes[],bytes32)',
  ): TypedContractMethod<
    [
      targets: AddressLike[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      descriptionHash: BytesLike,
    ],
    [bigint],
    'payable'
  >;
  getFunction(
    nameOrSignature: 'execute(uint256)',
  ): TypedContractMethod<[proposalId: BigNumberish], [void], 'payable'>;
  getFunction(nameOrSignature: 'getActions'): TypedContractMethod<
    [proposalId: BigNumberish],
    [
      [string[], bigint[], string[], string[]] & {
        targets: string[];
        values: bigint[];
        signatures: string[];
        calldatas: string[];
      },
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'getReceipt',
  ): TypedContractMethod<
    [proposalId: BigNumberish, voter: AddressLike],
    [IGovernorCompatibilityBravo.ReceiptStructOutput],
    'view'
  >;
  getFunction(
    nameOrSignature: 'getVotes',
  ): TypedContractMethod<[account: AddressLike, timepoint: BigNumberish], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'getVotesWithParams',
  ): TypedContractMethod<
    [account: AddressLike, timepoint: BigNumberish, params: BytesLike],
    [bigint],
    'view'
  >;
  getFunction(
    nameOrSignature: 'hasVoted',
  ): TypedContractMethod<[proposalId: BigNumberish, account: AddressLike], [boolean], 'view'>;
  getFunction(
    nameOrSignature: 'hashProposal',
  ): TypedContractMethod<
    [
      targets: AddressLike[],
      values: BigNumberish[],
      calldatas: BytesLike[],
      descriptionHash: BytesLike,
    ],
    [bigint],
    'view'
  >;
  getFunction(nameOrSignature: 'name'): TypedContractMethod<[], [string], 'view'>;
  getFunction(
    nameOrSignature: 'proposalDeadline',
  ): TypedContractMethod<[proposalId: BigNumberish], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'proposalProposer',
  ): TypedContractMethod<[proposalId: BigNumberish], [string], 'view'>;
  getFunction(
    nameOrSignature: 'proposalSnapshot',
  ): TypedContractMethod<[proposalId: BigNumberish], [bigint], 'view'>;
  getFunction(nameOrSignature: 'proposals'): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [bigint, string, bigint, bigint, bigint, bigint, bigint, bigint, boolean, boolean] & {
        id: bigint;
        proposer: string;
        eta: bigint;
        startBlock: bigint;
        endBlock: bigint;
        forVotes: bigint;
        againstVotes: bigint;
        abstainVotes: bigint;
        canceled: boolean;
        executed: boolean;
      },
    ],
    'view'
  >;
  getFunction(
    nameOrSignature: 'propose(address[],uint256[],bytes[],string)',
  ): TypedContractMethod<
    [targets: AddressLike[], values: BigNumberish[], calldatas: BytesLike[], description: string],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'propose(address[],uint256[],string[],bytes[],string)',
  ): TypedContractMethod<
    [
      targets: AddressLike[],
      values: BigNumberish[],
      signatures: string[],
      calldatas: BytesLike[],
      description: string,
    ],
    [bigint],
    'nonpayable'
  >;
  getFunction(
    nameOrSignature: 'queue',
  ): TypedContractMethod<[proposalId: BigNumberish], [void], 'nonpayable'>;
  getFunction(
    nameOrSignature: 'quorum',
  ): TypedContractMethod<[timepoint: BigNumberish], [bigint], 'view'>;
  getFunction(nameOrSignature: 'quorumVotes'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'state',
  ): TypedContractMethod<[proposalId: BigNumberish], [bigint], 'view'>;
  getFunction(
    nameOrSignature: 'supportsInterface',
  ): TypedContractMethod<[interfaceId: BytesLike], [boolean], 'view'>;
  getFunction(nameOrSignature: 'version'): TypedContractMethod<[], [string], 'view'>;
  getFunction(nameOrSignature: 'votingDelay'): TypedContractMethod<[], [bigint], 'view'>;
  getFunction(nameOrSignature: 'votingPeriod'): TypedContractMethod<[], [bigint], 'view'>;

  getEvent(
    key: 'ProposalCanceled',
  ): TypedContractEvent<
    ProposalCanceledEvent.InputTuple,
    ProposalCanceledEvent.OutputTuple,
    ProposalCanceledEvent.OutputObject
  >;
  getEvent(
    key: 'ProposalCreated',
  ): TypedContractEvent<
    ProposalCreatedEvent.InputTuple,
    ProposalCreatedEvent.OutputTuple,
    ProposalCreatedEvent.OutputObject
  >;
  getEvent(
    key: 'ProposalExecuted',
  ): TypedContractEvent<
    ProposalExecutedEvent.InputTuple,
    ProposalExecutedEvent.OutputTuple,
    ProposalExecutedEvent.OutputObject
  >;
  getEvent(
    key: 'VoteCast',
  ): TypedContractEvent<
    VoteCastEvent.InputTuple,
    VoteCastEvent.OutputTuple,
    VoteCastEvent.OutputObject
  >;
  getEvent(
    key: 'VoteCastWithParams',
  ): TypedContractEvent<
    VoteCastWithParamsEvent.InputTuple,
    VoteCastWithParamsEvent.OutputTuple,
    VoteCastWithParamsEvent.OutputObject
  >;

  filters: {
    'ProposalCanceled(uint256)': TypedContractEvent<
      ProposalCanceledEvent.InputTuple,
      ProposalCanceledEvent.OutputTuple,
      ProposalCanceledEvent.OutputObject
    >;
    ProposalCanceled: TypedContractEvent<
      ProposalCanceledEvent.InputTuple,
      ProposalCanceledEvent.OutputTuple,
      ProposalCanceledEvent.OutputObject
    >;

    'ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)': TypedContractEvent<
      ProposalCreatedEvent.InputTuple,
      ProposalCreatedEvent.OutputTuple,
      ProposalCreatedEvent.OutputObject
    >;
    ProposalCreated: TypedContractEvent<
      ProposalCreatedEvent.InputTuple,
      ProposalCreatedEvent.OutputTuple,
      ProposalCreatedEvent.OutputObject
    >;

    'ProposalExecuted(uint256)': TypedContractEvent<
      ProposalExecutedEvent.InputTuple,
      ProposalExecutedEvent.OutputTuple,
      ProposalExecutedEvent.OutputObject
    >;
    ProposalExecuted: TypedContractEvent<
      ProposalExecutedEvent.InputTuple,
      ProposalExecutedEvent.OutputTuple,
      ProposalExecutedEvent.OutputObject
    >;

    'VoteCast(address,uint256,uint8,uint256,string)': TypedContractEvent<
      VoteCastEvent.InputTuple,
      VoteCastEvent.OutputTuple,
      VoteCastEvent.OutputObject
    >;
    VoteCast: TypedContractEvent<
      VoteCastEvent.InputTuple,
      VoteCastEvent.OutputTuple,
      VoteCastEvent.OutputObject
    >;

    'VoteCastWithParams(address,uint256,uint8,uint256,string,bytes)': TypedContractEvent<
      VoteCastWithParamsEvent.InputTuple,
      VoteCastWithParamsEvent.OutputTuple,
      VoteCastWithParamsEvent.OutputObject
    >;
    VoteCastWithParams: TypedContractEvent<
      VoteCastWithParamsEvent.InputTuple,
      VoteCastWithParamsEvent.OutputTuple,
      VoteCastWithParamsEvent.OutputObject
    >;
  };
}
