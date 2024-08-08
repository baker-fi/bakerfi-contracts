import ora from 'ora';
import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import { getClient } from './common';

task('vault:balance', "Prints an account's share balance")
  .addParam('account', "The account's address")
  .setAction(async ({ account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Geeting ${account} balance`).start();
    try {
      let app = await getClient(ethers);
      const balance = await app?.call(
        'Vault',
        networkConfig.vaultProxy ?? '',
        'balanceOf',
        [account],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Account Balance ${account} = ${ethers.formatEther(balance)} brETH`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('vault:assets', "Prints an account's share balance").setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Geeting Vault Assets`).start();
    try {
      let app = await getClient(ethers);
      const balance = await app?.call('Vault', networkConfig.vaultProxy ?? '', 'totalAssets', [], {
        chainId: network.config.chainId,
      });
      spinner.succeed(`🧑‍🍳 Vault Total Assets ${ethers.formatEther(balance)} ETH`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('vault:tokenPerAsset', 'Prints an tokenPerAsset').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Geeting Vault Assets`).start();
    try {
      let app = await getClient(ethers);
      const balance = await app?.call(
        'Vault',
        networkConfig.vaultProxy ?? '',
        'tokenPerAsset',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Vault tokenPerAsset ${ethers.formatEther(balance)}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('vault:rebalance', 'Burn brETH shares and receive ETH').setAction(
  async ({ account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Rebalancing Vault ${account} `).start();
    try {
      let app = await getClient(ethers);
      await app?.send('Vault', networkConfig.vaultProxy ?? '', 'rebalance', [], {
        chainId: network.config.chainId,
      });
      spinner.succeed(`🧑‍🍳 Vault Rebalanced 🍰`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('vault:deposit', 'Deposit ETH on the vault')
  .addParam('account', "The account's address")
  .addParam('amount', 'The ETH deposited amount')
  .setAction(async ({ account, amount }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Depositing ${account} ${amount}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send('Vault', networkConfig.vaultProxy ?? '', 'depositNative', [account], {
        value: ethers.parseUnits(amount, 18),
        chainId: network.config.chainId,
      });
      spinner.succeed(`Deposited ${account} ${amount} ETH 🧑‍🍳`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('vault:withdraw', 'Burn brETH shares and receive ETH')
  .addParam('account', "The account's address")
  .addParam('amount', 'The brETH deposited amount')
  .setAction(async ({ account, amount }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Withdrawing ${account} ${amount}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Vault',
        networkConfig.vaultProxy ?? '',
        'withdrawNative',
        [ethers.parseUnits(amount, 18)],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`Withdrawed ${account} ${amount} ETH 🧑‍🍳`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });
