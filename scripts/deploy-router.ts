import 'dotenv/config';
import hre from 'hardhat';
import ora from 'ora';
import { ethers } from 'hardhat';
import { ContractClientWallet } from './lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../constants/test-accounts';
import { ContractClientLedger } from './lib/contract-client-ledger';
import ContractTree from '../src/contract-blob.json';
import NetworkDeployConfig from '../constants/network-deploy-config';
import Contracts from '../constants/contracts';
import { deployProxyContract } from './common';

type ProxyContracts = keyof typeof ContractTree;

/**
 * Deploys the Vault Router contract behind a proxy and configures it to allow whitelisted vaults to
 * pull from it and Uniswap to pull funds to.
 *
 * This function orchestrates the deployment of the Vault Router contract, which acts as a central proxy
 * for managing vault operations.
 * It ensures that only whitelisted vaults can interact with the Vault Router, enabling them to pull funds as needed.
 * Additionally, it sets up Uniswap to pull funds to the Vault Router, facilitating liquidity.
 *
 * The deployment process involves the following steps:
 * 1. Setting up the environment, including the network configuration and the client wallet or ledger.
 * 2. Deploying the Vault Router contract behind a proxy, using the `deployProxyContract` function.
 * 3. Configuring the Vault Router to allow whitelisted vaults to pull from it, by setting up the necessary permissions and access controls.
 * 4. Setting up Uniswap to pull funds to the Vault Router, enabling liquidity for the vault operations.
 *
 * This function is designed to be executed in a Hardhat environment, utilizing the `hardhat` and `ethers` libraries for Ethereum network interactions.
 *
 * @returns {Promise<void>} A promise that resolves when the deployment process is complete.
 */
async function main() {
  try {
    const networkName = hre.network.name;
    const chainId = BigInt(hre.network.config.chainId ?? 0n);
    const app = await setupClientApp();
    const result = [];
    const spinner = ora('Cooking ....').start();
    await deployAndConfigureVaultRouter(app, chainId, networkName, spinner, result);
    spinner.succeed('VaultRouter is served ...');
    console.table(result);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

/**
 * Sets up the client application for interacting with the Ethereum network.
 *
 * This function initializes a client application instance based on the deployment mode specified in the environment variables.
 * If `DEPLOY_WITH_LEDGER` is set to `true`, it creates a `ContractClientLedger` instance for ledger-based deployments.
 * Otherwise, it creates a `ContractClientWallet` instance using the first private key from `STAGING_ACCOUNTS_PKEYS`.
 *
 * After creating the client application instance, it initializes the instance and returns it.
 *
 * @returns {Promise<ContractClient>} A promise that resolves to the initialized client application instance.
 */
async function setupClientApp() {
  let app;
  const [signerPKey] = STAGING_ACCOUNTS_PKEYS;
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

/**
 * Deploys and configures the Vault Router contract on a specified network.
 *
 * This function orchestrates the deployment of the Vault Router contract, which acts as a central hub
 * for managing vault operations. It ensures that only whitelisted vaults can interact with the Vault Router,
 * enabling them to pull funds as needed. Additionally, it sets up Uniswap to pull funds to the Vault Router,
 * facilitating liquidity.
 *
 * The deployment process involves the following steps:
 * 1. Setting up the environment, including the network configuration and the client wallet or ledger.
 * 2. Deploying the Vault Router contract behind a proxy, using the `deployProxyContract` function.
 * 3. Configuring the Vault Router to allow whitelisted vaults to pull from it, by setting up the necessary permissions and access controls.
 * 4. Setting up Uniswap to pull funds to the Vault Router, enabling liquidity for the vault operations.
 *
 * This function is designed to be executed in a Hardhat environment, utilizing the `hardhat` and `ethers` libraries for Ethereum network interactions.
 *
 * @param {ContractClient} app - The client application instance for interacting with the Ethereum network.
 * @param {BigInt} chainId - The chain ID of the network on which the deployment is taking place.
 * @param {String} networkName - The name of the network on which the deployment is taking place.
 * @param {Ora} spinner - The spinner instance for logging progress.
 * @param {Array} result - An array to store the deployment results.
 */
async function deployAndConfigureVaultRouter(app, chainId, networkName, spinner, result) {
  const config = NetworkDeployConfig[networkName];
  const networkContracts = Contracts[networkName];
  result.push(['Network Name', networkName]);
  result.push(['Network Id', chainId]);
  result.push(['Owner', app.getAddress()]);

  const proxyAdminReceipt = await app.deploy('BakerFiProxyAdmin', [app.getAddress()], {
    chainId,
    minTxConfirmations: config.minTxConfirmations,
  });

  result.push(['Proxy Admin', proxyAdminReceipt?.contractAddress, proxyAdminReceipt?.hash]);

  const vaultRouterAddress = await deployProxyContract(
    chainId,
    app,
    config,
    'VaultRouter',
    'VaultRouter',
    proxyAdminReceipt?.contractAddress,
    null,
    [app.getAddress(), config.uniswapRouter02, config.weth],
    spinner,
    result,
  );
  const pRouter = await ethers.getContractAt('VaultRouter', vaultRouterAddress ?? '');
  for (const strategy of Object.keys(networkContracts)) {
    const strategyContract = networkContracts[strategy];
    await configureVaultRouterForStrategy(pRouter, strategyContract, config, spinner, result);
  }
}
/**
 * Configures the Vault Router for a specific strategy by approving tokens for vault and swap operations.
 *
 * @param {Contract} pRouter - The Vault Router contract instance.
 * @param {Object} strategyContract - The strategy contract object containing vaultProxy information.
 * @param {Object} config - The network configuration object containing token addresses.
 * @param {Ora} spinner - The spinner instance for logging progress.
 */
async function configureVaultRouterForStrategy(pRouter, strategyContract, config, spinner, result) {
  // Approve WETH for vault operations
  spinner.text = `Approving WETH to be pulled from router ${await pRouter.getAddress()} to vault ${
    strategyContract.vaultProxy
  }`;
  await pRouter.approveTokenForVault(strategyContract.vaultProxy, config.weth);
  result.push(['Approved Token For Vault', strategyContract.vaultProxy, config.weth]);
  // Approve wstETH for vault operations
  spinner.text = `Approving wstETH to be pulled from router ${await pRouter.getAddress()} to vault ${
    strategyContract.vaultProxy
  }`;
  await pRouter.approveTokenForVault(strategyContract.vaultProxy, config.wstETH);
  result.push(['Approved Token For Vault', strategyContract.vaultProxy, config.wstETH]);

  // Approve WETH for swap operations
  spinner.text = `Approving WETH to be swapped by UniswapV3 router ${await pRouter.getAddress()}`;
  await pRouter.approveTokenToSwap(config.weth);
  result.push(['Approved Permissions to UniswapV3 router', config.weth, '']);

  // Approve wstETH for swap operations
  spinner.text = `Approving wstETH to be swapped by UniswapV3 router ${await pRouter.getAddress()}`;
  await pRouter.approveTokenToSwap(config.wstETH);
  result.push(['Approved Permissions to UniswapV3 router', config.wstETH, '']);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
