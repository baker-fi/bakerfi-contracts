import 'dotenv/config';
import hre from 'hardhat';
import { ethers } from 'hardhat';
import ora from 'ora';
import { ContractClientWallet } from './lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../constants/test-accounts';
import { ContractClientLedger } from './lib/contract-client-ledger';
import ContractTree from '../src/contract-blob.json';
import bakerFiContracts from '../constants/contracts';
import networksEnv from '../constants/network-deploy-config';

import {
  AAVEv3MarketNames,
  BakerDeployConfig,
  NetworkConfig,
  StrategyImplementation,
} from '../constants/types';

const networkName = hre.network.name;
const chainId = BigInt(hre.network.config.chainId ?? 0n);

async function main() {
  let app;
  const spinner = ora('Cooking ....').start();
  const [signerPKey] = STAGING_ACCOUNTS_PKEYS;
  const contracts = bakerFiContracts[networkName];
  const networkEnv = networksEnv[networkName];

  const MIN_CONFIRMATIONS = 0;
  const strategy = StrategyImplementation.AAVE_V3_WSTETH_ETH;

  const txOptions = {
    chainId: BigInt(hre.network.config.chainId ?? 0),
    minTxConfirmations: MIN_CONFIRMATIONS,
  };

  const result: any[] = [];

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

  const strategyConf = contracts[strategy];
  let stratReceipt;

  spinner.text = `Pausing Vault`;
  await app?.send('Vault', strategyConf?.vaultProxy ?? '', 'pause', [], txOptions);

  // Upgrade Strategy
  stratReceipt = await upgradeStrategy(
    spinner,
    stratReceipt,
    app,
    txOptions,
    result,
    strategyConf,
    networkEnv,
  );

  // Deploy Chainlink oracle
  await setOracle(spinner, app, strategyConf, networkEnv, txOptions, result);
  // Upgrade Vault
  await upgradeVault(spinner, app, txOptions, result, strategyConf, networkEnv);
  // Setting Fee Receiver
  await applySettings(spinner, app, strategyConf, txOptions, result);

  spinner.text = `Unpausing Vault`;
  await app?.send('Vault', strategyConf?.vaultProxy ?? '', 'unpause', [], txOptions);
  console.table(result);
  spinner.succeed('🧑‍🍳 BakerFi Served 🍰 ');
  process.exit(0);
}

async function applySettings(
  spinner: ora.Ora,
  app: any,
  config: BakerDeployConfig,
  txOptions: any,
  result: any[],
) {
  spinner.text = `Setting Fee Receiver`;
  const feeReceiver = '0x5B9D9E25a00A88290F35EE726490852e4DF083e3';
  await app?.send(
    'Vault',
    config?.vaultProxy ?? '',
    'setFeeReceiver',
    ['0x5B9D9E25a00A88290F35EE726490852e4DF083e3'],
    txOptions,
  );
  result.push(['Fee Receiver', feeReceiver]);
  // Setting Max Deposit
  spinner.text = `Setting Max Deposit`;
  await app?.send('Vault', config?.vaultProxy ?? '', 'setMaxDeposit', [0], txOptions);
  result.push(['setMaxDeposit', 0]);
  // Setting Performance Fee
  spinner.text = `Setting Performance Fee`;
  await app?.send('Vault', config?.vaultProxy ?? '', 'setPerformanceFee', [100000000], txOptions);
  result.push(['Performance Fee', 100000000]);
  // Setting Withdrawal Fee
  spinner.text = `Setting Withdrawal Fee`;
  await app?.send('Vault', config?.vaultProxy ?? '', 'setWithdrawalFee', [0], txOptions);
  result.push(['Withdrawal Fee', 0]);

  spinner.text = `Setting Number of Loops`;
  await app?.send(
    'StrategyLeverageAAVEv3',
    config?.strategyProxy ?? '',
    'setNrLoops',
    [20],
    txOptions,
  );
  result.push(['tNrLoops', 20]);

  spinner.text = `Setting Max Slippage`;
  await app?.send(
    'StrategyLeverageAAVEv3',
    config?.strategyProxy ?? '',
    'setMaxSlippage',
    [5000000],
    txOptions,
  );
  result.push(['Max Slippage', 5000000]);

  spinner.text = `Setting Max Loan To Value`;
  await app?.send(
    'StrategyLeverageAAVEv3',
    config?.strategyProxy ?? '',
    'setMaxLoanToValue',
    [900000000],
    txOptions,
  );
  result.push(['Max Loan To Value', 900000000]);

  spinner.text = `Setting Loan To Value`;
  await app?.send(
    'StrategyLeverageAAVEv3',
    config?.strategyProxy ?? '',
    'setLoanToValue',
    [870000000],
    txOptions,
  );
  result.push(['Loan To Value', 870000000]);

  spinner.text = `Setting Max Age`;
  await app?.send(
    'StrategyLeverageAAVEv3',
    config?.strategyProxy ?? '',
    'setPriceMaxAge',
    [3600 * 24 * 8],
    txOptions,
  );
  result.push(['Max Age', 3600 * 24 * 8]);

  spinner.text = `Setting Loan To Value`;
  await app?.send(
    'StrategyLeverageAAVEv3',
    config?.strategyProxy ?? '',
    'setPriceMaxConf',
    [0],
    txOptions,
  );
  result.push(['Max Conf', 0]);
}

