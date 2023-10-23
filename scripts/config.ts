export default {    
    "ethereum_devnet": {
        uniswapRouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Validated 
        uniswapQuoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e", 
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
        weth: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
        wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
        stETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
        oracle: {
            type: "stETH",
            chainLink: "0x86392dc19c0b719886221c78ab11eb8cf5c52812",
        },
        ethOracle: "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419",
        AAVEEModeCategory: 1,       
        strategy: "wstETH",        
        swapFeeTier: 100,        
        AAVEPool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2", // Validated      

    },
    "base_devnet": {
        uniswapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481", // Validated 
        uniswapQuoter: "0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a", // Validated 
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated
        weth: "0x4200000000000000000000000000000000000006",  // Validated
        cbETH: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22", // Validated
        oracle: {
            type: "cbETH",
            chainLink: "0x806b4ac04501c29769051e42783cf04dce41440b",
        },
        ethOracle: "0x71041dddad3595f9ced3dccfbe3d1f4b0a16bb70",
        AAVEEModeCategory: 1,       
        strategy: "base",        
        swapFeeTier: 500,        
        AAVEPool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // Validated       
    },
    "optimism_devnet": {
        uniswapRouter: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45", // Validated 
        uniswapQuoter: "0x61fFE014bA17989E743c5F6cB21bF9697530B21e", // Validated 
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated
        weth: "0x4200000000000000000000000000000000000006",  // Validated
        wstETH: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb", // Validated
        oracle: {
            type: "wstETH",
            chainLink: "0x524299ab0987a7c4b3c8022a35669ddcdc715a10", // wstETH / ETH
        },
        ethOracle: "0x13e3ee699d1909e989722e753853ae30b17e08c5",
        strategy: "base",        
        AAVEEModeCategory: 2,        
        swapFeeTier: 100,        
        AAVEPool: "0x794a61358d6845594f94dc1db02a252b5b4814ad", // Validated   
    }, 
    "hardhat": {
        AAVEEModeCategory: 0,
        swapFeeTier: 500,        
    },
    "local": {
        AAVEEModeCategory: 0,
        swapFeeTier: 500,       
        registry: "0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e", 
        flashLender: "0x709432fD1621610C92cA6E8455c81Ae88621Bbb6",
        uniswapRouter: "0xB7d0add4df75aa719bE464e860C8c40bb7FA2122", 
        uniswapQuoter: "0x53e12d61AF104185485C79cbeBEe3D1F896d705f", 
        settings: "0x258b944B1e716c01725771148382EB988e4AB0a7",
        weth: "0x5bC13d5ce928Ae6e414A831D173E86fD040deBb9",
        wstETH: "0xf93e63A0d1ec46402065b862f08ad0962d5b2C88",
        stETH: "0x07C1F45Dc0a620E6716d8A45485B8f0A79E270F8",
        oracles: [{
            pair: "wstETH/ETH",
            address: "0x5B4C2dF0182946e8b31a9caF9807Dc837BA3F5c4"
        },{
            pair: "ETH/USD",
            address: "0x501F860caE70FA5058f1D33458F6066fdB62A591"
        }],
        strategy: "0x73BD7624C015046229e7e59fF128D67b3D5e6dB2",        
        vault: "0x334a1f3C8C9c6CD670273cD80349505dB37aFc65",
        AAVEPool: "0xF8D0e82B1EE3EEc7AEcDAa4E1c94E29fe3Db712E",      
    },
}


