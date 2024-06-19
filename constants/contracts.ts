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
        proxyAdmin: "0xb69111A7484F6B19924DEB33F85efe639c62261c",
        serviceRegistry: "0x028a30409088FdF206C592f5157683756D925BD9",       
        mathLibrary: "0x71cB86757758f113F5D0b01333f85Dac212569bb",
        weth: "0x9bEdd996f815Cd35f44175b168A1133237506786",  
        stETH: "0x3bFbDC1dD6AD9082bfA1d6B86D3f74b89dBC7481",
        wstETH: "0x66AECB655efaBAa6D8EB7FE7Aa90689337139302",
        flashLender: "0x5F75130B53c8Ed8920e43e21d2222C66D65C9D91",
        uniswapRouter: "0x50C3f554f4338D43A84C23A6c7430e6Fc11Fd8fe", 
        uniswapQuoter: "0x3e0916a8b98e06F3b7a8Af28cd4acF4af5eB88d1",
        AAVEv3Pool: "0x26596c1F83c69654a3F0B7a2134bc3FDeb254AD8", 
        wstETHETHOracle: "0x0D71c0d80C1552AeaF5003Dd4c20D0196720902F",
        ethUSDOracle: "0x17887E2324B4FEDAaa45fFdE16cD553E1c3837a9",
        settings: "0x5814278Bb09A2A952829763cF0BA6f649550644A", 
        settingsProxy: "0x2c8dA25B924EDE15b0BdaD7b96f59CbD9385fa3B",       
        strategy: "0xD98EF1B7Ff678007f86B541265177De014550017",
        strategyProxy: "0x6c0C17276328328730513f3e1113E67145a06Cb9",
        vault: "0x205de1c2f6C8Ec6f16dB544b16e63412Bc16337E",  
        vaultProxy: "0x5d5Cac6Fd0126f62c29B0AE7807dC7724F5D4c79",   
        bkr: "0x3aED96402DB80662588BE79b7125acf6D2902971",
        pyth: "0x275eEa051D414a0Ee56D39b9B0dB82D3627AC5d7",
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
