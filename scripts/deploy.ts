import 'dotenv/config';
import hre from 'hardhat';
import { ethers } from 'hardhat';
import BaseConfig, { NetworkConfig, OracleRegistryNames } from '../constants/network-deploy-config';
import ora from 'ora';
import { ContractClientWallet } from './lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../constants/test-accounts';
import { ContractClient } from './lib/contract-client';
import { ContractClientLedger } from './lib/contract-client-ledger';
import ContractTree from '../src/contract-blob.json';
import { TransactionReceipt } from 'ethers';
import { PythFeedNameEnum, feedIds } from '../constants/pyth';

const networkName = hre.network.name;
const chainId = BigInt(hre.network.config.chainId ?? 0n);

type ProxyContracts = keyof typeof ContractTree;

type RegistryNames =
  | 'FlashLender'
  | 'StrategyAAVEv3'
  | 'WETH'
  | 'stETH'
  | 'wstETH'
  | 'wstETH/USD Oracle'
  | 'cbETH/USD Oracle'
  | 'ETH/USD Oracle'
  | 'Strategy'
  | 'Pyth'
  | 'Settings'
  | 'Vault';

/****************************************
 *
 * Deploy BakerFi Vaults and support Ledger Support
 *
 ****************************************/
async function main() {
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
  const config: NetworkConfig = BaseConfig[networkName];

  //////////////////////////////////////////
  // Deploy Settings, ProxyAdmin, Registry,....
  //////////////////////////////////////////
  const { registryReceipt, proxyAdminReceipt } = await deployInfra(app, config, spinner, result);

  ////////////////////////////////////
  // Deploy Strategy
  ////////////////////////////////////
  const strategyAddress = await deployProxyContract(
    app,
    'StrategyAAVEv3',
    'StrategyAAVEv3',
    proxyAdminReceipt?.contractAddress,
    registryReceipt?.contractAddress,
    [
      app.getAddress(),
      app.getAddress(),
      registryReceipt?.contractAddress,
      ethers.keccak256(Buffer.from(config.strategy.collateral)),
      ethers.keccak256(Buffer.from(config.strategy.oracle)),
      config.swapFeeTier,
      config.AAVEEModeCategory,
    ],
    spinner,
    result,
  );
  ////////////////////////////////////
  // Deploy Vault
  ////////////////////////////////////
  const vaultAdress = await deployProxyContract(
    app,
    'Vault',
    'Vault',
    proxyAdminReceipt?.contractAddress,
    registryReceipt?.contractAddress,
    [
      app.getAddress(),
      config.vaultSharesName,
      config.vaultSharesSymbol,
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
    'StrategyAAVEv3',
    strategyAddress ?? '',
    'transferOwnership',
    [vaultAdress],
    {
      chainId,
    },
  );
  result.push(['Strategy Owner', vaultAdress, changeOwnerReceipt?.hash]);

  spinner.text = 'Changing LTV ...';
  const ltvChangeReceipt = await app.send(
    'StrategyAAVEv3',
    strategyAddress ?? '',
    'setLoanToValue',
    [ethers.parseUnits('800', 6)],
    {
      chainId,
    },
  );
  result.push(['Strategy LTV', ethers.parseUnits('800', 6), ltvChangeReceipt?.hash]);

  spinner.succeed('🧑‍🍳 BakerFi Served 🍰 ');
  console.table(result);
  process.exit(0);
}

async function deployOracles(
  client: ContractClient<typeof ContractTree>,
  chainId: bigint,
  config,
  registryAddress: string,
  spinner,
  result,
) {
  for (const oracle of config.oracles) {
    spinner.text = `Deploying ${oracle.pair} Oracle`;
    let feedId;
    let oracleName: OracleRegistryNames | null = null;
    switch (oracle.pair) {
      case 'cbETH/USD':
        feedId = feedIds[PythFeedNameEnum.CBETH_USD];
        oracleName = 'cbETH/USD Oracle';
        break;
      case 'wstETH/USD':
        feedId = feedIds[PythFeedNameEnum.WSTETH_USD];
        oracleName = 'wstETH/USD Oracle';
        break;
      case 'ETH/USD':
        feedId = feedIds[PythFeedNameEnum.ETH_USD];
        oracleName = 'ETH/USD Oracle';
        break;
      default:
        throw Error('Unknow Oracle type');
    }
    const oracleReceipt = await client.deploy('PythOracle', [feedId, config.pyth], {
      chainId,
    });
    spinner.text = `Registering ${oracle.pair} Oracle`;
    await client.send(
      'ServiceRegistry',
      registryAddress,
      'registerService',
      [ethers.keccak256(Buffer.from(oracleName)), oracleReceipt?.contractAddress],
      {
        chainId,
      },
    );
    result.push([`${oracle.pair} Oracle`, oracleReceipt?.contractAddress, oracleReceipt?.hash]);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

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
  instanceName: ProxyContracts,
  registerName: RegistryNames,
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
  spinner: ora.Ora,
  result: any[],
): Promise<{
  [key in receiptKeyNames]: TransactionReceipt | null;
}> {
  ////////////////////////////////////
  // Service Registry
  ////////////////////////////////////
  const registryReceipt = await deployRegistry(app, spinner, result);
  ////////////////////////////////////
  // Proxy Admin
  ////////////////////////////////////
  const proxyAdminReceipt = await deployProxyAdmin(app, registryReceipt, spinner, result);
  ////////////////////////////////////
  // Registering WETH Address
  ////////////////////////////////////
  await registerName(app, config, registryReceipt, 'WETH', config.weth, spinner, result);
  ////////////////////////////////////
  // Deploy Global Settings
  ////////////////////////////////////
  await deployProxyContract(
    app,
    'Settings',
    'Settings',
    proxyAdminReceipt?.contractAddress,
    registryReceipt?.contractAddress,
    [app.getAddress()],
    spinner,
    result,
  );
  ////////////////////////////////////
  // Registering Uniswap Router 02
  ////////////////////////////////////
  await registerName(
    app,
    config,
    registryReceipt,
    'Uniswap Router',
    config.uniswapRouter02,
    spinner,
    result,
  );
  ////////////////////////////////////
  // Registering Uniswap Quoter
  ////////////////////////////////////
  await registerName(
    app,
    config,
    registryReceipt,
    'Uniswap Quoter',
    config.uniswapQuoter,
    spinner,
    result,
  );
  ////////////////////////////////////
  //  8. AAVE Vault
  ////////////////////////////////////
  await registerName(app, config, registryReceipt, 'AAVE_V3', config.AAVEPool, spinner, result);
  ////////////////////////////////////
  // 9. Register Balancer Vault
  ////////////////////////////////////
  await registerName(
    app,
    config,
    registryReceipt,
    'Balancer Vault',
    config.balancerVault,
    spinner,
    result,
  );
  ////////////////////////////////////
  // 10. Flash Lender Adapter
  ////////////////////////////////////
  await deployFlashLender(app, registryReceipt, spinner, result);
  ////////////////////////////////////
  // 11. Wrapped stETH
  ////////////////////////////////////
  if (config.wstETH) {
    await registerName(app, config, registryReceipt, 'wstETH', config.wstETH, spinner, result);
  }
  ////////////////////////////////////
  // 12. Oracles
  ////////////////////////////////////
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
    },
  );
  await app.send(
    'ServiceRegistry',
    registryReceipt?.contractAddress ?? '',
    'registerService',
    [ethers.keccak256(Buffer.from('FlashLender')), flashLenderReceipt?.contractAddress],
    {
      chainId,
    },
  );

  result.push(['Flash Lender', flashLenderReceipt?.contractAddress, flashLenderReceipt?.hash]);
}

