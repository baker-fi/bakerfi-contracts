export enum OracleNamesEnum {
    ETH_USD = 'ETH/USD',
    WSTETH_USD = 'wstETH/USD',
    CBETH_USD = 'cbETH/USD',
};

export type OracleRegistryNames =
  | "wstETH/USD Oracle"
  | "cbETH/USD Oracle"
  | "ETH/USD Oracle";

export type FeedNameEnumType =
    OracleNamesEnum.ETH_USD |
    OracleNamesEnum.WSTETH_USD |
    OracleNamesEnum.CBETH_USD;

export type BakerDeployConfig = {
    proxyAdmin?: string;
    serviceRegistry: string;
    flashLender: string;
    wstETHUSDOracle:string;
    ethUSDOracle: string;
    strategy:string;
    strategyProxy?: string;
    vault: string;
    vaultProxy?: string;
    settings: string;
    settingsProxy?: string;
    bkr?: string;
    wstETHUSDOracleFeedId?: string;
    ethUSDOracleFeedId?: string;
}

export const pythFeeds  = {
    ETHUSDFeedId: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    CBETHUSDFeedId: "0x15ecddd26d49e1a8f1de9376ebebc03916ede873447c1255d2d5891b92ce5717",
    WSETHUSDFeedId: "0x6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784"
};

export type Networks =
  | "ethereum_devnet"
  | "base"
  | "base_devnet"
  | "optimism_devnet"
  | "local"
  | "hardhat"
  | "arbitrum_devnet"
  | "arbitrum";


export type OracleType = "chainlink" | "pyth" | "clExRate" | "customExRate";

export enum StrategyImplementation {
    AAVE_V3_WSTETH_ETH = "AAVEv3 wstETH/ETH",
    MORPHO_BLUE_WSTETH_ETH = "Morpho Blue wstETH/ETH",
};


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

export type MorphoMarket = MarketBase<"morpho", {
    oracle: string;
    irm: string;
    lltv: bigint;
}>;

export type AAVEv3Market = MarketBase<"aavev3", {
    AAVEEModeCategory: number;
}>;

export type Market = MorphoMarket | AAVEv3Market;

type OracleBase<T extends OracleType, U extends Record<string, any> = {}> = {
    name: OracleRegistryNames;
    type: T;
    address: string;
} & U;

export type PythOracle = OracleBase<"pyth", { feedId: string }>;

export type ChainLinkOracle = OracleBase<"chainlink", { aggregator: string }>;

export type ClExRateOracle = OracleBase<"clExRate", { rateAggregator: string; base: string }>;

export type CustomExRateOracle = OracleBase<"customExRate", { base: string; target: string; callData: string }>;

export type Oracle = PythOracle | ChainLinkOracle | ClExRateOracle | CustomExRateOracle;


export type NetworkConfig = {
    owner: string,
    uniswapRouter02: string,
    uniswapQuoter?: string,
    balancerVault: string,
    weth: string,
    wstETH: string;
    stETH?: string;
    minTxConfirmations: number;
    oracles: Oracle[],
    markets:{
        [key: string]: MorphoMarket | AAVEv3Market
    },
    morpho?: string;
    AAVEPool?: string,
    pyth: string,
    chainlink?: {
        wstEthToETH?: string,
        ethToUSD?: string,
        cbETHToETH?: string,
        wstEthToETHRatio?: string
    },
};

export type DeployConfig = {
    [key in Networks]?: NetworkConfig;
};
