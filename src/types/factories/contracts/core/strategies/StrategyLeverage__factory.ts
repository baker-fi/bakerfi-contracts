/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from 'ethers';
import type {
  StrategyLeverage,
  StrategyLeverageInterface,
} from '../../../../contracts/core/strategies/StrategyLeverage';

const _abi = [
  {
    inputs: [],
    name: 'CallerNotTheGovernor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CollateralLowerThanDebt',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
    ],
    name: 'ETHTransferNotAllowed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedToApproveAllowance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedToApproveAllowance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedToAuthenticateArgs',
    type: 'error',
  },
  {
    inputs: [],
    name: 'FailedToRunFlashLoan',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidAllowance',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidCollateralToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDebtToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDeltaDebt',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDeployAmount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDivDenominator',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidDivisor',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidFeeTier',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidFlashLenderContract',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidFlashLoanAction',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidFlashLoanAsset',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidFlashLoanSender',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidGovernorAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidInputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidLoanInitiator',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidLoanToValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidLoopCount',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidMaxLoanToValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidNumberOfLoops',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOracle',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOutputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOutputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOutputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOutputToken',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPercentage',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidPercentageValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidProvider',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidRouter',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidTargetValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NoCollateralMarginToScale',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OverflowDetected',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PriceOutdated',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RouteAlreadyAuthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RouteNotAuthorized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SwapFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SwapFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SwapFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SwapFailed',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousGovernor',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newGovernor',
        type: 'address',
      },
    ],
    name: 'GovernshipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'LoanToValueChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'MaxLoanToValueChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'MaxSlippageChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'NrLoopsChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'PriceMaxAgeChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'PriceMaxConfChanged',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'newDeployment',
        type: 'uint256',
      },
    ],
    name: 'StrategyAmountUpdate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'StrategyDeploy',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'StrategyLoss',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'StrategyProfit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'StrategyUndeploy',
    type: 'event',
  },
  {
    inputs: [],
    name: 'asset',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'deploy',
    outputs: [
      {
        internalType: 'uint256',
        name: 'deployedAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenIn',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenOut',
        type: 'address',
      },
    ],
    name: 'disableRoute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenIn',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenOut',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'enum UseUnifiedSwapper.SwapProvider',
            name: 'provider',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'router',
            type: 'address',
          },
          {
            internalType: 'uint24',
            name: 'uniV3Tier',
            type: 'uint24',
          },
          {
            internalType: 'uint24',
            name: 'tickSpacing',
            type: 'uint24',
          },
        ],
        internalType: 'struct UseUnifiedSwapper.RouteInfo',
        name: 'routeInfo',
        type: 'tuple',
      },
    ],
    name: 'enableRoute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBalances',
    outputs: [
      {
        internalType: 'uint256',
        name: 'collateralBalance',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'debtBalance',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCollateralAsset',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getDebAsset',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLoanToValue',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMaxLoanToValue',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getMaxSlippage',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getNrLoops',
    outputs: [
      {
        internalType: 'uint8',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getOracle',
    outputs: [
      {
        internalType: 'address',
        name: 'oracle',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'maxAge',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxConf',
            type: 'uint256',
          },
        ],
        internalType: 'struct IOracle.PriceOptions',
        name: 'priceOptions',
        type: 'tuple',
      },
    ],
    name: 'getPosition',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalCollateralInAsset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'totalDebtInAsset',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'loanToValue',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPriceMaxAge',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPriceMaxConf',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'governor',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'harvest',
    outputs: [
      {
        internalType: 'int256',
        name: 'balanceChange',
        type: 'int256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'tokenIn',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'tokenOut',
        type: 'address',
      },
    ],
    name: 'isRouteEnabled',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'initiator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: 'callData',
        type: 'bytes',
      },
    ],
    name: 'onFlashLoan',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'loanToValue',
        type: 'uint256',
      },
    ],
    name: 'setLoanToValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'maxLoanToValue',
        type: 'uint256',
      },
    ],
    name: 'setMaxLoanToValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'slippage',
        type: 'uint256',
      },
    ],
    name: 'setMaxSlippage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint8',
        name: 'nrLoops',
        type: 'uint8',
      },
    ],
    name: 'setNrLoops',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract IOracle',
        name: 'oracle',
        type: 'address',
      },
    ],
    name: 'setOracle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'setPriceMaxAge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'setPriceMaxConf',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalAssets',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalOwnedAssetsInDebt',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newGovernor',
        type: 'address',
      },
    ],
    name: 'transferGovernorship',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'undeploy',
    outputs: [
      {
        internalType: 'uint256',
        name: 'undeployedAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
] as const;

export class StrategyLeverage__factory {
  static readonly abi = _abi;
  static createInterface(): StrategyLeverageInterface {
    return new Interface(_abi) as StrategyLeverageInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): StrategyLeverage {
    return new Contract(address, _abi, runner) as unknown as StrategyLeverage;
  }
}
