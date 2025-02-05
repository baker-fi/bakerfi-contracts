import 'dotenv/config';
import 'hardhat-flat-exporter';
import 'hardhat-contract-sizer';
import 'solidity-coverage';
import 'hardhat-gas-reporter';
import '@typechain/hardhat';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-contract-sizer';
import { HardhatUserConfig } from 'hardhat/config';
import { STAGING_ACCOUNTS_PKEYS } from './constants/test-accounts';
import { HardhatNetworkAccountUserConfig } from 'hardhat/types/config';
import '@nomicfoundation/hardhat-verify';
import 'solidity-docgen';
import './scripts/tasks/';
import 'hardhat-storage-layout-changes';
import '@nomiclabs/hardhat-solhint';

const devAccounts: HardhatNetworkAccountUserConfig[] = STAGING_ACCOUNTS_PKEYS.map((key) => {
  return { privateKey: key, balance: '1000000000000000000000000' };
});

const config: HardhatUserConfig = {
  gasReporter: {
    enabled: process.env.REPORT_GAS === 'true',
    currency: 'USDC',
    gasPrice: 10,
  },
  mocha: {
    timeout: 100000000,
  },
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      accounts: devAccounts,
      gas: 'auto',
    },
    local: {
      chainId: 1337,
      hardfork: 'shanghai',
      url: process.env.WEB3_RPC_LOCAL_URL || 'http://127.0.0.1:8545',
      gas: 'auto',
      accounts: STAGING_ACCOUNTS_PKEYS,
    },
    ethereum: {
      url:
        process.env.WEB3_RPC_ETH_MAIN_NET_URL ||
        `https://rpc.ankr.com/eth/${process.env.ANKR_API_KEY}`,
      gasPrice: 120 * 1000000000,
      chainId: 1,
    },
    arbitrum: {
      url:
        process.env.WEB3_RPC_ARBITRUM_URL ||
        `https://rpc.ankr.com/arbitrum/${process.env.ANKR_API_KEY}`,
      chainId: 42161,
      blockGasLimit: 900000,
      ...(process.env.BAKERFI_PRIVATE_KEY
        ? {
            accounts: [`${process.env.BAKERFI_PRIVATE_KEY}`],
          }
        : {}),
    },
    optimism: {
      url:
        process.env.WEB3_RPC_OPTIMISM_URL ||
        `https://rpc.ankr.com/optimism/${process.env.ANKR_API_KEY}`,
      hardfork: 'shanghai',
      chainId: 10,
    },
    base: {
      url: process.env.WEB3_RPC_BASE_URL || `https://rpc.ankr.com/base/${process.env.ANKR_API_KEY}`,
      chainId: 8453,
      ...(process.env.BAKERFI_PRIVATE_KEY
        ? {
            accounts: [`${process.env.BAKERFI_PRIVATE_KEY}`],
          }
        : {}),
    },
    ethereum_devnet: {
      url: `${process.env.TENDERLY_DEV_NET_RPC}`,
      chainId: 1,
      gasMultiplier: 4,
      accounts: STAGING_ACCOUNTS_PKEYS,
    },
    arbitrum_devnet: {
      url: `${process.env.TENDERLY_DEV_NET_RPC}`,
      chainId: 42161,
      gasMultiplier: 4,
      accounts: STAGING_ACCOUNTS_PKEYS,
    },
    optimism_devnet: {
      url: `${process.env.TENDERLY_DEV_NET_RPC}`,
      chainId: 10,
      gasMultiplier: 4,
      accounts: STAGING_ACCOUNTS_PKEYS,
    },
    base_devnet: {
      url: `${process.env.TENDERLY_DEV_NET_RPC}`,
      chainId: 8453,
      gasMultiplier: 4,
      accounts: STAGING_ACCOUNTS_PKEYS,
    },
  },
  paths: {
    storageLayouts: '.storage-layouts',
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
        version: '0.6.12',
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
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
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
    strict: true,
  },
  docgen: {
    outputDir: 'doc',
    pages: 'files',
    exclude: ['mocks', 'tests', 'interfaces/lido', 'interfaces/tokens', 'libraries/tokens/WETH.md'],
    collapseNewlines: true,
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || '',
      base: process.env.BASESCAN_API_KEY || '',
      arbitrumOne: process.env.ARBSCAN_API_KEY || '',
    },
  },
  storageLayoutChanges: {
    contracts: ['Vault', 'StrategyLeverageAAVEv3', 'StrategyLeverageMorphoBlue'],
    fullPath: false,
  },
  typechain: {
    outDir: 'src/types',
    target: 'ethers-v6',
    alwaysGenerateOverloads: false, // should overloads with full signatures like deposit(uint256) be generated always, even if there are no overloads?
    dontOverrideCompile: false, // defaults to false
    externalArtifacts: [], // Add this line
  },
};

export default config;
