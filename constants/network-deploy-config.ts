import { PythFeedNameEnum } from "./pyth";

export const feeds  = {
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

export type PythOraclePairs = "wstETH/USD" | "cbETH/USD" | "ETH/USD";

export type OracleRegistryNames =
  | "wstETH/USD Oracle"
  | "cbETH/USD Oracle"
  | "ETH/USD Oracle";

export type StrategyType = "base" | "wstETH";

export enum VaultNamesEnum {
    AAVE_V3_WSTETH_ETH = "AAVEv3 wstETH/ETH",
};
export type VaultNames = keyof VaultNamesEnum;

export type NetworkConfig = {
    owner: string,
    uniswapRouter02: string,
    uniswapQuoter: string,
    balancerVault: string,
    weth: string,
    wstETH: string;
    stETH?: string;
    minTxConfirmations: number;
    oracles: {
        pair: PythOraclePairs,
        address: string,
    }[],
    AAVEEModeCategory: number,
    vaults:{
        [key: string] :{
            sharesName: string,
            sharesSymbol: string,
            type:  StrategyType;
            collateral: string,
            oracle: OracleRegistryNames,
    }},
    swapFeeTier: number,        
    AAVEPool: string, // Validated      
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

const Config: DeployConfig = {   
    "base": {
        minTxConfirmations: 6,
        owner: "0xdD1945499B695F21f5472f10B67Aa8Dafb1b1c7c",
        uniswapRouter02: "0x2626664c2603336E57B271c5C0b26F421741e481", // Validated 
        uniswapQuoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a", // Validated 
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated
        weth: "0x4200000000000000000000000000000000000006", // Validated
        wstETH: "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452", // Validated
        oracles: [{
            pair: PythFeedNameEnum.WSTETH_USD,
            address: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4"
        }, {
            pair: PythFeedNameEnum.ETH_USD,
            address: "0x501F860caE70FA5058f1D33458F6066fdB62A591"
        }],
        AAVEEModeCategory: 1,
        vaults: {
            [VaultNamesEnum.AAVE_V3_WSTETH_ETH]: { 
                sharesName: "AAVEv3 Bread ETH",
                sharesSymbol: "AAVEv3brETH",
                type: "base",
                collateral: "wstETH",
                oracle: "wstETH/USD Oracle"
            }
        },
        swapFeeTier: 100,
        AAVEPool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // Validated      
        pyth: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a",
    },
    "base_devnet": {
        minTxConfirmations: 0,
        owner: "0xdD1945499B695F21f5472f10B67Aa8Dafb1b1c7c",
        uniswapRouter02: "0x2626664c2603336E57B271c5C0b26F421741e481", // Validated 
        uniswapQuoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a", // Validated 
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated
        weth: "0x4200000000000000000000000000000000000006", // Validated
        wstETH: "0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452", // Validated
        oracles: [{
            pair: PythFeedNameEnum.WSTETH_USD,
            address: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4"
        }, {
            pair: PythFeedNameEnum.ETH_USD,
            address: "0x501F860caE70FA5058f1D33458F6066fdB62A591"
        }],
        AAVEEModeCategory: 1,
        vaults: {
            [VaultNamesEnum.AAVE_V3_WSTETH_ETH]: { 
                sharesName: "AAVEv3 Bread ETH",
                sharesSymbol: "AAVEv3brETH",
                type: "base",
                collateral: "wstETH",
                oracle: "wstETH/USD Oracle"
            }
        },
        swapFeeTier: 100,
        AAVEPool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // Validated      
        pyth: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a",
        chainlink: {
            wstEthToETHRatio: "0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061",
        }
    },   
    "local": {
        minTxConfirmations: 0,
        owner: "0xf15CC0ccBdDA041e2508B829541917823222F364",
        AAVEEModeCategory: 0,
        swapFeeTier: 500,
        uniswapRouter02: "0xB7d0add4df75aa719bE464e860C8c40bb7FA2122",
        uniswapQuoter: "0x53e12d61AF104185485C79cbeBEe3D1F896d705f",
        weth: "0x5bC13d5ce928Ae6e414A831D173E86fD040deBb9",
        wstETH: "0xf93e63A0d1ec46402065b862f08ad0962d5b2C88",
        pyth: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4",
        stETH: "0x07C1F45Dc0a620E6716d8A45485B8f0A79E270F8",
        oracles: [{
            pair:PythFeedNameEnum.WSTETH_USD,
            address: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4"
        }, {
            pair: PythFeedNameEnum.ETH_USD,
            address: "0x501F860caE70FA5058f1D33458F6066fdB62A591"
        }],
        vaults: {
            [VaultNamesEnum.AAVE_V3_WSTETH_ETH]: { 
                sharesName: "AAVEv3 Bread ETH",
                sharesSymbol: "AAVEv3brETH",
                type: "base",
                collateral: "wstETH",
                oracle: "wstETH/USD Oracle"
            }
        },
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated       
        AAVEPool: "0xF8D0e82B1EE3EEc7AEcDAa4E1c94E29fe3Db712E",
    },
    "arbitrum_devnet": {
        minTxConfirmations: 0,
        owner: "",
        uniswapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Validated 
        uniswapQuoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e", // Validated 
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated
        weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // Validated
        wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529", // Validated
        oracles: [{
            pair:PythFeedNameEnum.WSTETH_USD,
            address: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4"
        }, {
            pair: "ETH/USD",
            address: "0x501F860caE70FA5058f1D33458F6066fdB62A591"
        }],
        vaults: {
            [VaultNamesEnum.AAVE_V3_WSTETH_ETH]: { 
                sharesName: "AAVEv3 Bread ETH",
                sharesSymbol: "AAVEv3brETH",
                type: "base",
                collateral: "wstETH",
                oracle: "wstETH/USD Oracle"
            }
        },
        AAVEEModeCategory: 2,
        swapFeeTier: 100,
        AAVEPool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Validated   
        pyth: "0xff1a0f4744e8582df1ae09d5611b887b6a12925c",
        // TODO: Update these addresses
        chainlink: {
            wstEthToETH: "",
            ethToUSD: "",
            cbETHToETH: "",
        }
    },
    "arbitrum": {
        minTxConfirmations: 6,
        owner: "",
        uniswapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Validated 
        uniswapQuoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e", // Validated 
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated
        weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1", // Validated
        wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529", // Validated
        oracles: [{
            pair: PythFeedNameEnum.WSTETH_USD,
            address: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4"
        }, {
            pair: PythFeedNameEnum.ETH_USD,
            address: "0x501F860caE70FA5058f1D33458F6066fdB62A591"
        }],
        vaults: {
            [VaultNamesEnum.AAVE_V3_WSTETH_ETH]: { 
                sharesName: "AAVEv3 Bread ETH",
                sharesSymbol: "AAVEv3brETH",
                type: "base",
                collateral: "wstETH",
                oracle: "wstETH/USD Oracle"
            }
        },
        AAVEEModeCategory: 2,
        swapFeeTier: 100,
        AAVEPool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Validated   
        pyth: "0xff1a0f4744e8582df1ae09d5611b887b6a12925c",
         // TODO: Update these addresses
         chainlink: {
            wstEthToETH: "",
            ethToUSD: "",
            cbETHToETH: "",
        }
    },
    hardhat: {
        minTxConfirmations: 0,
        owner: "0xf15CC0ccBdDA041e2508B829541917823222F364",
        uniswapRouter02: "",
        uniswapQuoter: "",
        balancerVault: "",
        weth: "",
        wstETH: "",
        stETH: undefined,
        oracles: [],
        AAVEEModeCategory: 2,
        swapFeeTier: 100,
        vaults: {
            [VaultNamesEnum.AAVE_V3_WSTETH_ETH]: { 
                sharesName: "AAVEv3 Bread ETH",
                sharesSymbol: "AAVEv3brETH",
                type: "base",
                collateral: "wstETH",
                oracle: "wstETH/USD Oracle"
            }
        },        
        AAVEPool: "",
        pyth: "",
    }
}


export default Config;