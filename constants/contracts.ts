/**
 * Deployed Contract Addresses
 */

export type DeployConfig = {
    proxyAdmin?: string;
    serviceRegistry: string;    
    weth: string;    
    stETH: string | null;    
    wstETH: string | null;    
    flashLender: string;    
    uniswapRouter: string;    
    uniswapQuoter: string;    
    AAVEv3Pool:string;    
    wstETHETHOracle:string;    
    ethUSDOracle: string;    
    strategy:string;    
    strategyProxy?: string;
    vault: string;    
    vaultProxy?: string;
    settings: string;    
    settingsProxy?: string;
    bkr?: string;
    pyth?: string;
    wstETHETHOracleFeedId?: string;
    ethUSDOracleFeedId?: string;
    chainlink?: {
        wstEthToETH: string;
        ethToUSD: string;
    }
}

export const pythFeedIds = {
    ETH_USD_FEED_ID: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
    CBETH_USD_FEED_ID: "0x15ecddd26d49e1a8f1de9376ebebc03916ede873447c1255d2d5891b92ce5717",
    WSETH_USD_FEED_ID: "0x6df640f3b8963d8f8358f791f352b8364513f6ab1cca5ed3f1f7b5448980e784"
};

export const deployConfigMap : {[key: string]: DeployConfig} = 
{
    "local": {
        proxyAdmin: "0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e",
        serviceRegistry: "0x5bC13d5ce928Ae6e414A831D173E86fD040deBb9",       
        weth: "0xd7630A747b24b7245ff60e3095aD04684dC1a292",  
        stETH: "0x2C263d29775dC27167c58aB7B18dc6C942c141B0",
        wstETH: "0x27F56eb75a1EBbE7e7218e8fCa5FF51E3d655f22",
        flashLender: "0x5Ac32814f9EB4d415779892890a216b244FcB3B5",
        uniswapRouter: "0x621e8cdBc878Bdda95d0247B71FeBE0a8b2d4EE3", 
        uniswapQuoter: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4",
        AAVEv3Pool: "0xE8A1e868E4736669b73B9E26BE22129bD6B4E83d", 
        wstETHETHOracle: "0x501F860caE70FA5058f1D33458F6066fdB62A591",
        ethUSDOracle: "0xF8D0e82B1EE3EEc7AEcDAa4E1c94E29fe3Db712E",
        settings: "0x26A76D21edD8049fd394786976EF578010569FcB", 
        settingsProxy: "0xB7d0add4df75aa719bE464e860C8c40bb7FA2122",       
        strategy: "0xe33CA06EaaAF46A98C5631CF6c847fC50067E727",
        strategyProxy: "0x203a091dAe3B98144885927b0A2cf7Ead341b2C6",
        vault: "0xb99b2F8f3d121f2B491Cc61b84689a5638E106B4",  
        vaultProxy: "0x3AE68Fa5cF690ECa79fDc59b2f6B1c3eE05a3118",   
        bkr: "0x17f498e79c166abc68ea1cB1a3b5E540279682D8"    
    },
    "arbitrum": {
        proxyAdmin: "0xa641256b225e215c559cdC58F8757ad7140A2723",
        serviceRegistry: "0x82405993C4473A4364DF9D0C09E1A81Ecef9CA25",       
        weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",  
        stETH: "0x07C1F45Dc0a620E6716d8A45485B8f0A79E270F8",
        wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529",
        flashLender: "0x2db37f9DcD838B06a40Dc1aB171a8eBB474ef44C",
        uniswapRouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", 
        uniswapQuoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        AAVEv3Pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", 
        wstETHETHOracle: "0x63121b44680C502FDeDC725cd7CBcD37E0967d88",
        ethUSDOracle: "0xd0fDAfd2cf24fC4D8B57ffC001d3DC10422d3623",
        strategy: "0x8Fb35FEf7c2fcdfE09b6985f894905b875111a72",
        strategyProxy: "0x40aB23988835bdA372deA30690CCCC3419580548",
        vault: "0x3a6f7a481ad94eb03d229b846002561dc2742449",      
        vaultProxy: "0x5c1b2312FaE6c0d61B6A15A8093842E9fE5b1e44",          
        settings: "0xb0bbF58c8199F3CA383F0535b6a58A6E5Bbd587B",
        settingsProxy: "0xBd7f910A074D9d35789a47FF0962b5706D7855dF",
        pyth: "0xff1a0f4744e8582df1ae09d5611b887b6a12925c",  
        chainlink: {
            wstEthToETH: "0xb523AE262D20A936BC152e6023996e46FDC2A95D",
            ethToUSD: "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612"
        },
    }
}

export default deployConfigMap; 
