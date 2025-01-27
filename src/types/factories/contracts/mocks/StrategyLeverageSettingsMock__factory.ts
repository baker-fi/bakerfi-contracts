/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  StrategyLeverageSettingsMock,
  StrategyLeverageSettingsMockInterface,
} from "../../../contracts/mocks/StrategyLeverageSettingsMock";

const _abi = [
  {
    inputs: [],
    name: "CallerNotTheGovernor",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidGovernorAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidLoopCount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidMaxLoanToValue",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPercentage",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidValue",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousGovernor",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newGovernor",
        type: "address",
      },
    ],
    name: "GovernshipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "LoanToValueChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "MaxLoanToValueChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "MaxSlippageChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "NrLoopsChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "PriceMaxAgeChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "PriceMaxConfChanged",
    type: "event",
  },
  {
    inputs: [],
    name: "getLoanToValue",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMaxLoanToValue",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMaxSlippage",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getNrLoops",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPriceMaxAge",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPriceMaxConf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "governor",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "initialOwner",
        type: "address",
      },
      {
        internalType: "address",
        name: "initialGovernor",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "loanToValue",
        type: "uint256",
      },
    ],
    name: "setLoanToValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "maxLoanToValue",
        type: "uint256",
      },
    ],
    name: "setMaxLoanToValue",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "slippage",
        type: "uint256",
      },
    ],
    name: "setMaxSlippage",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "nrLoops",
        type: "uint8",
      },
    ],
    name: "setNrLoops",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "setPriceMaxAge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "setPriceMaxConf",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_newGovernor",
        type: "address",
      },
    ],
    name: "transferGovernorship",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001961001e565b6100dd565b600054610100900460ff161561008a5760405162461bcd60e51b815260206004820152602760248201527f496e697469616c697a61626c653a20636f6e747261637420697320696e697469604482015266616c697a696e6760c81b606482015260840160405180910390fd5b60005460ff908116146100db576000805460ff191660ff9081179091556040519081527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b565b610bb9806100ec6000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c806384fe3754116100a2578063a6895a7d11610071578063a6895a7d146101fe578063adbfc31214610211578063b6aa515b14610219578063d6297a061461022c578063f2fde38b1461023f57600080fd5b806384fe3754146101bd5780638da5cb5b146101d257806392f9c669146101e35780639e9667d5146101f657600080fd5b8063242758f3116100e9578063242758f3146101745780633484971f1461018757806343f68a491461018f578063485cc955146101a2578063715018a6146101b557600080fd5b806306f2fb111461011b5780630c340a24146101325780631964c95814610157578063235eb16a1461016c575b600080fd5b6067545b6040519081526020015b60405180910390f35b6065546001600160a01b03165b6040516001600160a01b039091168152602001610129565b61016a610165366004610a8b565b610252565b005b61011f6102f9565b61016a610182366004610a8b565b610328565b60665461011f565b61016a61019d366004610a8b565b6103aa565b61016a6101b0366004610ac0565b61042d565b61016a610547565b60685460405160ff9091168152602001610129565b6033546001600160a01b031661013f565b61016a6101f1366004610a8b565b61055b565b61011f610622565b61016a61020c366004610a8b565b61064c565b60695461011f565b61016a610227366004610af3565b610713565b61016a61023a366004610b15565b610771565b61016a61024d366004610af3565b6107ff565b6065546001600160a01b0316331461027d5760405163e6e025c760e01b815260040160405180910390fd5b633b9aca008111156102a257604051631f3b85d360e01b815260040160405180910390fd5b6102cb7fdcdd852e594407d62243674acd7258abfb4689d6abdc168bb42d4f40c75ac9d0829055565b60405181907f733b5fc312dfed2bc8ae5dbf05d5cb659ab55046ddcbec1918f52f613bbb5c3690600090a250565b60006103237fdcdd852e594407d62243674acd7258abfb4689d6abdc168bb42d4f40c75ac9d05490565b905090565b6065546001600160a01b031633146103535760405163e6e025c760e01b815260040160405180910390fd5b61037c7f7e9328092c46e3d103a0cb8e24aa657ae6f6b6cc910545a9729426966d864558829055565b60405181907f4642fb7c2c063aa089f687d3360c930483c062a89b6d371ff669d45bc7ffdf3590600090a250565b6065546001600160a01b031633146103d55760405163e6e025c760e01b815260040160405180910390fd5b633b9aca008111156103fa57604051631f3b85d360e01b815260040160405180910390fd5b606981905560405181907f2464163639a2c8e8ce439351474cccf4e5d5f6226b11d8984dfdf615420672db90600090a250565b600054610100900460ff161580801561044d5750600054600160ff909116105b806104675750303b158015610467575060005460ff166001145b6104cf5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084015b60405180910390fd5b6000805460ff1916600117905580156104f2576000805461ff0019166101001790555b6104fc8383610875565b8015610542576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b61054f6108d4565b610559600061092e565b565b6065546001600160a01b031633146105865760405163e6e025c760e01b815260040160405180910390fd5b6067548111156105a957604051632a9ffab760e21b815260040160405180910390fd5b633b9aca008111156105ce57604051631f3b85d360e01b815260040160405180910390fd5b806000036105ef57604051632a9ffab760e21b815260040160405180910390fd5b606681905560405181907f5129e5a639a8aab0c7417fa5ea8f5555436f12301866aeae67b789e31ff6ee8390600090a250565b60006103237f7e9328092c46e3d103a0cb8e24aa657ae6f6b6cc910545a9729426966d8645585490565b6065546001600160a01b031633146106775760405163e6e025c760e01b815260040160405180910390fd5b8060000361069857604051632a9ffab760e21b815260040160405180910390fd5b633b9aca008111156106bd57604051631f3b85d360e01b815260040160405180910390fd5b6066548110156106e057604051631dbaae5160e11b815260040160405180910390fd5b606781905560405181907f0e54922494ee00fae308aea0ebd64d27da978320217b536d889823332271ed3090600090a250565b6065546001600160a01b0316331461073e5760405163e6e025c760e01b815260040160405180910390fd5b6001600160a01b0381166107655760405163fa68714160e01b815260040160405180910390fd5b61076e81610980565b50565b6065546001600160a01b0316331461079c5760405163e6e025c760e01b815260040160405180910390fd5b601460ff821611156107c157604051632ffe3c2f60e01b815260040160405180910390fd5b6068805460ff191660ff83169081179091556040517fce0a7d191c872adf950a44afa7939230f4ed67bd8122e6138ebd5a8a1efe3dbb90600090a250565b6108076108d4565b6001600160a01b03811661086c5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016104c6565b61076e8161092e565b600054610100900460ff1661089c5760405162461bcd60e51b81526004016104c690610b38565b6108a682826109dc565b6108ae610a19565b5050632faf08006066556332a9f8806067556068805460ff1916600a1790556000606955565b6033546001600160a01b031633146105595760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e657260448201526064016104c6565b603380546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6065546040516001600160a01b038084169216907f4a2da5517922d469e27cc43b2e88ebd65d79400caf5bb7cc34419e64cf85bb1a90600090a3606580546001600160a01b0319166001600160a01b0392909216919091179055565b600054610100900460ff16610a035760405162461bcd60e51b81526004016104c690610b38565b610a0c8261092e565b610a1581610980565b5050565b600054610100900460ff16610a405760405162461bcd60e51b81526004016104c690610b38565b610e107f7e9328092c46e3d103a0cb8e24aa657ae6f6b6cc910545a9729426966d8645585560007fdcdd852e594407d62243674acd7258abfb4689d6abdc168bb42d4f40c75ac9d055565b600060208284031215610a9d57600080fd5b5035919050565b80356001600160a01b0381168114610abb57600080fd5b919050565b60008060408385031215610ad357600080fd5b610adc83610aa4565b9150610aea60208401610aa4565b90509250929050565b600060208284031215610b0557600080fd5b610b0e82610aa4565b9392505050565b600060208284031215610b2757600080fd5b813560ff81168114610b0e57600080fd5b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b60608201526080019056fea26469706673582212209e037ad4103ecaf099e355c811c8b665e60c7074063135b3d9fcb97728b1dacc64736f6c63430008180033";

type StrategyLeverageSettingsMockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: StrategyLeverageSettingsMockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class StrategyLeverageSettingsMock__factory extends ContractFactory {
  constructor(...args: StrategyLeverageSettingsMockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      StrategyLeverageSettingsMock & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(
    runner: ContractRunner | null
  ): StrategyLeverageSettingsMock__factory {
    return super.connect(runner) as StrategyLeverageSettingsMock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): StrategyLeverageSettingsMockInterface {
    return new Interface(_abi) as StrategyLeverageSettingsMockInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): StrategyLeverageSettingsMock {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as StrategyLeverageSettingsMock;
  }
}
