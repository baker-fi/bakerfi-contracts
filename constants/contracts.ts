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
    mathLibrary: string;
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
        serviceRegistry: "0xd7630A747b24b7245ff60e3095aD04684dC1a292",       
        mathLibrary: "0x5bC13d5ce928Ae6e414A831D173E86fD040deBb9",
        weth: "0x709432fD1621610C92cA6E8455c81Ae88621Bbb6",  
        stETH: "0xf93e63A0d1ec46402065b862f08ad0962d5b2C88",
        wstETH: "0x258b944B1e716c01725771148382EB988e4AB0a7",
        flashLender: "0x3db637fB908a3EBD857e4c8f8214fe30277d34eE",
        uniswapRouter: "0x6a0419f287B1036B97cE06b3eda5372b42787a4c", 
        uniswapQuoter: "0x501F860caE70FA5058f1D33458F6066fdB62A591",
        AAVEv3Pool: "0x3e2E02FfA86Dc280539121F6648b2180d8351637", 
        wstETHETHOracle: "0x57237193fA6B5fD3d3e8eC5d989dF73846cf7C1f",
        ethUSDOracle: "0x334a1f3C8C9c6CD670273cD80349505dB37aFc65",
        settings: "0xB7d0add4df75aa719bE464e860C8c40bb7FA2122", 
        settingsProxy: "0x6FECed7e0e9e156A945003ebFD25304B7Dfb1C3e",       
        strategy: "0xe33CA06EaaAF46A98C5631CF6c847fC50067E727",
        strategyProxy: "0x203a091dAe3B98144885927b0A2cf7Ead341b2C6",
        vault: "0xb99b2F8f3d121f2B491Cc61b84689a5638E106B4",  
        vaultProxy: "0x3AE68Fa5cF690ECa79fDc59b2f6B1c3eE05a3118",   
        bkr: "0x17f498e79c166abc68ea1cB1a3b5E540279682D8",
        pyth: "0x73BD7624C015046229e7e59fF128D67b3D5e6dB2",
    },
    "arbitrum": {
        proxyAdmin: "0xa641256b225e215c559cdC58F8757ad7140A2723",
        serviceRegistry: "0x82405993C4473A4364DF9D0C09E1A81Ecef9CA25",    
        mathLibrary: "",   
        weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",  
        stETH: "0x07C1F45Dc0a620E6716d8A45485B8f0A79E270F8",
        wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529",
        flashLender: "0x2db37f9DcD838B06a40Dc1aB171a8eBB474ef44C",
        uniswapRouter: "0xE592427A0AEce92De3Edee1F18E0157C05861564", 
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
