import "dotenv/config";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "@nomiclabs/hardhat-solhint";
import "hardhat-gas-reporter";
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import { HardhatUserConfig } from "hardhat/config";
import { STAGING_ACCOUNTS_PKEYS} from "./constants/test-accounts";
import {HardhatNetworkAccountUserConfig} from "hardhat/types/config";
import "@nomicfoundation/hardhat-verify";
//import "hardhat-tracer";
import 'solidity-docgen';
import "./scripts/tasks";
import "hardhat-flat-exporter";

const devAccounts: HardhatNetworkAccountUserConfig[] =  STAGING_ACCOUNTS_PKEYS.map(
  key=>  { return {privateKey: key, balance: "1000000000000000000000000"}}); 

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: 'USDC',
    gasPrice: 10
  },  
  mocha: {
    timeout: 100000000
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      accounts: devAccounts,
      mining: {
        auto: true,
        interval: 2000,
      },
      hardfork: 'london',
      gas: 'auto',
      initialBaseFeePerGas: 1000000000,
    },
    local: {
      chainId: 1337,
      hardfork: 'shanghai',
      url: "http://localhost:8545",
      accounts: STAGING_ACCOUNTS_PKEYS,      
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      gasPrice: 120 * 1000000000,
      chainId: 1,
    },
    arbitrum: {
      url: 
       process.env.TEST_FORK === "true" ?
       process.env.TENDERLY_FORK_RPC :
      `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 42161,
      blockGasLimit: 900000,
      ...process.env.BAKERFI_PRIVATE_KEY ? { 
        accounts: [`${process.env.BAKERFI_PRIVATE_KEY}`]
      }: {},
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
      chainId: 42,
      gasPrice: 20000000000,
      gasMultiplier: 2,
    },
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      chainId: 137,            
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      chainId: 80001,      
      gasMultiplier: 2,
      accounts: STAGING_ACCOUNTS_PKEYS
    },
    base_devnet: {
      url: `${process.env.TENDERLY_DEV_NET_RPC}`,
      chainId: 8453,
      gasMultiplier: 4,
      accounts: STAGING_ACCOUNTS_PKEYS
    },
    optimism_devnet: {
      url: `${process.env.TENDERLY_DEV_NET_RPC}`,
      chainId: 10,
      gasMultiplier: 4,
      accounts: STAGING_ACCOUNTS_PKEYS
    },
    arbitrum_devnet: {
      url: `${process.env.TENDERLY_DEV_NET_RPC}`,
      chainId: 42161,
      gasMultiplier: 4,
      accounts: STAGING_ACCOUNTS_PKEYS
    },
    ethereum_devnet: {
      url: `${process.env.TENDERLY_DEV_NET_RPC}`,
      chainId: 1,
      gasMultiplier: 4,
      accounts: STAGING_ACCOUNTS_PKEYS
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.4.21',
        settings: {
          optimizer: {
            enabled: true,
            runs: 0,
          },
        },
      },
      {
        version: '0.4.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 0,
          },
        },
      },
      {
        version: '0.5.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 0,
          },
        },
      },
      {
        version: '0.8.18',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },

        },
      },
      {
        version: '0.8.15',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },

        },
      },
    ],
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true
  },
  flattenExporter: {
    src: "./contracts",
    path: "./flat",
    clear: true,
  }, 
  docgen: {
    outputDir: "doc",
    pages: "files",
    exclude: [
      "mocks", 
      "tests",
      "interfaces/lido",
      "interfaces/tokens",
      "libraries/tokens/WETH.md",
    ],
    collapseNewlines: true
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY,
  },  
};

export default config;