async function registerUniswapQuoter(
  app: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  registryReceipt: TransactionReceipt | null,
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = `Registiring Uniswap Quoter Contract ${config.uniswapRouter02}`;
  const quoterReceipt = await app.send(
    'ServiceRegistry',
    registryReceipt?.contractAddress ?? '',
    'registerService',
    [ethers.keccak256(Buffer.from('Uniswap Quoter')), config.uniswapQuoter],
    {
      chainId,
    },
  );
  result.push(['Uniswap Quoter', config.uniswapQuoter, quoterReceipt?.hash]);
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
    },
  );
  result.push([name, config.uniswapRouter02, routerReceipt?.hash]);
}

async function deployProxyAdmin(
  app: ContractClient<typeof ContractTree>,
  registryReceipt: TransactionReceipt | null,
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = 'Deploying ProxyAdmin Contract ...';
  const proxyAdminReceipt = await app.deploy('BakerFiProxyAdmin', [app.getAddress()], {
    chainId,
  });
  result.push(['Proxy Admin', proxyAdminReceipt?.contractAddress, proxyAdminReceipt?.hash]);
  await app.send(
    'ServiceRegistry',
    registryReceipt?.contractAddress ?? '',
    'registerService',
    [ethers.keccak256(Buffer.from('BakerFiProxyAdmin')), proxyAdminReceipt?.contractAddress],
    {
      chainId,
    },
  );
  return proxyAdminReceipt;
}

async function deployRegistry(
  app: ContractClient<typeof ContractTree>,
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
    },
  );
  result.push(['ServiceRegistry', registryReceipt?.contractAddress, registryReceipt?.hash]);
  await app.send(
    'ServiceRegistry',
    registryReceipt?.contractAddress ?? '',
    'registerService',
    [ethers.keccak256(Buffer.from('Registry')), registryReceipt?.contractAddress],
    {
      chainId,
    },
  );
  return registryReceipt;
}
