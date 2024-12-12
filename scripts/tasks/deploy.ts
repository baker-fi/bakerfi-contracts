import ora from 'ora';
import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import NetworkConfig from '../../constants/network-deploy-config';
import { getClient } from './common';

task('deploy:oracle:wstEthToUsdRatio', 'Deploy an oracle with Exchange Ratio')
  .addParam('strategy', 'Strategy Type', 'AAVE_V3_WSTETH_ETH')
  .setAction(async ({ strategy }, { ethers, network, run }) => {
    const networkName = network.name;
    const deployConfig = DeployConfig[networkName];
    const networkConfig = NetworkConfig[networkName];
    const spinner = ora(`Deploying Ratio Oracle`).start();
    try {
      let app = await getClient(ethers);
      const oracle = await app?.deploy(
        'ChainLinkExRateOracle',
        [deployConfig[strategy]?.debtOracle, networkConfig.chainlink?.wstEthToETHRatio],
        {
          chainId: BigInt(network.config.chainId ?? 0),
          minTxConfirmations: 3,
        },
      );
      await app?.send(
        'StrategyLeverageAAVEv3',
        deployConfig[strategy]?.strategyProxy,
        'setCollateralOracle',
        [oracle.contractAddress],
        {
          chainId: BigInt(network.config.chainId ?? 0),
        },
      );
      spinner.succeed(`Exchange Ratio Oracle is ${'0xcc9b1371216a9c50c3f09434a1ce180fd55c0e48'}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('deploy:upgrade:strategy', 'Upgrade the settings Contract')
  .addParam('strategy', 'Strategy Type', 'AAVE_V3_WSTETH_ETH')
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Upgrading strategy Contract`).start();
    try {
      let app = await getClient(ethers);
      const stratReceipt = await app?.deploy('StrategyLeverageAAVEv3', [], {
        chainId: BigInt(network.config.chainId ?? 0),
      });
      await app?.send(
        'BakerFiProxyAdmin',
        networkConfig[strategy]?.proxyAdmin ?? '',
        'upgrade',
        [networkConfig[strategy]?.strategyProxy, stratReceipt?.contractAddress],
        {
          chainId: BigInt(network.config.chainId ?? 0),
        },
      );
      spinner.succeed(`New Strategy Contract is ${stratReceipt?.contractAddress}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('deploy:upgrade:vault', 'Upgrade the settings Contract')
  .addParam('strategy', 'Strategy Type', 'AAVE_V3_WSTETH_ETH')
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Upgrading Vault Contract`).start();
    try {
      let app = await getClient(ethers);
      const vaultReceipt = await app?.deploy('Vault', [], {
        chainId: BigInt(network.config.chainId ?? 0),
        minTxConfirmations: 6,
      });
      await app?.send(
        'BakerFiProxyAdmin',
        networkConfig[strategy]?.proxyAdmin ?? '',
        'upgrade',
        [networkConfig[strategy]?.vaultProxy, vaultReceipt?.contractAddress],
        {
          chainId: BigInt(network.config.chainId ?? 0),
          minTxConfirmations: 6,
        },
      );
      spinner.succeed(`New Vault Contract is ${vaultReceipt?.contractAddress}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });
