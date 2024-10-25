import 'dotenv/config';
import hre, { network } from 'hardhat';
import { ethers } from 'hardhat';
import ora from 'ora';
import { ContractClientWallet } from './lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../constants/test-accounts';
import { ContractClientLedger } from './lib/contract-client-ledger';
import ContractTree from '../src/contract-blob.json';
import DeployConfig from '../constants/contracts';
import { AAVEv3MarketNames, StrategyImplementation } from '../constants/types';
import NetworkConfig from '../constants/network-deploy-config';
const networkName = hre.network.name;
const chainId = BigInt(hre.network.config.chainId ?? 0n);

async function main() {
  const strategy = (process.env.STRATEGY ||
    StrategyImplementation.AAVE_V3_WSTETH_ETH) as StrategyImplementation;
  const result: any[] = [];
  let app;
  const [signerPKey] = STAGING_ACCOUNTS_PKEYS;
  const networkConfig = NetworkConfig[networkName];
  const deployConfig = DeployConfig[networkName];
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
  console.log(`Deploying Debt Oracle`);

  try {
    const oracles = {};
    for (const oracle of networkConfig.oracles) {
      console.log(`Deploying ${oracle.name} ${oracle.type} Oracle`);
      let oracleReceipt;
      switch (oracle.type) {
        case 'chainlink':
          oracleReceipt = await app.deploy('ChainLinkOracle', [oracle.aggregator, 0, 0], {
            chainId,
            minTxConfirmations: networkConfig.minTxConfirmations,
          });
          break;
        case 'pyth':
          oracleReceipt = await app.deploy('PythOracle', [oracle.feedId, networkConfig.pyth], {
            chainId,
            minTxConfirmations: networkConfig.minTxConfirmations,
          });
          break;
        case 'clExRate':
          oracleReceipt = await app.deploy(
            'ChainLinkExRateOracle',
            [oracles[oracle.base].contractAddress, oracle.rateAggregator],
            {
              chainId,
              minTxConfirmations: networkConfig.minTxConfirmations,
            },
          );
          break;
        case 'customExRate':
          oracleReceipt = await app.deploy(
            'CustomExRateOracle',
            [oracles[oracle.base].contractAddress, [oracle.target, oracle.callData], 18],
            {
              chainId,
              minTxConfirmations: networkConfig.minTxConfirmations,
            },
          );
          break;
        default:
          throw Error('Oracle type unrecognized');
      }
      oracles[oracle.name] = oracleReceipt;
      result.push([`${oracle.name} Oracle`, oracleReceipt?.contractAddress, oracleReceipt?.hash]);
    }
    if (oracles['wstETH/USD Oracle']) {
      console.log('Setting Collateral Oracle');
      await app.send(
        'StrategyLeverageAAVEv3',
        deployConfig[strategy]?.strategyProxy,
        'setCollateralOracle',
        [oracles['wstETH/USD Oracle'].contractAddress],
        {
          chainId,
          minTxConfirmations: networkConfig.minTxConfirmations,
        },
      );
    }
    if (oracles['ETH/USD Oracle']) {
      console.log('Setting Debt Oracle');
      await app.send(
        'StrategyLeverageAAVEv3',
        deployConfig[strategy]?.strategyProxy,
        'setDebtOracle',
        [oracles['ETH/USD Oracle'].contractAddress],
        {
          chainId,
          minTxConfirmations: networkConfig.minTxConfirmations,
        },
      );
    }
  } catch (e) {
    console.table(result);
    console.error(e);
    process.exit(1);
  }
  console.table(result);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
