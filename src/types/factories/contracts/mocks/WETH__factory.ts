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
import type { WETH, WETHInterface } from "../../../contracts/mocks/WETH";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "guy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Withdrawal",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "allowance",
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
    inputs: [
      {
        internalType: "address",
        name: "guy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
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
    name: "decimals",
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
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
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
    inputs: [
      {
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610724806100206000396000f3fe6080604052600436106100a05760003560e01c8063313ce56711610064578063313ce5671461019057806370a08231146101b757806395d89b41146101e4578063a9059cbb14610214578063d0e30db014610234578063dd62ed3e1461023c57600080fd5b806306fdde03146100b4578063095ea7b31461010357806318160ddd1461013357806323b872dd146101505780632e1a7d4d1461017057600080fd5b366100af576100ad610274565b005b600080fd5b3480156100c057600080fd5b506100ed6040518060400160405280600d81526020016c2bb930b83832b21022ba3432b960991b81525081565b6040516100fa919061057a565b60405180910390f35b34801561010f57600080fd5b5061012361011e3660046105e5565b6102cf565b60405190151581526020016100fa565b34801561013f57600080fd5b50475b6040519081526020016100fa565b34801561015c57600080fd5b5061012361016b36600461060f565b61033c565b34801561017c57600080fd5b506100ad61018b36600461064b565b6104c0565b34801561019c57600080fd5b506101a5601281565b60405160ff90911681526020016100fa565b3480156101c357600080fd5b506101426101d2366004610664565b60006020819052908152604090205481565b3480156101f057600080fd5b506100ed604051806040016040528060048152602001630ae8aa8960e31b81525081565b34801561022057600080fd5b5061012361022f3660046105e5565b610566565b6100ad610274565b34801561024857600080fd5b5061014261025736600461067f565b600160209081526000928352604080842090915290825290205481565b33600090815260208190526040812080543492906102939084906106c8565b909155505060405134815233907fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c9060200160405180910390a2565b3360008181526001602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259061032a9086815260200190565b60405180910390a35060015b92915050565b6001600160a01b03831660009081526020819052604081205482111561036157600080fd5b6001600160a01b038416331480159061039f57506001600160a01b038416600090815260016020908152604080832033845290915290205460001914155b1561040d576001600160a01b03841660009081526001602090815260408083203384529091529020548211156103d457600080fd5b6001600160a01b0384166000908152600160209081526040808320338452909152812080548492906104079084906106db565b90915550505b6001600160a01b038416600090815260208190526040812080548492906104359084906106db565b90915550506001600160a01b038316600090815260208190526040812080548492906104629084906106c8565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040516104ae91815260200190565b60405180910390a35060019392505050565b336000908152602081905260409020548111156104dc57600080fd5b33600090815260208190526040812080548392906104fb9084906106db565b9091555050604051339082156108fc029083906000818181858888f1935050505015801561052d573d6000803e3d6000fd5b5060405181815233907f7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b659060200160405180910390a250565b600061057333848461033c565b9392505050565b60006020808352835180602085015260005b818110156105a85785810183015185820160400152820161058c565b506000604082860101526040601f19601f8301168501019250505092915050565b80356001600160a01b03811681146105e057600080fd5b919050565b600080604083850312156105f857600080fd5b610601836105c9565b946020939093013593505050565b60008060006060848603121561062457600080fd5b61062d846105c9565b925061063b602085016105c9565b9150604084013590509250925092565b60006020828403121561065d57600080fd5b5035919050565b60006020828403121561067657600080fd5b610573826105c9565b6000806040838503121561069257600080fd5b61069b836105c9565b91506106a9602084016105c9565b90509250929050565b634e487b7160e01b600052601160045260246000fd5b80820180821115610336576103366106b2565b81810381811115610336576103366106b256fea2646970667358221220239507b36c2ad35112d83ab7ae7ff53e488fd4d7cd755e72621d467209f6c1d364736f6c63430008180033";

type WETHConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WETHConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WETH__factory extends ContractFactory {
  constructor(...args: WETHConstructorParams) {
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
      WETH & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): WETH__factory {
    return super.connect(runner) as WETH__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WETHInterface {
    return new Interface(_abi) as WETHInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): WETH {
    return new Contract(address, _abi, runner) as unknown as WETH;
  }
}
