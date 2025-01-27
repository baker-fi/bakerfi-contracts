export enum OracleNamesEnum {
  ETH_USD = 'ETH/USD',
  WSTETH_USD = 'wstETH/USD',
  CBETH_USD = 'cbETH/USD',
}

export type OracleRegistryNames =
  | 'wstETH/USD Oracle'
  | 'cbETH/USD Oracle'
  | 'ETH/USD Oracle'
  | 'wstETH/ETH Oracle';

export type FeedNameEnumType =
  | OracleNamesEnum.ETH_USD
  | OracleNamesEnum.WSTETH_USD
  | OracleNamesEnum.CBETH_USD;

export type BakerDeployConfig = {
  proxyAdmin?: string;
  serviceRegistry: string;
  flashLender?: string;
  oracle?: string;
  collateralOracle?: string;
  debtOracle?: string;
  strategy?: string;
  strategyProxy?: string;
  vault: string;
  vaultProxy?: string;
  settings?: string;
  settingsProxy?: string;
  bkr?: string;
  wstETHUSDOracleFeedId?: string;
  ethUSDOracleFeedId?: string;
  vaultRouter?: string;
  vaultRouterProxy?: string;
};

export const pythFeeds = {
  ETHUSDFeedId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  CBETHUSDFeedId: '0x15ecddd26d49e1a8f1de9376ebebc03916ede873447c1255d2d5891b92ce5717',
  WSETHUSDFeedId: '0x6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784',
};

export enum NetworkEnum {
  ETHEREUM_DEVNET = 'ethereum_devnet',
  ETHEREUM = 'ethereum',
  BASE = 'base',
  BASE_DEVNET = 'base_devnet',
  OPTIMISM_DEVNET = 'optimism_devnet',
  OPTIMISM = 'optimism',
  LOCAL = 'local',
  HARDHAT = 'hardhat',
  ARBITRUM_DEVNET = 'arbitrum_devnet',
  ARBITRUM = 'arbitrum',
}

export type Networks =
  | NetworkEnum.ETHEREUM_DEVNET
  | NetworkEnum.ETHEREUM
  | NetworkEnum.BASE
  | NetworkEnum.BASE_DEVNET
  | NetworkEnum.OPTIMISM_DEVNET
  | NetworkEnum.OPTIMISM
  | NetworkEnum.LOCAL
  | NetworkEnum.HARDHAT
  | NetworkEnum.ARBITRUM_DEVNET
  | NetworkEnum.ARBITRUM;

export enum AAVEv3MarketNames {
  AAVE_V3 = 'AAVEv3',
  AAVE_V3_LIDO_MARKET = 'AAVEv3 Lido Market',
}

export type AAVEv3MarketNamesType =
  | AAVEv3MarketNames.AAVE_V3
  | AAVEv3MarketNames.AAVE_V3_LIDO_MARKET;

export type OracleType = 'chainlink' | 'pyth' | 'clExRate' | 'customExRate' | 'ratio';

export enum StrategyImplementation {
  AAVE_V3_WSTETH_ETH = 'AAVEv3 wstETH/ETH',
  AAVE_V3_WSTETH_ETH_LIDO = 'AAVEv3 Lido wstETH/ETH',
  MORPHO_BLUE_WSTETH_ETH = 'Morpho Blue wstETH/ETH',
  MORPHO_BLUE_SUPPLY_WSTETH_ETH = 'Morpho Blue Supply wstETH/ETH',
  FIFTY_FIFTY_ETH = '50/50 Park ETH',
}

export type StrategyImplementationType =
  | StrategyImplementation.AAVE_V3_WSTETH_ETH
  | StrategyImplementation.MORPHO_BLUE_WSTETH_ETH
  | StrategyImplementation.AAVE_V3_WSTETH_ETH_LIDO
  | StrategyImplementation.MORPHO_BLUE_SUPPLY_WSTETH_ETH
  | StrategyImplementation.FIFTY_FIFTY_ETH;

export type MarketBase<T extends string, U extends Record<string, any> = {}> = {
  sharesName: string;
  sharesSymbol: string;
  collateralToken: string;
  debtToken: string;
  collateralOracle: OracleRegistryNames;
  debtOracle: OracleRegistryNames;
  swapFeeTier: number;
  type: T;
} & U;

export type MorphoMarket = MarketBase<
  'morpho',
  {
    oracle: string;
    irm: string;
    lltv: bigint;
  }
>;

export type AAVEv3Market = MarketBase<
  'aavev3',
  {
    AAVEEModeCategory: number;
    aavev3MarketName: string;
  }
>;

export type Market = MorphoMarket | AAVEv3Market;

type OracleBase<T extends OracleType, U extends Record<string, any> = {}> = {
  name: OracleRegistryNames;
  type: T;
  address: string;
} & U;

export type PythOracle = OracleBase<'pyth', { feedId: string }>;

export type ChainLinkOracle = OracleBase<'chainlink', { aggregator: string }>;

export type ClExRateOracle = OracleBase<'clExRate', { rateAggregator: string; base: string }>;

export type CustomExRateOracle = OracleBase<
  'customExRate',
  { base: string; target: string; callData: string }
>;

export type RatioOracle = OracleBase<'ratio', { target: string; callData: string }>;

export type Oracle =
  | PythOracle
  | ChainLinkOracle
  | ClExRateOracle
  | CustomExRateOracle
  | RatioOracle;

export type NetworkConfig = {
  owner: string;
  uniswapRouter02: string;
  uniswapQuoter?: string;
  curveRouterNG?: string;
  uniswapV2Router02?: string;
  balancerVault: string;
  usdc?: string;
  weth: string;
  wstETH: string;
  stETH?: string;
  usdt?: string;
  minTxConfirmations: number;
  oracles: Oracle[];
  markets: {
    [key: string]: MorphoMarket | AAVEv3Market;
  };
  morpho?: string;
  aavev3?: {
    // Market Name => address
    [key in AAVEv3MarketNamesType]?: string;
  };
  pyth: string;
  chainlink?: {
    wstEthToETH?: string;
    ethToUSD?: string;
    cbETHToETH?: string;
    wstEthToETHRatio?: string;
  };
};

export type DeployConfig = {
  [key in Networks]?: NetworkConfig;
};

export type StrategyMap = Partial<Record<StrategyImplementation, DeployConfig>>;
