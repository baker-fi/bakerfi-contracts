import 'dotenv/config';
import hre from 'hardhat';
import { ethers } from 'hardhat';
import BaseConfig from '../constants/network-deploy-config';

import {
  AAVEv3Market,
  AAVEv3MarketNames,
  NetworkConfig,
  StrategyImplementation,
} from '../constants/types';
import ora from 'ora';
import { ContractClientWallet } from './lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../constants/test-accounts';
import { ContractClient } from './lib/contract-client';
import { ContractClientLedger } from './lib/contract-client-ledger';
import ContractTree from '../src/contract-blob.json';
import { TransactionReceipt } from 'ethers';
import { deployProxyContract, RegistryNames } from './common';

const networkName = hre.network.name;
const chainId = BigInt(hre.network.config.chainId ?? 0n);

/**
 * Run this Hardhat script to deploy BakerFi contracts
 *
 * Usage:
 *  STRATEGY="<strategy_type>" AAVE_MARKET="<aavev3_market>" npx hardhat run --network <network_name> scripts/deploy.ts
 * Parameters:
 * - <network_name>: The network to deploy to (e.g., mainnet, goerli, sepolia)
 * - <strategy_type>: (Optional) The type of strategy to deploy. Defaults to AAVE_V3_WSTETH_ETH if not provided.
 * - <lend_market>: (Optional) The lending market to use. Defaults to AAVE_V3 if not provided.
 *
 * Examples:
 * npx hardhat --network ethereum run scripts/deploy.ts
 * npx hardhat --network base run scripts/deploy.ts
 *
 * STRATEGY="wstETH/ETH" AAVE_MARKET="AAVEv3 Lido Market" npx hardhat --network ethereum run scripts/deploy.ts
 * STRATEGY="Morpho Blue wstETH/ETH" npx hardhat --network ethereum run scripts/deploy.ts
 *
 * Note: Make sure to set up your .env file with the necessary environment variables before running this script.
 */
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/**
 * Deploys all the contracts related to a vault deployment.
 *
 * This function sets up the environment parameters, initializes the application,
 * deploys the vault and its related contracts, configures the vault, and dumps
 * the vault registry. It logs the deployment process and results to the console.
 *
 * @returns {Promise<void>} A promise that resolves when the deployment process is complete.
 */
