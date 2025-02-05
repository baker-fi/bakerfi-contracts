import 'dotenv/config';
import hre, { network } from 'hardhat';
import ora from 'ora';
import { ethers } from 'hardhat';
import { ContractClientWallet } from './lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../constants/test-accounts';
import { ContractClientLedger } from './lib/contract-client-ledger';
import ContractTree from '../src/contract-blob.json';

/**
 * Main function to deploy $BKR Token
 */
async function main() {
  try {
    const networkName = hre.network.name;
    const chainId = BigInt(hre.network.config.chainId ?? 0n);
    const app = await setupClientApp();
    const result: any[] = [];
    const spinner = ora('Cooking ....').start();

    result.push(['Network Name', networkName]);
    result.push(['Network Id', chainId]);

    spinner.text = 'Deploying BKR...';
    const bkrTxReceipt = await app.deploy('BKR', [app.getAddress()], {
      chainId,
      minTxConfirmations: 0,
    });

    const contractAddress = bkrTxReceipt?.contractAddress;

    spinner.text = 'Verifying BKR...';

    await hre.run('verify:verify', {
      address: contractAddress,
      constructorArguments: [app.getAddress()],
    });

    spinner.text = 'Getting Owner Balance...';
    const balance = await app?.call('BKR', contractAddress, 'balanceOf', [app.getAddress()], {
      chainId: network.config.chainId,
    });

    result.push(['BKR', contractAddress]);
    result.push(['BKR Owner', app.getAddress()]);
    result.push(['BKR Owner Balance', balance]);

    spinner.succeed('BKR is served ... 🧑‍🍳');
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

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
