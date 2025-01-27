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
  VaultRouterMock,
  VaultRouterMockInterface,
} from "../../../contracts/mocks/VaultRouterMock";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "CallerNotTheGovernor",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ETHTransferNotAllowed",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "commandIndex",
        type: "uint256",
      },
      {
        internalType: "bytes",
        name: "message",
        type: "bytes",
      },
    ],
    name: "ExecutionFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedAllowance",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedToApproveAllowance",
    type: "error",
  },
  {
    inputs: [],
    name: "FailedToApproveAllowanceForVault",
    type: "error",
  },
  {
    inputs: [],
    name: "InsufficientWETHBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "action",
        type: "uint256",
      },
    ],
    name: "InvalidCommand",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidGovernorAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidInputToken",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "index",
        type: "uint8",
      },
    ],
    name: "InvalidMappingIndex",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidOutputToken",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "position",
        type: "uint8",
      },
    ],
    name: "InvalidPosition",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidProvider",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRecipient",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidRouter",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidToken",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidVaultAddress",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidWETHAmount",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidWETHContract",
    type: "error",
  },
  {
    inputs: [],
    name: "NotAuthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "NotEnoughAllowance",
    type: "error",
  },
  {
    inputs: [],
    name: "RouteAlreadyAuthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "RouteNotAuthorized",
    type: "error",
  },
  {
    inputs: [],
    name: "SlippageTooHigh",
    type: "error",
  },
  {
    inputs: [],
    name: "SwapFailed",
    type: "error",
  },
  {
    inputs: [],
    name: "SweepFailed",
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
    inputs: [
      {
        internalType: "contract IERC4626",
        name: "vault",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address",
      },
    ],
    name: "approveTokenForVault",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "callInput",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
    ],
    name: "disableRoute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
      {
        components: [
          {
            internalType: "enum UseUnifiedSwapper.SwapProvider",
            name: "provider",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "router",
            type: "address",
          },
          {
            internalType: "uint24",
            name: "uniV3Tier",
            type: "uint24",
          },
          {
            internalType: "uint24",
            name: "tickSpacing",
            type: "uint24",
          },
        ],
        internalType: "struct UseUnifiedSwapper.RouteInfo",
        name: "routeInfo",
        type: "tuple",
      },
    ],
    name: "enableRoute",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "action",
            type: "uint256",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
        ],
        internalType: "struct Command[]",
        name: "commands",
        type: "tuple[]",
      },
    ],
    name: "execute",
    outputs: [],
    stateMutability: "payable",
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
        internalType: "contract IWETH",
        name: "weth",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "tokenIn",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenOut",
        type: "address",
      },
    ],
    name: "isRouteEnabled",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IERC4626",
        name: "vault",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address",
      },
    ],
    name: "isTokenApprovedForVault",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
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
  {
    inputs: [
      {
        internalType: "contract IERC4626",
        name: "vault",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "token",
        type: "address",
      },
    ],
    name: "unapproveTokenForVault",
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
  "0x608060405234801561001057600080fd5b5061001961001e565b6100dd565b600054610100900460ff161561008a5760405162461bcd60e51b815260206004820152602760248201527f496e697469616c697a61626c653a20636f6e747261637420697320696e697469604482015266616c697a696e6760c81b606482015260840160405180910390fd5b60005460ff908116146100db576000805460ff191660ff9081179091556040519081527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b565b6120ca80620000ed6000396000f3fe6080604052600436106100e15760003560e01c8063715018a61161007f578063ae7d2e3c11610059578063ae7d2e3c1461024b578063b58ce21d14610294578063b6aa515b146102a7578063f2fde38b146102c757600080fd5b8063715018a6146101f85780638da5cb5b1461020d5780638e791f751461022b57600080fd5b80631770ec82116100bb5780631770ec8214610166578063323ec3471461018857806339bc9c5c146101b8578063485cc955146101d857600080fd5b80630722f9c2146100ed5780630c340a241461010f57806315a97e971461014657600080fd5b366100e857005b600080fd5b3480156100f957600080fd5b5061010d6101083660046119f3565b6102e7565b005b34801561011b57600080fd5b506065546001600160a01b03165b6040516001600160a01b0390911681526020015b60405180910390f35b34801561015257600080fd5b5061010d610161366004611ab3565b610533565b34801561017257600080fd5b5061017b610712565b60405161013d9190611b32565b34801561019457600080fd5b506101a86101a3366004611ab3565b6107a0565b604051901515815260200161013d565b3480156101c457600080fd5b5061010d6101d3366004611ab3565b6107df565b3480156101e457600080fd5b5061010d6101f3366004611ab3565b6108c8565b34801561020457600080fd5b5061010d6109ea565b34801561021957600080fd5b506033546001600160a01b0316610129565b34801561023757600080fd5b5061010d610246366004611ab3565b6109fe565b34801561025757600080fd5b506101a8610266366004611ab3565b6001600160a01b03918216600090815260676020908152604080832093909416825291909152205460ff1690565b61010d6102a2366004611b45565b610a80565b3480156102b357600080fd5b5061010d6102c2366004611bba565b610b4f565b3480156102d357600080fd5b5061010d6102e2366004611bba565b610bad565b6065546001600160a01b031633146103125760405163e6e025c760e01b815260040160405180910390fd5b600061031e8484610c23565b90506000808281526066602052604090205460ff16600381111561034457610344611bd7565b1461036257604051632291fe5360e21b815260040160405180910390fd5b602082015160405163095ea7b360e01b81526001600160a01b03918216600482015260001960248201529085169063095ea7b3906044016020604051808303816000875af11580156103b8573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103dc9190611bed565b6103f9576040516302e8763f60e31b815260040160405180910390fd5b602082015160405163095ea7b360e01b81526001600160a01b03918216600482015260001960248201529084169063095ea7b3906044016020604051808303816000875af115801561044f573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104739190611bed565b610490576040516302e8763f60e31b815260040160405180910390fd5b60008181526066602052604090208251815484929190829060ff191660018360038111156104c0576104c0611bd7565b021790555060208201518154604084015160609094015162ffffff908116600160c01b0262ffffff60c01b1991909516600160a81b0262ffffff60a81b196001600160a01b039094166101000293909316610100600160c01b031990921691909117919091171691909117905550505050565b6065546001600160a01b0316331461055e5760405163e6e025c760e01b815260040160405180910390fd5b600061056a8383610c23565b90506000808281526066602052604090205460ff16600381111561059057610590611bd7565b036105ae5760405163139f8d8760e11b815260040160405180910390fd5b60008181526066602052604080822054905163095ea7b360e01b81526001600160a01b0361010090920482166004820152602481019290925284169063095ea7b3906044016020604051808303816000875af1158015610612573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106369190611bed565b610653576040516302e8763f60e31b815260040160405180910390fd5b60008181526066602052604080822054905163095ea7b360e01b81526001600160a01b0361010090920482166004820152602481019290925283169063095ea7b3906044016020604051808303816000875af11580156106b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106db9190611bed565b6106f8576040516302e8763f60e31b815260040160405180910390fd5b6000908152606660205260409020805460ff191690555050565b609b805461071f90611c0f565b80601f016020809104026020016040519081016040528092919081815260200182805461074b90611c0f565b80156107985780601f1061076d57610100808354040283529160200191610798565b820191906000526020600020905b81548152906001019060200180831161077b57829003601f168201915b505050505081565b6000806107ad8484610c23565b90506000808281526066602052604090205460ff1660038111156107d3576107d3611bd7565b14159150505b92915050565b6065546001600160a01b0316331461080a5760405163e6e025c760e01b815260040160405180910390fd5b6001600160a01b0382811660008181526067602090815260408083209486168084529490915290819020805460ff191660011790555163095ea7b360e01b81526004810191909152600019602482015263095ea7b3906044015b6020604051808303816000875af1158015610883573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108a79190611bed565b6108c4576040516376e540db60e01b815260040160405180910390fd5b5050565b600054610100900460ff16158080156108e85750600054600160ff909116105b806109025750303b158015610902575060005460ff166001145b61096a5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b60648201526084015b60405180910390fd5b6000805460ff19166001179055801561098d576000805461ff0019166101001790555b61099683610cae565b61099f82610cde565b80156109e5576000805461ff0019169055604051600181527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b505050565b6109f2610d40565b6109fc6000610d9a565b565b6065546001600160a01b03163314610a295760405163e6e025c760e01b815260040160405180910390fd5b6001600160a01b03828116600081815260676020908152604080832094861680845294909152808220805460ff191690555163095ea7b360e01b81526004810192909252602482015263095ea7b390604401610864565b60408051600880825261012082019092526060916000918491839190602082016101008036833701905050905060005b82811015610b4657610b18878783818110610acd57610acd611c43565b9050602002810190610adf9190611c59565b35888884818110610af257610af2611c43565b9050602002810190610b049190611c59565b610b12906020810190611c79565b85610dec565b9550935083610b3e578085604051632c4029e960e01b8152600401610961929190611cc7565b600101610ab0565b50505050505050565b6065546001600160a01b03163314610b7a5760405163e6e025c760e01b815260040160405180910390fd5b6001600160a01b038116610ba15760405163fa68714160e01b815260040160405180910390fd5b610baa81610fee565b50565b610bb5610d40565b6001600160a01b038116610c1a5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610961565b610baa81610d9a565b6000816001600160a01b0316836001600160a01b031610610c6157604080518082019091526001600160a01b03808416825284166020820152610c80565b604080518082019091526001600160a01b038085168252831660208201525b604051602001610c909190611ce8565b60405160208183030381529060405280519060200120905092915050565b600054610100900460ff16610cd55760405162461bcd60e51b815260040161096190611d22565b610ba181610d9a565b600054610100900460ff16610d055760405162461bcd60e51b815260040161096190611d22565b606880546001600160a01b0319166001600160a01b038316908117909155610baa576040516332a1e6cf60e21b815260040160405180910390fd5b6033546001600160a01b031633146109fc5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610961565b603380546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e090600090a35050565b6001606063ffffffff861661ffff602088901c811690604089901c1682851480610e1c575063ffffffff83166020145b80610e2d575063ffffffff83166021145b15610e4657610e3f888888858561104a565b9350610fe2565b60011963ffffffff841601610e6157610e3f888888856110fe565b60021963ffffffff841601610e7c57610e3f88888885611140565b60031963ffffffff841601610e9757610e3f888888856111b2565b60041963ffffffff841601610eb257610e3f888888856111d3565b60051963ffffffff841601610ecd57610e3f8888888461124b565b600a1963ffffffff841601610ee857610e3f8888888461129d565b60061963ffffffff841601610f0357610e3f888888856112e8565b60071963ffffffff841601610f1e57610e3f888888856112e8565b600f1963ffffffff841601610f3a57610e3f8888888585611323565b60101963ffffffff841601610f5657610e3f8888888585611323565b60111963ffffffff841601610f7257610e3f8888888585611398565b60121963ffffffff841601610f8e57610e3f8888888585611398565b60131963ffffffff841601610faa57610e3f8888888585611410565b60141963ffffffff841601610fc657610e3f8888888585611460565b6040516320c9d88960e21b8152600481018a9052602401610961565b50505094509492505050565b6065546040516001600160a01b038084169216907f4a2da5517922d469e27cc43b2e88ebd65d79400caf5bb7cc34419e64cf85bb1a90600090a3606580546001600160a01b0319166001600160a01b0392909216919091179055565b6060600061105a86880188611dfa565b90506110738582606001518663ffffffff16600161148a565b6060820152608081015161109190869063ffffffff8716600261148a565b60808201526000806110a283611550565b915091506110b987838763ffffffff1660016115b5565b6110cc87828763ffffffff1660026115b5565b60408051602081018490529081018290526060015b604051602081830303815290604052935050505095945050505050565b60608435602086013561111a858263ffffffff8716600161148a565b90506111268282611673565b505060408051602081019091526000815295945050505050565b60608435602086013560408701356001600160a01b03821633146111775760405163ea8e4eb560e01b815260040160405180910390fd5b61118a86828763ffffffff16600161148a565b90506111978383836116ac565b50506040805160208101909152600081529695505050505050565b606084356020860135604087013561118a868263ffffffff8816600161148a565b6060843560208601356040870135878401356001600160a01b038316331461120e5760405163ea8e4eb560e01b815260040160405180910390fd5b61122187828863ffffffff16600161148a565b905061122f848484846116f6565b5050604080516020810190915260008152979650505050505050565b6060843560208601356000611260838361173f565b905061127586828763ffffffff1660016115b5565b6040805160208101839052016040516020818303038152906040529350505050949350505050565b6060843560006112ac82611781565b90506112c185828663ffffffff1660016115b5565b60408051602081018390520160405160208183030381529060405292505050949350505050565b606084356112ff848263ffffffff8616600161148a565b905061130a816117bb565b5050604080516020810190915260008152949350505050565b606085356020870135604088013588840135611348888463ffffffff8a16600161148a565b92506000611358858585856117e4565b905061136d89828963ffffffff1660016115b5565b6040805160208101839052016040516020818303038152906040529550505050505095945050505050565b606085356020870135604088013533898501356113be898563ffffffff8b16600161148a565b935060006113cf8686868686611839565b90506113e48a828a63ffffffff1660016115b5565b604080516020810183905201604051602081830303815290604052965050505050505095945050505050565b60608535602087013561142c868263ffffffff8816600161148a565b9050600061143a8383611897565b905061144f87828763ffffffff1660016115b5565b6040805160208101839052016110e1565b60608535602087013561147c868263ffffffff8816600161148a565b9050600061143a8383611931565b600060088260ff1611156114b657604051634e6153af60e11b815260ff83166004820152602401610961565b600060ff6114c5600185611ed0565b6114d0906008611ee9565b60ff168567ffffffffffffffff16901c16905060088160ff16111561150d576040516353f4667560e11b815260ff82166004820152602401610961565b60008160ff161161151e5784611546565b8561152a600183611ed0565b60ff168151811061153d5761153d611c43565b60200260200101515b9695505050505050565b600080826000015183602001518460400151856060015186608001518760a0015160405160200161158696959493929190611f05565b604051602081830303815290604052609b90816115a39190611fbb565b50505060608101516080909101519091565b60088160ff1611156115df57604051634e6153af60e11b815260ff82166004820152602401610961565b600060ff6115ee600184611ed0565b6115f9906008611ee9565b60ff168467ffffffffffffffff16901c16905060088160ff161115611636576040516353f4667560e11b815260ff82166004820152602401610961565b60ff81161561166c57838561164c600184611ed0565b60ff168151811061165f5761165f611c43565b6020026020010181815250505b5050505050565b604080516001600160a01b0384166020820152908101829052606001604051602081830303815290604052609b90816109e59190611fbb565b604080516001600160a01b03808616602083015284169181019190915260608101829052608001604051602081830303815290604052609b90816116f09190611fbb565b50505050565b604080516001600160a01b038681166020830152858116828401528416606082015260808082018490528251808303909101815260a0909101909152609b9061166c9082611fbb565b604080516001600160a01b0384811660208301528316818301528151808203830181526060909101909152600090609b9061177a9082611fbb565b5092915050565b604080516001600160a01b038316602082015260009101604051602081830303815290604052609b90816117b59190611fbb565b50919050565b604080516020810183905201604051602081830303815290604052609b90816108c49190611fbb565b604080516001600160a01b03808716602083015291810185905290831660608201526080810182905260009060a001604051602081830303815290604052609b90816118309190611fbb565b50949350505050565b604080516001600160a01b0380881660208301529181018690528185166060820152908316608082015260a0810182905260009060c001604051602081830303815290604052609b908161188d9190611fbb565b5095945050505050565b60006001600160a01b0383166118c057604051630306120160e01b815260040160405180910390fd5b6040516363737ac960e11b8152600481018390526001600160a01b0384169063c6e6f592906024015b602060405180830381865afa158015611906573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061192a919061207b565b9392505050565b60006001600160a01b03831661195a57604051630306120160e01b815260040160405180910390fd5b6040516303d1689d60e11b8152600481018390526001600160a01b038416906307a2d13a906024016118e9565b6001600160a01b0381168114610baa57600080fd5b634e487b7160e01b600052604160045260246000fd5b60405160c0810167ffffffffffffffff811182821017156119d5576119d561199c565b60405290565b803562ffffff811681146119ee57600080fd5b919050565b600080600083850360c0811215611a0957600080fd5b8435611a1481611987565b93506020850135611a2481611987565b92506080603f1982011215611a3857600080fd5b506040516080810181811067ffffffffffffffff82111715611a5c57611a5c61199c565b604090815285013560048110611a7157600080fd5b81526060850135611a8181611987565b6020820152611a92608086016119db565b6040820152611aa360a086016119db565b6060820152809150509250925092565b60008060408385031215611ac657600080fd5b8235611ad181611987565b91506020830135611ae181611987565b809150509250929050565b6000815180845260005b81811015611b1257602081850181015186830182015201611af6565b506000602082860101526020601f19601f83011685010191505092915050565b60208152600061192a6020830184611aec565b60008060208385031215611b5857600080fd5b823567ffffffffffffffff80821115611b7057600080fd5b818501915085601f830112611b8457600080fd5b813581811115611b9357600080fd5b8660208260051b8501011115611ba857600080fd5b60209290920196919550909350505050565b600060208284031215611bcc57600080fd5b813561192a81611987565b634e487b7160e01b600052602160045260246000fd5b600060208284031215611bff57600080fd5b8151801515811461192a57600080fd5b600181811c90821680611c2357607f821691505b6020821081036117b557634e487b7160e01b600052602260045260246000fd5b634e487b7160e01b600052603260045260246000fd5b60008235603e19833603018112611c6f57600080fd5b9190910192915050565b6000808335601e19843603018112611c9057600080fd5b83018035915067ffffffffffffffff821115611cab57600080fd5b602001915036819003821315611cc057600080fd5b9250929050565b828152604060208201526000611ce06040830184611aec565b949350505050565b60408101818360005b6002811015611d195781516001600160a01b0316835260209283019290910190600101611cf1565b50505092915050565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b606082015260800190565b600082601f830112611d7e57600080fd5b813567ffffffffffffffff80821115611d9957611d9961199c565b604051601f8301601f19908116603f01168101908282118183101715611dc157611dc161199c565b81604052838152866020858801011115611dda57600080fd5b836020870160208301376000602085830101528094505050505092915050565b600060208284031215611e0c57600080fd5b813567ffffffffffffffff80821115611e2457600080fd5b9083019060c08286031215611e3857600080fd5b611e406119b2565b8235611e4b81611987565b81526020830135611e5b81611987565b6020820152604083013560028110611e7257600080fd5b80604083015250606083013560608201526080830135608082015260a083013582811115611e9f57600080fd5b611eab87828601611d6d565b60a08301525095945050505050565b634e487b7160e01b600052601160045260246000fd5b60ff82811682821603908111156107d9576107d9611eba565b60ff818116838216029081169081811461177a5761177a611eba565b6001600160a01b03878116825286166020820152600060028610611f3957634e487b7160e01b600052602160045260246000fd5b85604083015284606083015283608083015260c060a0830152611f5f60c0830184611aec565b98975050505050505050565b601f8211156109e5576000816000526020600020601f850160051c81016020861015611f945750805b601f850160051c820191505b81811015611fb357828155600101611fa0565b505050505050565b815167ffffffffffffffff811115611fd557611fd561199c565b611fe981611fe38454611c0f565b84611f6b565b602080601f83116001811461201e57600084156120065750858301515b600019600386901b1c1916600185901b178555611fb3565b600085815260208120601f198616915b8281101561204d5788860151825594840194600190910190840161202e565b508582101561206b5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b60006020828403121561208d57600080fd5b505191905056fea2646970667358221220dff04ae9092e9a3c1aaecdc87636d145edb131694a6bddcc0dcddfa0558dd2f064736f6c63430008180033";

type VaultRouterMockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: VaultRouterMockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class VaultRouterMock__factory extends ContractFactory {
  constructor(...args: VaultRouterMockConstructorParams) {
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
      VaultRouterMock & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): VaultRouterMock__factory {
    return super.connect(runner) as VaultRouterMock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): VaultRouterMockInterface {
    return new Interface(_abi) as VaultRouterMockInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): VaultRouterMock {
    return new Contract(address, _abi, runner) as unknown as VaultRouterMock;
  }
}
