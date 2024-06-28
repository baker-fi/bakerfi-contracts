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

export type DeployConfig = {
    [key in Networks]: NetworkConfig;
};

export type NetworkConfig = {
    uniswapRouter02: string,
    uniswapQuoter: string,
    balancerVault: string,
    weth: string,
    wstETH: string;
    stETH?: string;
    oracles: {
        pair: PythOraclePairs,
        address: string,
    }[],
    AAVEEModeCategory: number,
    strategy: {
        type:  StrategyType;
        collateral: string,
        oracle: OracleRegistryNames,
    },
    swapFeeTier: number,        
    AAVEPool: string, // Validated      
    pyth: string, 
    vaultSharesName: string,
    vaultSharesSymbol: string,
    chainlink?: {
        wstEthToETH: string,
        ethToUSD: string,
        cbETHToETH: string,
    },
};

const Config: DeployConfig = {
    "ethereum_devnet": {
        uniswapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Validated 
        uniswapQuoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
        weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
        stETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
        oracles: [{
            pair: PythFeedNameEnum.WSTETH_USD,
            address: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4"
        }, {
            pair: PythFeedNameEnum.ETH_USD,
            address: "0x501F860caE70FA5058f1D33458F6066fdB62A591"
        }],
        AAVEEModeCategory: 1,
        strategy: {
            type: "base",
            collateral: "wstETH",
            oracle: "wstETH/USD Oracle"
        },
        swapFeeTier: 100,
        AAVEPool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // Validated      
        pyth: "0x4305FB66699C3B2702D4d05CF36551390A4c69C6",
        vaultSharesName: "AAVEv3 Bread ETH",
        vaultSharesSymbol: "AAVEv3brETH",
    },
    "base": {
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
        strategy: {
            type: "base",
            collateral: "wstETH",
            oracle: "wstETH/USD Oracle"
        },
        swapFeeTier: 100,
        AAVEPool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // Validated      
        pyth: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a",
        vaultSharesName: "Base AAVEv3 Bread ETH",
        vaultSharesSymbol: "baseAAVEv3brETH",
    },
    "base_devnet": {
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
        strategy: {
            type: "base",
            collateral: "wstETH",
            oracle: "wstETH/USD Oracle"
        },
        swapFeeTier: 100,
        AAVEPool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // Validated      
        pyth: "0x8250f4aF4B972684F7b336503E2D6dFeDeB1487a",
        vaultSharesName: "Base AAVEv3 Bread ETH",
        vaultSharesSymbol: "baseAAVEv3brETH",
    },
    "optimism_devnet": {
        uniswapRouter02: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Validated 
        uniswapQuoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e", // Validated 
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated
        weth: "0x4200000000000000000000000000000000000006", // Validated
        wstETH: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb", // Validated
        oracles: [{
            pair: PythFeedNameEnum.WSTETH_USD,
            address: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4"
        }, {
            pair: PythFeedNameEnum.ETH_USD,
            address: "0x501F860caE70FA5058f1D33458F6066fdB62A591"
        }],
        strategy: {
            type: "base",
            collateral: "wstETH",
            oracle: "wstETH/USD Oracle"
        },
        AAVEEModeCategory: 2,
        swapFeeTier: 100,
        AAVEPool: "0x794a61358d6845594f94dc1db02a252b5b4814ad", // Validated   
        pyth: "0xff1a0f4744e8582DF1aE09D5611b887B6a12925C",
        vaultSharesName: "Optimism AAVEv3 Bread ETH",
        vaultSharesSymbol: "optAAVEv3brETH",
    },
    "local": {
        AAVEEModeCategory: 0,
        swapFeeTier: 500,
        uniswapRouter02: "0xB7d0add4df75aa719bE464e860C8c40bb7FA2122",
        uniswapQuoter: "0x53e12d61AF104185485C79cbeBEe3D1F896d705f",
        weth: "0x5bC13d5ce928Ae6e414A831D173E86fD040deBb9",
        wstETH: "0xf93e63A0d1ec46402065b862f08ad0962d5b2C88",
        pyth: "0xff1a0f4744e8582df1ae09d5611b887b6a12925c",
        stETH: "0x07C1F45Dc0a620E6716d8A45485B8f0A79E270F8",
        oracles: [{
            pair:PythFeedNameEnum.WSTETH_USD,
            address: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4"
        }, {
            pair: PythFeedNameEnum.ETH_USD,
            address: "0x501F860caE70FA5058f1D33458F6066fdB62A591"
        }],
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated       
        AAVEPool: "0xF8D0e82B1EE3EEc7AEcDAa4E1c94E29fe3Db712E",
        vaultSharesName: "Local AAVEv3 Bread ETH",
        vaultSharesSymbol: "localAAVEv3brETH",
        strategy: {
            type: "base",
            collateral: "wstETH",
            oracle: "wstETH/USD Oracle"
        },
    },
    "arbitrum_devnet": {
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
        strategy: {
            type: "base",
            collateral: "wstETH",
            oracle: "wstETH/USD Oracle"
        },
        AAVEEModeCategory: 2,
        swapFeeTier: 100,
        AAVEPool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Validated   
        pyth: "0xff1a0f4744e8582df1ae09d5611b887b6a12925c",
        vaultSharesName: "Arbitrum AAVEv3 Bread ETH",
        vaultSharesSymbol: "arbAAAv3ETH",
        // TODO: Update these addresses
        chainlink: {
            wstEthToETH: "",
            ethToUSD: "",
            cbETHToETH: "",
        }
    },
    "arbitrum": {
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
        strategy: {
            type: "base",
            collateral: "wstETH",
            oracle: "wstETH/USD Oracle"
        },
        AAVEEModeCategory: 2,
        swapFeeTier: 100,
        AAVEPool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", // Validated   
        pyth: "0xff1a0f4744e8582df1ae09d5611b887b6a12925c",
        vaultSharesName: "Arbitrum AAVEv3 Bread ETH",
        vaultSharesSymbol: "arbAAAv3ETH",
         // TODO: Update these addresses
         chainlink: {
            wstEthToETH: "",
            ethToUSD: "",
            cbETHToETH: "",
        }
    },
    hardhat: {
        uniswapRouter02: "",
        uniswapQuoter: "",
        balancerVault: "",
        weth: "",
        wstETH: "",
        stETH: undefined,
        oracles: [],
        AAVEEModeCategory: 2,
        strategy: {
            type: "base",
            collateral: "",
            oracle: "wstETH/USD Oracle"
        },
        swapFeeTier: 100,
        AAVEPool: "",
        pyth: "",
        vaultSharesName: "",
        vaultSharesSymbol: ""
    }
}


export default Config;