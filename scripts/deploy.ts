import 'dotenv/config';
import hre from 'hardhat';
import { ethers } from 'hardhat';
import BaseConfig from '../constants/network-deploy-config';

import { AAVEv3MarketNames, NetworkConfig, StrategyImplementation } from '../constants/types';
import ora from 'ora';
import { ContractClientWallet } from './lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../constants/test-accounts';
import { ContractClient } from './lib/contract-client';
import { ContractClientLedger } from './lib/contract-client-ledger';
import ContractTree from '../src/contract-blob.json';
import { TransactionReceipt } from 'ethers';

const networkName = hre.network.name;
const chainId = BigInt(hre.network.config.chainId ?? 0n);

type ProxyContracts = keyof typeof ContractTree;

/**
 * Run this Hardhat script to deploy BakerFi contracts
 *
 * Usage:
 *  STRATEGY="<strategy_type>" AAVE_MARKET="<aavev3_market>" npx hardhat run --network <network_name> scripts/deploy.ts
 * Parameters:
 * - <network_name>: The network to deploy to (e.g., mainnet, goerli, sepolia)
 * - <strategy_type>: (Optional) The type of strategy to deploy. Defaults to AAVE_V3_WSTETH_ETH if not provided.
 * - <aavev3_market>: (Optional) The AAVE v3 market to use. Defaults to AAVE_V3 if not provided.
 *
 * Examples:
 * npx hardhat --network ethereum run scripts/deploy.ts
 * npx hardhat --network base run scripts/deploy.ts
 * STRATEGY="wstETH/ETH" AAVE_MARKET="AAVEv3 Lido Market" npx hardhat --network ethereum run scripts/deploy.ts
 * STRATEGY="Morpho Blue wstETH/ETH" npx hardhat --network ethereum run scripts/deploy.ts
 *
 * Note: Make sure to set up your .env file with the necessary environment variables before running this script.
 */

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export const RegistryNames = [
  'FlashLender',
  'Settings',
  'Pyth',
  'DeploymentRegistry',
  'Uniswap Router',
  'WETH',
  'stETH',
  'wstETH',
  'AAVEv3',
  'Balancer Vault',
  'wstETH',
  'wstETH/USD Oracle',
  'cbETH/USD Oracle',
  'ETH/USD Oracle',
  'ChainLinkExRateOracle',
  'CustomExRateOracle',
  'BakerFiProxyAdmin',
  'Pyth',
  `${StrategyImplementation.AAVE_V3_WSTETH_ETH} Strategy`,
  `${StrategyImplementation.AAVE_V3_WSTETH_ETH} Vault`,
  `${StrategyImplementation.MORPHO_BLUE_WSTETH_ETH} Strategy`,
  `${StrategyImplementation.MORPHO_BLUE_WSTETH_ETH} Vault`,
];

type RegistryName = (typeof RegistryNames)[number];
/****************************************
 *
 * Deploy BakerFi Vaults and support Ledger Support
 *
 ****************************************/
async function main() {
  // Environment Parameters Section
  const strategy = (process.env.STRATEGY ||
    StrategyImplementation.AAVE_V3_WSTETH_ETH) as StrategyImplementation;
  const loanMarket = (process.env.AAVE_MARKET || AAVEv3MarketNames.AAVE_V3) as AAVEv3MarketNames;

  const [signerPKey] = STAGING_ACCOUNTS_PKEYS;
  let app;
  const result: any[] = [];
  const spinner = ora('Cooking ....').start();
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
  result.push(['Network Name', networkName]);
  result.push(['Network Id', chainId]);
  result.push(['Owner', app.getAddress()]);
  const config: NetworkConfig = BaseConfig[networkName];

  try {
    // Deploy Settings, ProxyAdmin, Registry,....
    const { registryReceipt, proxyAdminReceipt } = await deployInfra(
      app,
      config,
      strategy,
      loanMarket,
      spinner,
      result,
    );

    // Deploy Strategy
    let strategyAddress;
    let strategyConfig;
    let strategyContract;
    switch (strategy) {
      case StrategyImplementation.AAVE_V3_WSTETH_ETH:
      case StrategyImplementation.AAVE_V3_WSTETH_ETH_LIDO:
        strategyConfig = config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH];
        strategyContract = 'StrategyLeverageAAVEv3';
        strategyAddress = await deployProxyContract(
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
            ethers.keccak256(Buffer.from(strategyConfig.collateralToken)),
            ethers.keccak256(Buffer.from(strategyConfig.debtToken)),
            ethers.keccak256(Buffer.from(strategyConfig.collateralOracle)),
            ethers.keccak256(Buffer.from(strategyConfig.debtOracle)),
            strategyConfig.swapFeeTier,
            strategyConfig.AAVEEModeCategory,
          ],
          spinner,
          result,
        );
        break;
      case StrategyImplementation.MORPHO_BLUE_WSTETH_ETH:
        strategyConfig = config.markets[StrategyImplementation.MORPHO_BLUE_WSTETH_ETH];
        strategyContract = 'StrategyLeverageMorphoBlue';
        strategyAddress = await deployProxyContract(
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
            [
              ethers.keccak256(Buffer.from(strategyConfig.collateralToken)),
              ethers.keccak256(Buffer.from(strategyConfig.debtToken)),
              ethers.keccak256(Buffer.from(strategyConfig.collateralOracle)),
              ethers.keccak256(Buffer.from(strategyConfig.debtOracle)),
              strategyConfig.swapFeeTier,
              strategyConfig.oracle,
              strategyConfig.irm,
              strategyConfig.lltv,
            ],
          ],
          spinner,
          result,
        );
        break;
      default:
        throw Error('Unrecognized strategy;');
    }

    ////////////////////////////////////
    // Deploy Vault
    ////////////////////////////////////
    const vaultAdress = await deployProxyContract(
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
      ],
      spinner,
      result,
    );
    ////////////////////////////////////
    // Update the Strategy Default Settings
    ////////////////////////////////////
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
    spinner.succeed('🧑‍🍳 BakerFi Served 🍰 ');
    console.table(result);
    console.log('Deployment Registry:');
    const registerDump: any[] = [];
    for (const registerName of RegistryNames) {
      const address = await app.call(
        'ServiceRegistry',
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
  } catch (error) {
    console.table(result);
    console.error(error);
    process.exit(1);
  }
  console.table(result);
  process.exit(0);
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
      default:
        throw Error('Oracle type unrecognized');
    }

    oracles[oracle.name] = oracleReceipt;
    spinner.text = `Registering ${oracle.name} Oracle`;
    await client.send(
      'ServiceRegistry',
      registryAddress,
      'registerService',
      [ethers.keccak256(Buffer.from(oracle.name)), oracleReceipt?.contractAddress],
      {
        chainId,
        minTxConfirmations: config.minTxConfirmations,
      },
    );
    result.push([`${oracle.name} Oracle`, oracleReceipt?.contractAddress, oracleReceipt?.hash]);
  }
}

