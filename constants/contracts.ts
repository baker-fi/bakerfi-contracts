/**
 * Deployed Contract Addresses
 */

export type DeployConfig = {
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
    vault: string;    
    settings: string;    

}

export const deployConfigMap : {[key: string]: DeployConfig} = 
{
    "local": {
        serviceRegistry: "0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e",       
        weth: "0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e",  
        stETH: "0x07C1F45Dc0a620E6716d8A45485B8f0A79E270F8",
        wstETH: "0xf93e63A0d1ec46402065b862f08ad0962d5b2C88",
        flashLender: "0x709432fD1621610C92cA6E8455c81Ae88621Bbb6",
        uniswapRouter: "0xB7d0add4df75aa719bE464e860C8c40bb7FA2122", 
        uniswapQuoter: "0x53e12d61AF104185485C79cbeBEe3D1F896d705f",
        AAVEv3Pool: "0x9A0562314E0D5EE1bC11e57047698Af492c5A51E", 
        wstETHETHOracle: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4",
        ethUSDOracle: "0x501F860caE70FA5058f1D33458F6066fdB62A591",
        strategy: "0xF8D0e82B1EE3EEc7AEcDAa4E1c94E29fe3Db712E",
        vault: "0x334a1f3C8C9c6CD670273cD80349505dB37aFc65",        
        settings: "0x258b944B1e716c01725771148382EB988e4AB0a7"        
    },
    "arbitrum": {
        serviceRegistry: "0x328C8F721BF0396Ae955a99683e04095685476c9",       
        weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",  
        stETH: "0x07C1F45Dc0a620E6716d8A45485B8f0A79E270F8",
        wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529",
        flashLender: "0xcA6b464528907C0eDF55B101b89FFC63f5B4EdB2",
        uniswapRouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", 
        uniswapQuoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e",
        AAVEv3Pool: "0x794a61358D6845594F94dc1DB02A252b5b4814aD", 
        wstETHETHOracle: "0x74730C0B0710b3Fbde5B1CA34ed4B21642d6c399",
        ethUSDOracle: "0x4B0b9d7e81EfF2C4137B9007355C54286f55fcFd",
        strategy: "0x84249279626d14eD6d03ffc0d618789a9A3dc5C4",
        vault: "0x4AdCcd38A1D8BeC931F7756c32Da6EfD2E405B6f",        
        settings: "0x14dAdd1A32fd6Af60EeBc87F5228E00931B28C7C"        
    }
}

export default deployConfigMap;