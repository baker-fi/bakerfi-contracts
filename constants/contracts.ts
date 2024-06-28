/**
 * Deployed Contract Addresses
 */

import { Networks } from "./network-deploy-config";

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

export const deployConfigMap : {[key: string]: BakerDeployConfig} = 
{
    "local": {
        proxyAdmin: "0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e",
        serviceRegistry: "0xd7630A747b24b7245ff60e3095aD04684dC1a292",       
        flashLender: "0x3db637fB908a3EBD857e4c8f8214fe30277d34eE",
        wstETHUSDOracle: "0x57237193fA6B5fD3d3e8eC5d989dF73846cf7C1f",
        ethUSDOracle: "0x334a1f3C8C9c6CD670273cD80349505dB37aFc65",
        settings: "0xB7d0add4df75aa719bE464e860C8c40bb7FA2122", 
        settingsProxy: "0x6FECed7e0e9e156A945003ebFD25304B7Dfb1C3e",       
        strategy: "0xe33CA06EaaAF46A98C5631CF6c847fC50067E727",
        strategyProxy: "0x203a091dAe3B98144885927b0A2cf7Ead341b2C6",
        vault: "0xb99b2F8f3d121f2B491Cc61b84689a5638E106B4",  
        vaultProxy: "0x3AE68Fa5cF690ECa79fDc59b2f6B1c3eE05a3118",   
        bkr: "0x17f498e79c166abc68ea1cB1a3b5E540279682D8",
    },
    "arbitrum": {
        proxyAdmin: "0xa641256b225e215c559cdC58F8757ad7140A2723",
        serviceRegistry: "0x82405993C4473A4364DF9D0C09E1A81Ecef9CA25",    
        flashLender: "0x2db37f9DcD838B06a40Dc1aB171a8eBB474ef44C",
        wstETHUSDOracle: "0x63121b44680C502FDeDC725cd7CBcD37E0967d88",
        ethUSDOracle: "0xd0fDAfd2cf24fC4D8B57ffC001d3DC10422d3623",
        strategy: "0x8Fb35FEf7c2fcdfE09b6985f894905b875111a72",
        strategyProxy: "0x40aB23988835bdA372deA30690CCCC3419580548",
        vault: "0x3a6f7a481ad94eb03d229b846002561dc2742449",      
        vaultProxy: "0x5c1b2312FaE6c0d61B6A15A8093842E9fE5b1e44",          
        settings: "0xb0bbF58c8199F3CA383F0535b6a58A6E5Bbd587B",
        settingsProxy: "0xBd7f910A074D9d35789a47FF0962b5706D7855dF", 
        bkr: "0x17f498e79c166abc68ea1cB1a3b5E540279682D8",       
    },
    "base": {
        proxyAdmin: "0xa641256b225e215c559cdC58F8757ad7140A2723",
        serviceRegistry: "0x82405993C4473A4364DF9D0C09E1A81Ecef9CA25",    
        flashLender: "0x2db37f9DcD838B06a40Dc1aB171a8eBB474ef44C",
        wstETHUSDOracle: "0x63121b44680C502FDeDC725cd7CBcD37E0967d88",
        ethUSDOracle: "0xd0fDAfd2cf24fC4D8B57ffC001d3DC10422d3623",
        strategy: "0x8Fb35FEf7c2fcdfE09b6985f894905b875111a72",
        strategyProxy: "0x40aB23988835bdA372deA30690CCCC3419580548",
        vault: "0x3a6f7a481ad94eb03d229b846002561dc2742449",      
        vaultProxy: "0x5c1b2312FaE6c0d61B6A15A8093842E9fE5b1e44",          
        settings: "0xb0bbF58c8199F3CA383F0535b6a58A6E5Bbd587B",
        settingsProxy: "0xBd7f910A074D9d35789a47FF0962b5706D7855dF",
        bkr: "0x17f498e79c166abc68ea1cB1a3b5E540279682D8",
       
    },
    "base_devnet": {
        proxyAdmin: "0xa641256b225e215c559cdC58F8757ad7140A2723",
        serviceRegistry: "0x82405993C4473A4364DF9D0C09E1A81Ecef9CA25",    
        flashLender: "0x2db37f9DcD838B06a40Dc1aB171a8eBB474ef44C",
        wstETHUSDOracle: "0x63121b44680C502FDeDC725cd7CBcD37E0967d88",
        ethUSDOracle: "0xd0fDAfd2cf24fC4D8B57ffC001d3DC10422d3623",
        strategy: "0x8Fb35FEf7c2fcdfE09b6985f894905b875111a72",
        strategyProxy: "0x40aB23988835bdA372deA30690CCCC3419580548",
        vault: "0x3a6f7a481ad94eb03d229b846002561dc2742449",      
        vaultProxy: "0x5c1b2312FaE6c0d61B6A15A8093842E9fE5b1e44",          
        settings: "0xb0bbF58c8199F3CA383F0535b6a58A6E5Bbd587B",
        settingsProxy: "0xBd7f910A074D9d35789a47FF0962b5706D7855dF",
    }
}

export default deployConfigMap; 
