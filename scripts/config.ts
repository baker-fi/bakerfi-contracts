export default {    
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
        AAVEPool: "0x794a61358d6845594f94dc1db02a252b5b4814ad", // Validated   
    }, 
    "hardhat": {
        AAVEEModeCategory: 0,        
    },
}


