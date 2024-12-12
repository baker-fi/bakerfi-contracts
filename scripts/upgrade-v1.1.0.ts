import 'dotenv/config';
import hre from 'hardhat';
import { ethers } from 'hardhat';
import ora from 'ora';
import { ContractClientWallet } from './lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../constants/test-accounts';
import { ContractClientLedger } from './lib/contract-client-ledger';
import ContractTree from '../src/contract-blob.json';
import DeployConfig from '../constants/contracts';
import { StrategyImplementation } from '../constants/types';

const networkName = hre.network.name;
const chainId = BigInt(hre.network.config.chainId ?? 0n);

async function main() {
  let app;
  const [signerPKey] = STAGING_ACCOUNTS_PKEYS;
  const networkConfig = DeployConfig[networkName];
  const result: any[] = [];
  const MIN_CONFIRMATIONS = 0;
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

  spinner.text = `Deploying new  Strategy Contract`;

  const stratReceipt = await app?.deploy('StrategyLeverageAAVEv3', [], {
    chainId: BigInt(hre.network.config.chainId ?? 0),
    minTxConfirmations: MIN_CONFIRMATIONS,
  });

  spinner.text = `Upgrading Strategy Contract on Proxy`;

  await app?.send(
    'BakerFiProxyAdmin',
    networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.proxyAdmin ?? '',
    'upgrade',
    [
      networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.strategyProxy,
      stratReceipt.contractAddress,
    ],
    {
      chainId: BigInt(hre.network.config.chainId ?? 0),
      minTxConfirmations: MIN_CONFIRMATIONS,
    },
  );

  result.push(['Strategy Instance', stratReceipt.contractAddress]);

  // 3. Deploying Vault Instance
  spinner.text = `Deploying new  Vault Contract`;

  const vaultReceipt = await app?.deploy('Vault', [], {
    chainId: BigInt(hre.network.config.chainId ?? 0),
    minTxConfirmations: MIN_CONFIRMATIONS,
  });

  spinner.text = `Upgrading Vault Contract on Proxy`;
  const contractFactory = await ethers.getContractFactory('Vault');
  await app?.send(
    'BakerFiProxyAdmin',
    networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.proxyAdmin ?? '',
    'upgradeAndCall',
    [
      networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.vaultProxy,
      vaultReceipt?.contractAddress,
      contractFactory.interface.encodeFunctionData('initializeV2', [
        networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.serviceRegistry,
      ]),
    ],
    {
      chainId: BigInt(hre.network.config.chainId ?? 0),
      minTxConfirmations: MIN_CONFIRMATIONS,
    },
  );
  result.push(['Vault Instance', vaultReceipt?.contractAddress]);

  spinner.text = `Setting Collarateral Oracle`;
  // Upgrade ETH/USD and WSTETH/USD ORacles
  await app?.send(
    'StrategyLeverageAAVEv3',
    networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.strategyProxy ?? '',
    'setCollateralOracle',
    [networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.collateralOracle],
    {
      chainId: BigInt(hre.network.config.chainId ?? 0),
      minTxConfirmations: MIN_CONFIRMATIONS,
    },
  );
  result.push([
    'Collateral Oracle',
    networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.collateralOracle,
  ]);

  spinner.text = `Setting Debt Oracle`;
  await app?.send(
    'StrategyLeverageAAVEv3',
    networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.strategyProxy ?? '',
    'setDebtOracle',
    [networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.debtOracle],
    {
      chainId: BigInt(hre.network.config.chainId ?? 0),
      minTxConfirmations: MIN_CONFIRMATIONS,
    },
  );
  result.push([
    'Debt Oracle',
    networkConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH]?.debtOracle,
  ]);
  spinner.succeed('🧑‍🍳 BakerFi Served 🍰 ');
  console.table(result);
  process.exit(0);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