async function main() {
  // Environment Parameters Section
  const strategy = (process.env.STRATEGY ||
    StrategyImplementation.AAVE_V3_WSTETH_ETH) as StrategyImplementation;
  const loanMarket = (process.env.AAVE_MARKET || AAVEv3MarketNames.AAVE_V3) as AAVEv3MarketNames;
  const reuseOracles = process.env.REUSE_ORACLES === 'true' || false;

  const result: any[] = [];
  const spinner = ora('Cooking ....').start();
  const app = await setupApp();
  result.push(['Network Name', networkName]);
  result.push(['Network Id', chainId]);
  result.push(['Owner', app.getAddress()]);

  const config: NetworkConfig = BaseConfig[networkName];
  try {
    const { registryReceipt, vaultAdress, strategyContract, strategyAddress } = await deployVault(
      app,
      strategy,
      reuseOracles,
      loanMarket,
      config,
      spinner,
      result,
    );
    await configureVault(
      spinner,
      app,
      strategyContract,
      strategyAddress,
      vaultAdress,
      config,
      result,
    );
    spinner.succeed('🧑‍🍳 BakerFi Served 🍰 ');
    console.table(result);
    await dumpVaultRegistry(app, registryReceipt, config);
    process.exit(0);
  } catch (error) {
    console.table(result);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Deploys the vault and its related infrastructure, including the strategy.
 *
 * This function first deploys the infrastructure related to the vault, such as settings, proxy admin, and registry.
 * Then, it deploys the strategy contract. Finally, it deploys the vault proxy contract.
 *
 * @param app The application instance used for deployment.
 * @param strategy The strategy implementation to deploy.
 * @param loanMarket The AAVE v3 market to use.
 * @param config The network configuration.
 * @param spinner The spinner to display deployment progress.
 * @param result The array to store deployment results.
 * @returns An object containing the receipts for the registry, proxy admin, strategy contract, strategy address, and vault address.
 */
async function deployVault(
  app: any,
  strategy: StrategyImplementation,
  reuseOracles: boolean,
  loanMarket: AAVEv3MarketNames,
  config: NetworkConfig,
  spinner: ora.Ora,
  result: any[],
) {
  // Deploy ProxyAdmin, Registry,....
  const {
    receipts: { registryReceipt, proxyAdminReceipt, flashLenderReceipt },
    oracles,
  } = await deployInfra(app, config, strategy, loanMarket, reuseOracles, spinner, result);

  // Deploy Strategy
  let { strategyConfig, strategyAddress, strategyContract } = await deployStrategy(
    strategy,
    config,
    app,
    proxyAdminReceipt,
    registryReceipt,
    flashLenderReceipt,
    oracles,
    spinner,
    result,
  );

  ////////////////////////////////////
  // Deploy Vault
  ////////////////////////////////////
  const vaultAdress = await deployProxyContract(
    chainId,
    app,
    config,
    'Vault',
    `${StrategyImplementation.AAVE_V3_WSTETH_ETH} Vault`,
    proxyAdminReceipt?.contractAddress,
    registryReceipt?.contractAddress,
    [
      app.getAddress(),
      strategyConfig.sharesName,
      strategyConfig.sharesSymbol,
      registryReceipt?.contractAddress,
      strategyAddress,
      config.weth,
    ],
    spinner,
    result,
  );
  return { registryReceipt, proxyAdminReceipt, strategyContract, strategyAddress, vaultAdress };
}

/**
 * This function is used to dump the vault registry.
 * It iterates over all the registry names and retrieves the service address for each one.
 * The service address is then added to the registerDump array.
 *
 * @param app The application instance used for deployment.
 * @param registryReceipt The transaction receipt of the registry contract deployment.
 * @param config The network configuration.
 */
async function dumpVaultRegistry(
  app: any,
  registryReceipt: TransactionReceipt | null,
  config: NetworkConfig,
) {
  const registerDump: any[] = [];
  for (const registerName of RegistryNames) {
    const address = await app.call(
      'VaultRegistry',
      registryReceipt?.contractAddress ?? '',
      'getService',
      [registerName],
      {
        chainId,
        minTxConfirmations: config.minTxConfirmations,
      },
    );
    registerDump.push([registerName, address]);
  }
}
/**
 * Configures the vault by transferring ownership and setting the loan-to-value (LTV) for the strategy.
 *
 * This function first transfers the ownership of the strategy to the vault address.
 * Then, it sets the loan-to-value (LTV) for the strategy.
 *
 * @param spinner The spinner to display configuration progress.
 * @param app The application instance used for configuration.
 * @param strategyContract The contract address of the strategy.
 * @param strategyAddress The address of the strategy.
 * @param vaultAdress The address of the vault.
 * @param config The network configuration.
 * @param result The array to store configuration results.
 */
async function configureVault(
  spinner: ora.Ora,
  app: any,
  strategyContract: any,
  strategyAddress: any,
  vaultAdress: string | null | undefined,
  config: NetworkConfig,
  result: any[],
) {
  spinner.text = 'Transferring Ownership ...';
  const changeOwnerReceipt = await app.send(
    strategyContract,
    strategyAddress ?? '',
    'transferOwnership',
    [vaultAdress],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );
  result.push(['Strategy Owner', vaultAdress, changeOwnerReceipt?.hash]);

  spinner.text = 'Changing LTV ...';
  const ltvChangeReceipt = await app.send(
    strategyContract,
    strategyAddress ?? '',
    'setLoanToValue',
    [ethers.parseUnits('800', 6)],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );
  result.push(['Strategy LTV', ethers.parseUnits('800', 6), ltvChangeReceipt?.hash]);
}

/**
 * Deploys the strategy contract based on the specified strategy implementation.
 *
 * This function determines the strategy configuration and contract type based on the provided strategy type.
 * It then deploys the strategy contract using the appropriate parameters and returns the strategy configuration, address, and contract.
 *
 * @param strategy The strategy implementation to deploy.
 * @param config The network configuration.
 * @param app The application instance used for deployment.
 * @param proxyAdminReceipt The transaction receipt of the proxy admin contract deployment.
 * @param registryReceipt The transaction receipt of the registry contract deployment.
 * @param spinner The spinner to display deployment progress.
 * @param result The array to store deployment results.
 * @returns An object containing the strategy configuration, address, and contract.
 */
async function deployStrategy(
  strategy: StrategyImplementation,
  config: NetworkConfig,
  app: any,
  proxyAdminReceipt: TransactionReceipt | null,
  registryReceipt: TransactionReceipt | null,
  flashLenderReceipt: TransactionReceipt | null,
  oracles: { [key: string]: string },
  spinner: ora.Ora,
  result: any[],
) {
  let strategyAddress;
  let strategyConfig;
  let strategyContract;
  switch (strategy) {
    case StrategyImplementation.AAVE_V3_WSTETH_ETH:
    case StrategyImplementation.AAVE_V3_WSTETH_ETH_LIDO:
      strategyConfig = config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH];
      const marketName = (config.markets[strategy] as AAVEv3Market).aavev3MarketName;
      strategyContract = 'StrategyLeverageAAVEv3';
      strategyAddress = await deployProxyContract(
        chainId,
        app,
        config,
        strategyContract,
        `${strategy} Strategy`,
        proxyAdminReceipt?.contractAddress,
        registryReceipt?.contractAddress,
        [
          app.getAddress(),
          app.getAddress(),
          registryReceipt?.contractAddress,
          config.wstETH,
          config.weth,
          oracles['wstETH/ETH Oracle'],
          flashLenderReceipt?.contractAddress,
          config.aavev3?.[marketName],
          strategyConfig.AAVEEModeCategory,
        ],
        spinner,
        result,
      );
      // Configure Route
      await app.send(
        strategyContract,
        strategyAddress ?? '',
        'enableRoute',
        [
          config.wstETH,
          config.weth,
          {
            router: config.uniswapRouter02,
            provider: 1,
            uniV3Tier: strategyConfig.swapFeeTier,
            tickSpacing: 0,
          },
        ],
        {
          chainId,
          minTxConfirmations: config.minTxConfirmations,
        },
      );
      break;
    case StrategyImplementation.MORPHO_BLUE_WSTETH_ETH:
      strategyConfig = config.markets[StrategyImplementation.MORPHO_BLUE_WSTETH_ETH];
      strategyContract = 'StrategyLeverageMorphoBlue';
      strategyAddress = await deployProxyContract(
        chainId,
        app,
        config,
        strategyContract,
        `${strategy} Strategy`,
        proxyAdminReceipt?.contractAddress,
        registryReceipt?.contractAddress,
        [
          app.getAddress(),
          app.getAddress(),
          [
            config.wstETH,
            config.weth,
            oracles['wstETH/ETH Oracle'],
            flashLenderReceipt?.contractAddress,
            config.morpho,
            strategyConfig.oracle,
            strategyConfig.irm,
            strategyConfig.lltv,
          ],
        ],
        spinner,
        result,
      );
      await app.send(
        strategyContract,
        strategyAddress ?? '',
        'enableRoute',
        [
          config.wstETH,
          config.weth,
          {
            router: config.uniswapRouter02,
            provider: 1,
            uniV3Tier: strategyConfig.swapFeeTier,
            tickSpacing: 0,
          },
        ],
        {
          chainId,
          minTxConfirmations: config.minTxConfirmations,
        },
      );
      break;
    default:
      throw Error('Unrecognized strategy;');
  }
  return { strategyConfig, strategyAddress, strategyContract };
}

/**
 * Sets up the application instance based on the deployment mode.
 *
 * This function initializes the application instance using the appropriate provider.
 * If the deployment is with Ledger, it uses the ContractClientLedger.
 * Otherwise, it uses the ContractClientWallet.
 *
 * @returns The initialized application instance.
 */
async function setupApp() {
  const [signerPKey] = STAGING_ACCOUNTS_PKEYS;
  let app;
  if (process.env.DEPLOY_WITH_LEDGER === 'true') {
    app = new ContractClientLedger(
      ethers.provider,
      ContractTree,
      process.env?.BAKERFI_LEDGER_PATH ?? '',
    );
  } else {
    app = new ContractClientWallet(ethers.provider, ContractTree, signerPKey);
  }
  await app.init();
  return app;
}

async function deployOracles(
  client: ContractClient<typeof ContractTree>,
  chainId: bigint,
  config: NetworkConfig,
  registryAddress: string,
  spinner,
  result,
) {
  const oracles = {};
  for (const oracle of config.oracles) {
    spinner.text = `Deploying ${oracle.name} ${oracle.type} Oracle`;
    let oracleReceipt;

    switch (oracle.type) {
      case 'chainlink':
        oracleReceipt = await client.deploy('ChainLinkOracle', [oracle.aggregator, 0, 0], {
          chainId,
          minTxConfirmations: config.minTxConfirmations,
        });
        break;
      case 'pyth':
        oracleReceipt = await client.deploy('PythOracle', [oracle.feedId, config.pyth], {
          chainId,
          minTxConfirmations: config.minTxConfirmations,
        });
        break;
      case 'clExRate':
        oracleReceipt = await client.deploy(
          'ChainLinkExRateOracle',
          [oracles[oracle.base].contractAddress, oracle.rateAggregator],
          {
            chainId,
            minTxConfirmations: config.minTxConfirmations,
          },
        );
        break;
      case 'customExRate':
        oracleReceipt = await client.deploy(
          'CustomExRateOracle',
          [oracles[oracle.base].contractAddress, [oracle.target, oracle.callData], 18],
          {
            chainId,
            minTxConfirmations: config.minTxConfirmations,
          },
        );
        break;
      case 'ratio':
        oracleReceipt = await client.deploy('RatioOracle', [[oracle.target, oracle.callData], 18], {
          chainId,
          minTxConfirmations: config.minTxConfirmations,
        });
        break;
      default:
        throw Error('Oracle type unrecognized');
    }

    oracles[oracle.name] = oracleReceipt;
    result.push([`${oracle.name} Oracle`, oracleReceipt?.contractAddress, oracleReceipt?.hash]);
  }
  return oracles;
}

/**
 * The types of receipts that can be returned by the deployInfra function.
 *
 * @type {
 *   'registryReceipt' | 'proxyAdminReceipt' | 'flashLenderReceipt'
 * }
 */
type receiptKeyNames = 'registryReceipt' | 'proxyAdminReceipt' | 'flashLenderReceipt';

/**
 * Deploys the infrastructure contracts for a vault.
 *
 * This function deploys the registry, proxy admin, and other necessary contracts for a vault.
 * It also registers the necessary services and addresses in the registry.
 *
 * @param app The application instance used for deployment.
 * @param config The network configuration.
 * @param strategy The strategy implementation to deploy.
 * @param loanMarket The AAVE v3 market to use.
 * @param spinner The spinner to display deployment progress.
 * @param result The array to store deployment results.
 * @returns An object containing the receipts for the registry and proxy admin.
 */
async function deployInfra(
  app: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  strategy: StrategyImplementation,
  loanMarket: AAVEv3MarketNames,
  reuseOracles: boolean,
  spinner: ora.Ora,
  result: any[],
): Promise<{
  receipts: {
    [key in receiptKeyNames]: TransactionReceipt | null;
  };
  oracles: { [key: string]: string };
}> {
  // Service Registry
  const registryReceipt = await deployRegistry(app, config, spinner, result);
  // Proxy Admin
  const proxyAdminReceipt = await deployProxyAdmin(app, config, registryReceipt, spinner, result);
  // Registering Uniswap Router 02
  await registerName(
    app,
    config,
    registryReceipt,
    'Uniswap Router',
    config.uniswapRouter02,
    spinner,
    result,
  );
  // Registering Pyth
  await registerName(app, config, registryReceipt, 'Pyth', config.pyth, spinner, result);
  switch (strategy) {
    case StrategyImplementation.AAVE_V3_WSTETH_ETH:
    case StrategyImplementation.AAVE_V3_WSTETH_ETH_LIDO:
      const aaveMarketAddress = config.aavev3?.[loanMarket] ?? '';
      await registerName(
        app,
        config,
        registryReceipt,
        'AAVEv3',
        aaveMarketAddress,
        spinner,
        result,
      );
      break;
    case StrategyImplementation.MORPHO_BLUE_WSTETH_ETH:
      const morphoMarketAddress = config.morpho ?? '';
      await registerName(
        app,
        config,
        registryReceipt,
        'Morpho Blue',
        morphoMarketAddress,
        spinner,
        result,
      );
      break;
  }
  // Register Balancer Vault
  await registerName(
    app,
    config,
    registryReceipt,
    'Balancer Vault',
    config.balancerVault,
    spinner,
    result,
  );
  // Flash Lender Adapter
  const flashLenderReceipt = await deployFlashLender(app, config, registryReceipt, spinner, result);
  let oracles;
  // Deploy Oracles
  if (!reuseOracles) {
    oracles = await deployOracles(
      app,
      chainId ?? 0,
      config,
      registryReceipt?.contractAddress ?? '',
      spinner,
      result,
    );
  } else {
    oracles = config.oracles.reduce((acc, oracle) => {
      acc[oracle.name] = oracle.address;
      return acc;
    }, {});
  }
  return {
    receipts: {
      registryReceipt,
      proxyAdminReceipt,
      flashLenderReceipt,
    },
    oracles,
  };
}

/**
 * Deploys the Flash Lender contract and registers it in the Vault Registry.
 *
 * This function deploys the Flash Lender contract and registers it in the Vault Registry.
 * It also logs the deployment process and results to the console.
 *
 * @param app The application instance used for deployment.
 * @param config The network configuration.
 * @param registryReceipt The transaction receipt of the registry contract deployment.
 * @param spinner The spinner to display deployment progress.
 * @param result The array to store deployment results.
 */
async function deployFlashLender(
  app: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  registryReceipt: TransactionReceipt | null,
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = 'Deploying Flash Lender Contract ...';
  const flashLenderReceipt = await app.deploy('BalancerFlashLender', [config.balancerVault], {
    chainId,
    minTxConfirmations: config.minTxConfirmations,
  });
  await app.send(
    'VaultRegistry',
    registryReceipt?.contractAddress ?? '',
    'registerService',
    [ethers.keccak256(Buffer.from('FlashLender')), flashLenderReceipt?.contractAddress],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );

  result.push(['Flash Lender', flashLenderReceipt?.contractAddress, flashLenderReceipt?.hash]);
  return flashLenderReceipt;
}

/**
 * Registers a service in the Vault Registry.
 *
 * This function registers a service in the Vault Registry by sending a transaction
 * to the VaultRegistry contract. It also logs the registration process and results to the console.
 *
 * @param app The application instance used for registration.
 * @param config The network configuration.
 * @param registryReceipt The transaction receipt of the registry contract deployment.
 * @param name The name of the service to register.
 * @param address The address of the service to register.
 * @param spinner The spinner to display registration progress.
 * @param result The array to store registration results.
 */
async function registerName(
  app: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  registryReceipt: TransactionReceipt | null,
  name: string,
  address: string,
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = `Registiring ${name} Contract `;
  const routerReceipt = await app.send(
    'VaultRegistry',
    registryReceipt?.contractAddress ?? '',
    'registerService',
    [ethers.keccak256(Buffer.from(name)), address],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );
  result.push([name, address, routerReceipt?.hash]);
}

/**
 * Deploys the ProxyAdmin contract and registers it in the Vault Registry.
 *
 * This function deploys the ProxyAdmin contract and registers it in the Vault Registry.
 * It also logs the deployment process and results to the console.
 *
 * @param app The application instance used for deployment.
 * @param config The network configuration.
 * @param registryReceipt The transaction receipt of the registry contract deployment.
 * @param spinner The spinner to display deployment progress.
 * @param result The array to store deployment results.
 * @returns The transaction receipt of the ProxyAdmin contract deployment.
 */
async function deployProxyAdmin(
  app: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  registryReceipt: TransactionReceipt | null,
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = 'Deploying ProxyAdmin Contract ...';
  const proxyAdminReceipt = await app.deploy('BakerFiProxyAdmin', [app.getAddress()], {
    chainId,
    minTxConfirmations: config.minTxConfirmations,
  });
  result.push(['Proxy Admin', proxyAdminReceipt?.contractAddress, proxyAdminReceipt?.hash]);

  await app.send(
    'VaultRegistry',
    registryReceipt?.contractAddress ?? '',
    'registerService',
    [ethers.keccak256(Buffer.from('BakerFiProxyAdmin')), proxyAdminReceipt?.contractAddress],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );
  return proxyAdminReceipt;
}
/**
 * Deploys the VaultRegistry contract and registers it in the Vault Registry.
 *
 * This function deploys the VaultRegistry contract and registers it in the Vault Registry.
 * It also logs the deployment process and results to the console.
 *
 * @param app The application instance used for deployment.
 * @param config The network configuration.
 * @param spinner The spinner to display deployment progress.
 * @param result The array to store deployment results.
 * @returns The transaction receipt of the VaultRegistry contract deployment.
 */
async function deployRegistry(
  app: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = 'Deploying Registry';
  const registryReceipt = await app.deploy(
    'VaultRegistry',
    // Owner
    [app.getAddress()],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );
  await registerName(
    app,
    config,
    registryReceipt,
    'VaultRegistry',
    registryReceipt?.contractAddress ?? '',
    spinner,
    result,
  );
  return registryReceipt;
}