async function upgradeStrategy(
  spinner: ora.Ora,
  stratReceipt: any,
  app: any,
  txOptions: any,
  result: any[],
  config: BakerDeployConfig,
  networkEnv: NetworkConfig,
) {
  spinner.text = `Deploying new StrategyLeverageAAVEv3`;
  stratReceipt = await app?.deploy('StrategyLeverageAAVEv3', [], txOptions);
  const contractFactory = await ethers.getContractFactory('StrategyLeverageAAVEv3');
  result.push(['Strategy Instance', stratReceipt.contractAddress]);
  // Upgrade the strategy contract on the proxy
  spinner.text = `Upgrading Strategy Contract on Proxy`;
  await app?.send(
    'BakerFiProxyAdmin',
    config?.proxyAdmin ?? '',
    'upgradeAndCall',
    [
      config?.strategyProxy,
      stratReceipt.contractAddress,
      contractFactory.interface.encodeFunctionData('initializeV4', [
        config.vaultProxy,
        app.getAddress(),
        config.flashLender,
        networkEnv.wstETH,
        networkEnv.weth,
        config.collateralOracle,
        networkEnv?.aavev3?.[AAVEv3MarketNames.AAVE_V3],
        1, // fromVersion
      ]),
    ],
    txOptions,
  );

  // Setting Strategy Route
  spinner.text = `Setting Strategy Route`;
  await app?.send(
    'UseUnifiedSwapper',
    config?.strategyProxy ?? '',
    'enableRoute',
    [networkEnv.weth, networkEnv.wstETH, [3, '0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5', 0, 1]],
    txOptions,
  );
  return stratReceipt;
}

async function setOracle(
  spinner: ora.Ora,
  app: any,
  networkConfig: BakerDeployConfig,
  networkEnv: NetworkConfig,
  txOptions: any,
  result: any[],
) {
  spinner.text = `Deploying new ChainLinkOracle`;
  const oracleReceipt = await app?.deploy(
    'ChainLinkOracle',
    [networkEnv?.chainlink?.wstEthToETH, 0, 0],
    txOptions,
  );

  result.push(['wstETH/ETH Oracle', oracleReceipt.contractAddress]);
  spinner.text = `Setting Strategy neew Oracle`;
  // Set the new Oracle
  await app?.send(
    'StrategyLeverageAAVEv3',
    networkConfig?.strategyProxy ?? '',
    'setOracle',
    [oracleReceipt.contractAddress],
    txOptions,
  );
}

async function upgradeVault(
  spinner: ora.Ora,
  app: any,
  txOptions: any,
  result: any[],
  config: BakerDeployConfig,
  networkEnv: NetworkConfig,
) {
  spinner.text = `Deploying new Vault Contract`;
  const vaultReceipt = await app?.deploy('Vault', [], txOptions);
  const contractFactory = await ethers.getContractFactory('Vault');
  result.push(['Vault Instance', vaultReceipt?.contractAddress]);
  spinner.text = `Upgrading Vault Contract on Proxy`;
  await app?.send(
    'BakerFiProxyAdmin',
    config?.proxyAdmin ?? '',
    'upgradeAndCall',
    [
      config?.vaultProxy,
      vaultReceipt?.contractAddress,
      contractFactory.interface.encodeFunctionData('initializeV4', [
        app.getAddress(),
        'Mille Feuille a la Base',
        'base-mfbrETH',
        networkEnv.weth,
        config.strategyProxy,
        '0x5B9D9E25a00A88290F35EE726490852e4DF083e3',
      ]),
    ],
    txOptions,
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