/**
 *
 * @param spinner
 * @param ethApp
 * @param ledgerPath
 * @param proxyAdminAddress
 * @param owner
 * @param result
 * @returns
 */
async function deployProxyContract(
  client: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  instanceName: ProxyContracts,
  registerName: RegistryName,
  proxyAdminAddress: string | null | undefined,
  registryContractAddress: string | null | undefined,
  args: any[],
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = `Deploying ${instanceName}`;
  const instanceReceipt = await client.deploy(
    instanceName,
    [],
    // Tx Options
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );
  const contractFactory = await ethers.getContractFactory(instanceName);
  spinner.text = `Deploying ${instanceName} Proxy`;
  const proxyReceipt = await client.deploy(
    'BakerFiProxy',
    [
      instanceReceipt?.contractAddress,
      proxyAdminAddress,
      contractFactory.interface.encodeFunctionData('initialize', args),
    ],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );

  spinner.text = `Registering ${instanceName} Proxy Address`;
  await client.send(
    'ServiceRegistry',
    registryContractAddress ?? '',
    'registerService',
    [ethers.keccak256(Buffer.from(registerName)), proxyReceipt?.contractAddress],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );
  result.push([instanceName, instanceReceipt?.contractAddress, instanceReceipt?.hash]);
  result.push([`${instanceName} Proxy`, proxyReceipt?.contractAddress, proxyReceipt?.hash]);

  return proxyReceipt?.contractAddress;
}

type receiptKeyNames = 'registryReceipt' | 'proxyAdminReceipt';

async function deployInfra(
  app: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  strategy: StrategyImplementation,
  loanMarket: AAVEv3MarketNames,
  spinner: ora.Ora,
  result: any[],
): Promise<{
  [key in receiptKeyNames]: TransactionReceipt | null;
}> {
  // Service Registry
  const registryReceipt = await deployRegistry(app, config, spinner, result);
  // Proxy Admin
  const proxyAdminReceipt = await deployProxyAdmin(app, config, registryReceipt, spinner, result);
  // Registering WETH Address
  await registerName(app, config, registryReceipt, 'WETH', config.weth, spinner, result);
  // Deploy Global Settings
  await deployProxyContract(
    app,
    config,
    'Settings',
    'Settings',
    proxyAdminReceipt?.contractAddress,
    registryReceipt?.contractAddress,
    [app.getAddress()],
    spinner,
    result,
  );
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
  await deployFlashLender(app, config, registryReceipt, spinner, result);

  // Wrapped stETH
  if (config.wstETH) {
    await registerName(app, config, registryReceipt, 'wstETH', config.wstETH, spinner, result);
  }
  // Deploy Oracles
  await deployOracles(
    app,
    chainId ?? 0,
    config,
    registryReceipt?.contractAddress ?? '',
    spinner,
    result,
  );
  return {
    registryReceipt,
    proxyAdminReceipt,
  };
}

async function deployFlashLender(
  app: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  registryReceipt: TransactionReceipt | null,
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = 'Deploying Flash Lender Contract ...';
  const flashLenderReceipt = await app.deploy(
    'BalancerFlashLender',
    [registryReceipt?.contractAddress ?? ''],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );
  await app.send(
    'ServiceRegistry',
    registryReceipt?.contractAddress ?? '',
    'registerService',
    [ethers.keccak256(Buffer.from('FlashLender')), flashLenderReceipt?.contractAddress],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );

  result.push(['Flash Lender', flashLenderReceipt?.contractAddress, flashLenderReceipt?.hash]);
}

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
    'ServiceRegistry',
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
    'ServiceRegistry',
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

async function deployRegistry(
  app: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = 'Deploying Registry';
  const registryReceipt = await app.deploy(
    'ServiceRegistry',
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
    'DeploymentRegistry',
    registryReceipt?.contractAddress ?? '',
    spinner,
    result,
  );
  return registryReceipt;
}
