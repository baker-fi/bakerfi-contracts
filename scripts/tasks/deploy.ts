import ora from 'ora';
import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import { getClient } from './common';

task('deploy:upgrade:settings', 'Upgrade the settings Contract').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];

    const spinner = ora(`Upgrading Settings Contract`).start();
    try {
      // 1. Deploy a new Instance
      let app = await getClient(ethers);
      const settingsReceipt = await app?.deploy('Settings', [], {
        chainId: BigInt(network.config.chainId ?? 0),
      });

      await app?.send(
        'BakerFiProxyAdmin',
        networkConfig?.proxyAdmin ?? '',
        'upgrade',
        [networkConfig.settingsProxy, settingsReceipt?.contractAddress],
        {
          chainId: BigInt(network.config.chainId ?? 0),
        },
      );
      spinner.succeed(`New Settings Contract is ${settingsReceipt?.contractAddress}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('deploy:upgrade:strategy', 'Upgrade the settings Contract').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Upgrading strategy Contract`).start();
    try {
      let app = await getClient(ethers);
      const stratReceipt = await app?.deploy('StrategyAAVEv3', [], {
        chainId: BigInt(network.config.chainId ?? 0),
      });
      await app?.send(
        'BakerFiProxyAdmin',
        networkConfig?.proxyAdmin ?? '',
        'upgrade',
        [networkConfig.strategyProxy, stratReceipt?.contractAddress],
        {
          chainId: BigInt(network.config.chainId ?? 0),
        },
      );
      spinner.succeed(`New Strategy Contract is ${stratReceipt?.contractAddress}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('deploy:upgrade:vault', 'Upgrade the settings Contract').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Upgrading Vault Contract`).start();
    try {
      let app = await getClient(ethers);
      const vaultReceipt = await app?.deploy('Vault', [], {
        chainId: BigInt(network.config.chainId ?? 0),
      });
      await app?.send(
        'BakerFiProxyAdmin',
        networkConfig?.proxyAdmin ?? '',
        'upgrade',
        [networkConfig.vaultProxy, vaultReceipt?.contractAddress],
        {
          chainId: BigInt(network.config.chainId ?? 0),
        },
      );
      spinner.succeed(`New Vault Contract is ${vaultReceipt?.contractAddress}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);
