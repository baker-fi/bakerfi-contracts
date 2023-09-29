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
        strategy: "base",        
        AAVEPool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // Validated       
    }    
}


