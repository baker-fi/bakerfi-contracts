/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type {
  Signer,
  BigNumberish,
  AddressLike,
  ContractDeployTransaction,
  ContractRunner,
} from "ethers";
import type { NonPayableOverrides } from "../../../common";
import type {
  ChainLinkOracle,
  ChainLinkOracleInterface,
} from "../../../contracts/oracles/ChainLinkOracle";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "priceFeed",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "minPrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxPrice",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidPriceFromOracle",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidPriceUpdatedAt",
    type: "error",
  },
  {
    inputs: [],
    name: "PriceOutdated",
    type: "error",
  },
  {
    inputs: [],
    name: "getLatestPrice",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastUpdate",
            type: "uint256",
          },
        ],
        internalType: "struct IOracle.Price",
        name: "price",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPrecision",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "maxAge",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxConf",
            type: "uint256",
          },
        ],
        internalType: "struct IOracle.PriceOptions",
        name: "priceOptions",
        type: "tuple",
      },
    ],
    name: "getSafeLatestPrice",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastUpdate",
            type: "uint256",
          },
        ],
        internalType: "struct IOracle.Price",
        name: "price",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x610100604052600060c081905260e05234801561001b57600080fd5b506040516106ed3803806106ed83398101604081905261003a916100c1565b6001600160a01b038316608081905260c083905260e08290526040805163313ce56760e01b8152905163313ce567916004808201926020929091908290030181865afa15801561008e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906100b29190610104565b60ff1660a0525061012e915050565b6000806000606084860312156100d657600080fd5b83516001600160a01b03811681146100ed57600080fd5b602085015160409095015190969495509392505050565b60006020828403121561011657600080fd5b815160ff8116811461012757600080fd5b9392505050565b60805160a05160c05160e05161057961017460003960008181610165015261019001526000818160f60152610121015260006102c7015260006101f001526105796000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806304341d99146100465780638e15f473146100795780639670c0bc14610081575b600080fd5b610059610054366004610323565b610097565b604080518251815260209283015192810192909252015b60405180910390f35b6100596101d5565b610089610310565b604051908152602001610070565b60408051808201909152600080825260208201526100b36101d5565b8251909150158015906100d45750815160208201516100d29042610396565b115b156100f257604051633baab38160e01b815260040160405180910390fd5b60007f0000000000000000000000000000000000000000000000000000000000000000118015610143575080517f000000000000000000000000000000000000000000000000000000000000000010155b1561016157604051636f4f5ab960e01b815260040160405180910390fd5b60007f00000000000000000000000000000000000000000000000000000000000000001180156101b2575080517f000000000000000000000000000000000000000000000000000000000000000011155b156101d057604051636f4f5ab960e01b815260040160405180910390fd5b919050565b604080518082019091526000808252602082015260008060007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b031663feaf968c6040518163ffffffff1660e01b815260040160a060405180830381865afa15801561024c573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061027091906103c9565b50935093509350506000831361029957604051636f4f5ab960e01b815260040160405180910390fd5b8115806102a4575080155b156102c257604051636234c15f60e11b815260040160405180910390fd5b6102ed7f00000000000000000000000000000000000000000000000000000000000000006012610419565b6102f890600a610516565b610302908461052c565b845260208401525090919050565b600061031e6012600a610516565b905090565b60006040828403121561033557600080fd5b6040516040810181811067ffffffffffffffff8211171561036657634e487b7160e01b600052604160045260246000fd5b604052823581526020928301359281019290925250919050565b634e487b7160e01b600052601160045260246000fd5b818103818111156103a9576103a9610380565b92915050565b805169ffffffffffffffffffff811681146101d057600080fd5b600080600080600060a086880312156103e157600080fd5b6103ea866103af565b945060208601519350604086015192506060860151915061040d608087016103af565b90509295509295909350565b60ff82811682821603908111156103a9576103a9610380565b600181815b8085111561046d57816000190482111561045357610453610380565b8085161561046057918102915b93841c9390800290610437565b509250929050565b600082610484575060016103a9565b81610491575060006103a9565b81600181146104a757600281146104b1576104cd565b60019150506103a9565b60ff8411156104c2576104c2610380565b50506001821b6103a9565b5060208310610133831016604e8410600b84101617156104f0575081810a6103a9565b6104fa8383610432565b806000190482111561050e5761050e610380565b029392505050565b600061052560ff841683610475565b9392505050565b80820281158282048414176103a9576103a961038056fea26469706673582212203495b21f87def3d8818d3d83bac2487e804d2f617baddd9f4a1c9addccafe33d64736f6c63430008180033";

type ChainLinkOracleConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ChainLinkOracleConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ChainLinkOracle__factory extends ContractFactory {
  constructor(...args: ChainLinkOracleConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    priceFeed: AddressLike,
    minPrice: BigNumberish,
    maxPrice: BigNumberish,
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(
      priceFeed,
      minPrice,
      maxPrice,
      overrides || {}
    );
  }
  override deploy(
    priceFeed: AddressLike,
    minPrice: BigNumberish,
    maxPrice: BigNumberish,
    overrides?: NonPayableOverrides & { from?: string }
  ) {
    return super.deploy(
      priceFeed,
      minPrice,
      maxPrice,
      overrides || {}
    ) as Promise<
      ChainLinkOracle & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): ChainLinkOracle__factory {
    return super.connect(runner) as ChainLinkOracle__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ChainLinkOracleInterface {
    return new Interface(_abi) as ChainLinkOracleInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ChainLinkOracle {
    return new Contract(address, _abi, runner) as unknown as ChainLinkOracle;
  }
}
