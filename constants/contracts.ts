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

}

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
        ethUSDOracle: "0x57237193fA6B5fD3d3e8eC5d989dF73846cf7C1f",
        settings: "0x26A76D21edD8049fd394786976EF578010569FcB", 
        settingsProxy: "0xB7d0add4df75aa719bE464e860C8c40bb7FA2122",       
        strategy: "0xc2a603BcFa46e5616CEa164DA6A80cF62E080858",
        strategyProxy: "0xe33CA06EaaAF46A98C5631CF6c847fC50067E727",
        vault: "0x4129eE2030194089cEECc34fE47AfFb381E9e45D",  
        vaultProxy: "0xb99b2F8f3d121f2B491Cc61b84689a5638E106B4",        
    },
    "arbitrum": {
        serviceRegistry: "0xd68a2846168052C43Ae44591B6F67588D218b150",       
        weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",  
        stETH: "0x07C1F45Dc0a620E6716d8A45485B8f0A79E270F8",
        wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529",
        flashLender: "0x38BEB36E9E3cF01085D0e8C317285eeefF126e7f",
        uniswapRouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", 
        uniswapQuoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        AAVEv3Pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", 
        wstETHETHOracle: "0x8D5EEF9bcbB008784b6232b61890F52A7648d81F",
        ethUSDOracle: "0x6060608FD42b2bBC23F21ff7BB4fE72F3Ca21Ef1",
        strategy: "0x6c59eD8e7B8641f7Abe89B1dBa8C5847799FD6FB",
        strategyProxy: "0x6c59eD8e7B8641f7Abe89B1dBa8C5847799FD6FB",
        vault: "0x7454072e99Bb7f7079fe24BFDf32A3F458a35d3C",      
        vaultProxy: "0x7454072e99Bb7f7079fe24BFDf32A3F458a35d3C",          
        settings: "0xb5A087ba08a6ee489c6f554Ca458741A18CDae99",
        settingsProxy: "0xb5A087ba08a6ee489c6f554Ca458741A18CDae99"            
    }
}

export default deployConfigMap;