import { feedIds } from './pyth';
import { AAVEv3MarketNames, DeployConfig, OracleNamesEnum, StrategyImplementation } from './types';
import { NetworkEnum } from './types';

const Config: DeployConfig = {
  [NetworkEnum.BASE]: {
    minTxConfirmations: 6,
    owner: '0xdD1945499B695F21f5472f10B67Aa8Dafb1b1c7c',
    uniswapRouter02: '0x2626664c2603336E57B271c5C0b26F421741e481', // Validated
    uniswapQuoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a', // Validated
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Validated
    weth: '0x4200000000000000000000000000000000000006', // Validated
    wstETH: '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452', // Validated
    stETH: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    oracles: [
      {
        name: 'ETH/USD Oracle',
        type: 'pyth',
        feedId: feedIds[OracleNamesEnum.ETH_USD],
        address: '0xEA62C6dE7ecBbAB2c43DC7031237ac79E83e3e25',
      },
      {
        name: 'wstETH/ETH Oracle',
        type: 'chainlink',
        aggregator: '0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061',
        address: '',
      },
    ],
    markets: {
      [StrategyImplementation.AAVE_V3_WSTETH_ETH]: {
        sharesName: 'AAVEv3 Bread ETH',
        sharesSymbol: 'AAVEv3brETH',
        collateralToken: 'wstETH',
        type: 'aavev3',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        debtOracle: 'ETH/USD Oracle',
        AAVEEModeCategory: 1,
        aavev3MarketName: 'AAVEv3',
        swapFeeTier: 100,
      },
      [StrategyImplementation.MORPHO_BLUE_WSTETH_ETH]: {
        sharesName: 'Morpho Bread ETH',
        sharesSymbol: 'MorphobrETH',
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        debtOracle: 'ETH/USD Oracle',
        type: 'morpho',
        oracle: '0x4A11590e5326138B514E08A9B52202D42077Ca65',
        irm: '0x46415998764C29aB2a25CbeA6254146D50D22687',
        lltv: 945000000000000000n,
        swapFeeTier: 100,
      },
    },
    aavev3: {
      [AAVEv3MarketNames.AAVE_V3]: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    },
    pyth: '0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a',
    morpho: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
    chainlink: {
      wstEthToETH: '0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061',
    },
  },
  [NetworkEnum.BASE_DEVNET]: {
    minTxConfirmations: 0,
    owner: '0xdD1945499B695F21f5472f10B67Aa8Dafb1b1c7c',
    uniswapRouter02: '0x2626664c2603336E57B271c5C0b26F421741e481', // Validated
    uniswapQuoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a', // Validated
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Validated
    weth: '0x4200000000000000000000000000000000000006', // Validated
    wstETH: '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452', // Validated
    oracles: [
      {
        name: 'ETH/USD Oracle',
        type: 'pyth',
        feedId: feedIds[OracleNamesEnum.ETH_USD],
        address: '0xEA62C6dE7ecBbAB2c43DC7031237ac79E83e3e25',
      },
      {
        name: 'wstETH/ETH Oracle',
        type: 'chainlink',
        aggregator: '0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061',
        address: '',
      },
    ],
    markets: {
      [StrategyImplementation.AAVE_V3_WSTETH_ETH]: {
        sharesName: 'AAVEv3 Bread ETH',
        sharesSymbol: 'AAVEv3brETH',
        AAVEEModeCategory: 1,
        collateralToken: 'wstETH',
        type: 'aavev3',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        debtOracle: 'ETH/USD Oracle',
        swapFeeTier: 100,
        aavev3MarketName: 'AAVEv3',
      },
      [StrategyImplementation.MORPHO_BLUE_WSTETH_ETH]: {
        sharesName: 'Morpho Bread ETH',
        sharesSymbol: 'MorphobrETH',
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        debtOracle: 'ETH/USD Oracle',
        type: 'morpho',
        oracle: '0x4A11590e5326138B514E08A9B52202D42077Ca65',
        irm: '0x46415998764C29aB2a25CbeA6254146D50D22687',
        lltv: 945000000000000000n,
        swapFeeTier: 100,
      },
    },
    aavev3: {
      [AAVEv3MarketNames.AAVE_V3]: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
    },
    pyth: '0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a',
    morpho: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
    chainlink: {
      wstEthToETH: '0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061',
    },
  },
  [NetworkEnum.LOCAL]: {
    minTxConfirmations: 0,
    owner: '0xf15CC0ccBdDA041e2508B829541917823222F364',
    uniswapRouter02: '0xB7d0add4df75aa719bE464e860C8c40bb7FA2122',
    uniswapQuoter: '0x53e12d61AF104185485C79cbeBEe3D1F896d705f',
    weth: '0x5bC13d5ce928Ae6e414A831D173E86fD040deBb9',
    wstETH: '0xf93e63A0d1ec46402065b862f08ad0962d5b2C88',
    pyth: '0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4',
    stETH: '0x07C1F45Dc0a620E6716d8A45485B8f0A79E270F8',
    oracles: [
      {
        name: 'wstETH/USD Oracle',
        type: 'pyth',
        feedId: feedIds[OracleNamesEnum.WSTETH_USD],
        address: '',
      },
      {
        name: 'ETH/USD Oracle',
        type: 'pyth',
        feedId: feedIds[OracleNamesEnum.ETH_USD],
        address: '',
      },
    ],
    markets: {
      [StrategyImplementation.AAVE_V3_WSTETH_ETH]: {
        sharesName: 'AAVEv3 Bread ETH',
        sharesSymbol: 'AAVEv3brETH',
        type: 'aavev3',
        AAVEEModeCategory: 1,
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        debtOracle: 'ETH/USD Oracle',
        swapFeeTier: 500,
        aavev3MarketName: 'AAVEv3',
      },
    },
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Validated
    aavev3: {
      [AAVEv3MarketNames.AAVE_V3]: '0xF8D0e82B1EE3EEc7AEcDAa4E1c94E29fe3Db712E',
    },
  },
  [NetworkEnum.ARBITRUM_DEVNET]: {
    minTxConfirmations: 0,
    owner: '',
    uniswapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // Validated
    uniswapQuoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', // Validated
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Validated
    weth: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // Validated
    wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529', // Validated
    oracles: [
      {
        name: 'ETH/USD Oracle',
        type: 'pyth',
        feedId: feedIds[OracleNamesEnum.ETH_USD],
        address: '',
      },
      {
        type: 'clExRate',
        name: 'wstETH/USD Oracle',
        rateAggregator: '0xB1552C5e96B312d0Bf8b554186F846C40614a540',
        base: 'ETH/USD Oracle',
        address: '',
      },
    ],
    markets: {
      [StrategyImplementation.AAVE_V3_WSTETH_ETH]: {
        sharesName: 'AAVEv3 Bread ETH',
        sharesSymbol: 'AAVEv3brETH',
        type: 'aavev3',
        collateralToken: 'wstETH',
        AAVEEModeCategory: 2,
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        debtOracle: 'ETH/USD Oracle',
        swapFeeTier: 100,
        aavev3MarketName: 'AAVEv3',
      },
    },
    aavev3: {
      [AAVEv3MarketNames.AAVE_V3]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    },
    pyth: '0xff1a0f4744e8582df1ae09d5611b887b6a12925c',
    chainlink: {
      wstEthToETH: '0xb523AE262D20A936BC152e6023996e46FDC2A95D',
      ethToUSD: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
      cbETHToETH: '0xa668682974E3f121185a3cD94f00322beC674275',
    },
  },
  [NetworkEnum.ARBITRUM]: {
    minTxConfirmations: 3,
    owner: '0xdD1945499B695F21f5472f10B67Aa8Dafb1b1c7c',
    uniswapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // Validated
    uniswapQuoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', // Validated
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8', // Validated
    weth: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // Validated
    wstETH: '0x5979D7b546E38E414F7E9822514be443A4800529', // Validated
    oracles: [
      {
        name: 'ETH/USD Oracle',
        type: 'pyth',
        feedId: feedIds[OracleNamesEnum.ETH_USD],
        address: '',
      },
      {
        name: 'wstETH/ETH Oracle',
        type: 'chainlink',
        aggregator: '0xb523AE262D20A936BC152e6023996e46FDC2A95D',
        address: '',
      },
    ],
    markets: {
      [StrategyImplementation.AAVE_V3_WSTETH_ETH]: {
        sharesName: 'Arbitrum AAVEv3 Bread ETH',
        sharesSymbol: 'arbAAVEv3brETH',
        type: 'aavev3',
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        AAVEEModeCategory: 2,
        debtOracle: 'ETH/USD Oracle',
        swapFeeTier: 100,
        aavev3MarketName: 'AAVEv3',
      },
    },
    aavev3: {
      [AAVEv3MarketNames.AAVE_V3]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    },
    pyth: '0xff1a0f4744e8582df1ae09d5611b887b6a12925c',
    chainlink: {
      wstEthToETH: '0xB1552C5e96B312d0Bf8b554186F846C40614a540',
      ethToUSD: '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
      cbETHToETH: '0xa668682974E3f121185a3cD94f00322beC674275',
    },
  },
  [NetworkEnum.HARDHAT]: {
    minTxConfirmations: 0,
    owner: '0xf15CC0ccBdDA041e2508B829541917823222F364',
    uniswapQuoter: '',
    balancerVault: '',
    weth: '',
    wstETH: '',
    stETH: undefined,
    oracles: [],
    uniswapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    uniswapV2Router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    curveRouterNG: '0x16C6521Dff6baB339122a0FE25a9116693265353',
    markets: {
      [StrategyImplementation.AAVE_V3_WSTETH_ETH]: {
        sharesName: 'AAVEv3 Bread ETH',
        sharesSymbol: 'AAVEv3brETH',
        type: 'aavev3',
        AAVEEModeCategory: 2,
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        debtOracle: 'ETH/USD Oracle',
        swapFeeTier: 100,
        aavev3MarketName: 'AAVEv3',
      },
    },
    aavev3: {},
    pyth: '',
  },
  [NetworkEnum.ETHEREUM]: {
    minTxConfirmations: 3,
    owner: '0xdD1945499B695F21f5472f10B67Aa8Dafb1b1c7c',
    uniswapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    wstETH: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    morpho: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
    oracles: [
      {
        name: 'ETH/USD Oracle',
        type: 'chainlink',
        aggregator: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        address: '', // Deploy Adress
      },
      {
        name: 'wstETH/ETH Oracle',
        type: 'ratio',
        target: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH Contract
        callData: '0x035faf82', // stEthPerToken Selector,
        address: '',
      },
    ],
    markets: {
      [StrategyImplementation.AAVE_V3_WSTETH_ETH]: {
        sharesName: 'AAVEv3 Bread ETH',
        sharesSymbol: 'AAVEv3ETH',
        type: 'aavev3',
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        AAVEEModeCategory: 1,
        debtOracle: 'ETH/USD Oracle',
        swapFeeTier: 100,
        aavev3MarketName: 'AAVEv3',
      },
      [StrategyImplementation.MORPHO_BLUE_WSTETH_ETH]: {
        sharesName: 'Morpho Bread ETH',
        sharesSymbol: 'MorphobrETH',
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        debtOracle: 'ETH/USD Oracle',
        type: 'morpho',
        oracle: '0xbD60A6770b27E084E8617335ddE769241B0e71D8',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: 945000000000000000n,
        swapFeeTier: 100,
      },
      [StrategyImplementation.AAVE_V3_WSTETH_ETH_LIDO]: {
        sharesName: 'AAVEv3 LIDO Bread ETH',
        sharesSymbol: 'AAVEv3LIDObrETH',
        collateralToken: 'wstETH',
        type: 'aavev3',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        AAVEEModeCategory: 1,
        debtOracle: 'ETH/USD Oracle',
        aavev3MarketName: 'AAVEv3 Lido Market',
        swapFeeTier: 100,
      },
    },
    aavev3: {
      [AAVEv3MarketNames.AAVE_V3]: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      [AAVEv3MarketNames.AAVE_V3_LIDO_MARKET]: '0x4e033931ad43597d96d6bcc25c280717730b58b1',
    },

    pyth: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
  },
  [NetworkEnum.ETHEREUM_DEVNET]: {
    minTxConfirmations: 0,
    owner: '0xdD1945499B695F21f5472f10B67Aa8Dafb1b1c7c',
    uniswapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    uniswapV2Router02: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    curveRouterNG: '0x16C6521Dff6baB339122a0FE25a9116693265353',
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    weth: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    usdt: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    usdc: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    wstETH: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    stETH: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    morpho: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
    oracles: [
      {
        name: 'ETH/USD Oracle',
        type: 'chainlink',
        aggregator: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        address: '', // Deploy Adress
      },
      {
        name: 'wstETH/ETH Oracle',
        type: 'ratio',
        target: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0', // wstETH Contract
        callData: '0x035faf82', // stEthPerToken Selector,
        address: '',
      },
    ],
    markets: {
      [StrategyImplementation.AAVE_V3_WSTETH_ETH]: {
        sharesName: 'AAVEv3 Bread ETH',
        sharesSymbol: 'AAVEv3ETH',
        type: 'aavev3',
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        AAVEEModeCategory: 1,
        debtOracle: 'ETH/USD Oracle',
        swapFeeTier: 100,
        aavev3MarketName: 'AAVEv3',
      },
      [StrategyImplementation.MORPHO_BLUE_WSTETH_ETH]: {
        sharesName: 'Morpho Bread ETH',
        sharesSymbol: 'MorphobrETH',
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        debtOracle: 'ETH/USD Oracle',
        type: 'morpho',
        oracle: '0xbD60A6770b27E084E8617335ddE769241B0e71D8',
        irm: '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
        lltv: 945000000000000000n,
        swapFeeTier: 100,
      },
      [StrategyImplementation.AAVE_V3_WSTETH_ETH_LIDO]: {
        sharesName: 'AAVEv3 LIDO Bread ETH',
        sharesSymbol: 'AAVEv3LIDObrETH',
        collateralToken: 'wstETH',
        type: 'aavev3',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        AAVEEModeCategory: 1,
        debtOracle: 'ETH/USD Oracle',
        aavev3MarketName: 'AAVEv3 Lido Market',
        swapFeeTier: 100,
      },
    },
    aavev3: {
      [AAVEv3MarketNames.AAVE_V3]: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      [AAVEv3MarketNames.AAVE_V3_LIDO_MARKET]: '0x4e033931ad43597d96d6bcc25c280717730b58b1',
    },

    pyth: '0x4305FB66699C3B2702D4d05CF36551390A4c69C6',
  },
  [NetworkEnum.OPTIMISM]: {
    minTxConfirmations: 6,
    owner: '0xdD1945499B695F21f5472f10B67Aa8Dafb1b1c7c',
    uniswapRouter02: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    balancerVault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    weth: '0x4200000000000000000000000000000000000006',
    wstETH: '0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb',
    oracles: [
      {
        name: 'ETH/USD Oracle',
        type: 'pyth',
        feedId: feedIds[OracleNamesEnum.ETH_USD],
        address: '',
      },
      {
        type: 'clExRate',
        name: 'wstETH/USD Oracle',
        rateAggregator: '0xe59EBa0D492cA53C6f46015EEa00517F2707dc77',
        base: 'ETH/USD Oracle',
        address: '',
      },
    ],
    markets: {
      [StrategyImplementation.AAVE_V3_WSTETH_ETH]: {
        sharesName: 'Optimism AAVEv3 Bread ETH',
        sharesSymbol: 'opAAVEv3brETH',
        type: 'aavev3',
        collateralToken: 'wstETH',
        debtToken: 'WETH',
        collateralOracle: 'wstETH/USD Oracle',
        AAVEEModeCategory: 1,
        debtOracle: 'ETH/USD Oracle',
        swapFeeTier: 100,
        aavev3MarketName: 'AAVEv3',
      },
    },
    aavev3: {
      [AAVEv3MarketNames.AAVE_V3]: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    },
    pyth: '0xff1a0f4744e8582DF1aE09D5611b887B6a12925C',
  },
};

export default Config;
