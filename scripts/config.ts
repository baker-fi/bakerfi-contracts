export default {    
    "base_devnet": {
        uniswapRouter: "0x2626664c2603336E57B271c5C0b26F421741e481", // Validated 
        balancerVault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8", // Validated
        weth: "0x4200000000000000000000000000000000000006",  // Validated
        cbETH: "0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22", // Validated
        oracle: {
            type: "cbETH",
            chainLink: "0xf017fcb346a1885194689ba23eff2fe6fa5c483b",
        },
        strategy: "base",        
        AAVEPool: "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5", // Validated       
    }    
}