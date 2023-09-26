

import "@nomicfoundation/hardhat-toolbox";
import "hardhat-contract-sizer";
import "solidity-coverage";
import "@nomiclabs/hardhat-solhint";
import "hardhat-gas-reporter";
import '@typechain/hardhat'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-chai-matchers'

import { HardhatUserConfig } from "hardhat/config";
import { STAGING_ACCOUNTS_PKEYS} from "./constants/test-accounts";
import {HardhatNetworkAccountUserConfig} from "hardhat/types/config";

const devAccounts: HardhatNetworkAccountUserConfig[] =  STAGING_ACCOUNTS_PKEYS.map(
  key=>  { return {privateKey: key, balance: "1000000000000000000000000"}}); 

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
  },  
  defaultNetwork: "hardhat",
  typechain: {
    outDir: 'src/typechain',
    target: 'ethers-v6',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    dontOverrideCompile: false // defaults to false
  },
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
      allowUnlimitedContractSize: true,
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
      url: "https://rpc.vnet.tenderly.co/devnet/base-development/9ae3a35a-51c7-4e24-beaf-a66cf052a281",
      chainId: 8453,
      gasMultiplier: 2,
      accounts: STAGING_ACCOUNTS_PKEYS
    }
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
};

export default config;
