import ora from 'ora';
import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import { getClient } from './common';

task('settings:getFeeReceiver', 'Get Fee Receiver Account').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Fee Revceiver`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'getFeeReceiver',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Fee Receiver Account ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('settings:enableAccount', 'Enable an account on the whitelist')
  .addParam('account', 'Accoun to enable')
  .addParam('enabled', 'enabled')
  .setAction(async ({ account, enabled }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Setting ${account} has ${enabled}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'enableAccount',
        [account, enabled == 'true'],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Account ${account} now is enabled=${enabled} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:isAccountEnabled', 'Enable an account on the whitelist')
  .addParam('account', 'Accoun to enable')
  .setAction(async ({ account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Checking Whitelist for ${account}`).start();
    try {
      let app = await getClient(ethers);
      const res = await app?.call(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'isAccountEnabled',
        [account],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Account ${account} is enabled? ${res} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:setMaxDeposit', 'Set Max Deposit')
  .addParam('value', 'Max Deposit')
  .setAction(async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Max Deposit in ETH ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'setMaxDepositInETH',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Max Deposit In ETH is ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:getMaxDeposit', 'Get Max Deposit in ETH').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Max Deposit in ETH`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'getMaxDepositInETH',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Max Deposit in ETH = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('settings:getPriceMaxAge', 'Get Max Price Age').setAction(async ({}, { ethers, network }) => {
  let app = await getClient(ethers);
  const networkName = network.name;
  const networkConfig = DeployConfig[networkName];
  const spinner = ora(`Gettting Nr Loop ${networkConfig.settings}`).start();
  try {
    const value = await app?.call(
      'Settings',
      networkConfig.settingsProxy ?? '',
      'getPriceMaxAge',
      [],
      {
        chainId: network.config.chainId,
      },
    );
    spinner.succeed(`🧑‍🍳 Price Max Age = ${value} `);
  } catch (e) {
    console.log(e);
    spinner.fail('Failed 💥');
  }
});

task('settings:setPriceMaxAge', 'Set the price max age')
  .addParam('value', 'max Age')
  .setAction(async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Nr Of Loops to ${value}`).start();

    try {
      let app = await getClient(ethers);
      await app?.send('Settings', networkConfig.settingsProxy ?? '', 'setPriceMaxAge', [value], {
        chainId: network.config.chainId,
      });
      spinner.succeed(`🧑‍🍳 Price Max Age Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:setRebalancePriceMaxAge', 'Set number of Loopps')
  .addParam('value', 'loop coount')
  .setAction(async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Rebalance Max Age ${value}`).start();

    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'setRebalancePriceMaxAge',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Rebalance Max Age ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:setPriceMaxConfidence', 'Set Price Max Confidencce')
  .addParam('value', 'The new Max confidence')
  .setAction(async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Price Max Confidence to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send('Settings', networkConfig.settingsProxy ?? '', 'setPriceMaxConf', [value], {
        chainId: network.config.chainId,
      });
      spinner.succeed(`🧑‍🍳 Price Max Confidence Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:getPriceMaxConfidence', 'Get Price Max Confidence').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Price Max Confidence`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'getPriceMaxConf',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Price Maximum Confidence = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('settings:getWithdrawalFee', 'get Withdrawal Fee').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Withdrawal Fee`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'getWithdrawalFee',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Withdrawal Fee = ${value}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('settings:setPerformanceFee', 'Set Performance Fee')
  .addParam('value', 'The new performance fee')
  .setAction(async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Performance Fee to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send('Settings', networkConfig.settingsProxy ?? '', 'setPerformanceFee', [value], {
        chainId: network.config.chainId,
      });
      spinner.succeed(`🧑‍🍳 Performance Fee Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:getPerformanceFee', 'Get Performance Fee').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Performance Fee`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'getPerformanceFee',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Performance Fee = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('settings:setFeeReceiver', 'Set Fee Receiver Accoutn')
  .addParam('account', 'The feee receiver account')
  .setAction(async ({ account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Fee Revceiver to ${account}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send('Settings', networkConfig.settingsProxy ?? '', 'setFeeReceiver', [account], {
        chainId: network.config.chainId,
      });
      spinner.succeed(`🧑‍🍳 Fee Receiver Account Changed to ${account} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:setWithdrawalFee', 'Set Withdrawal Fee')
  .addParam('value', 'Withdrawal Fee')
  .setAction(async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Withdrawal Fee to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send('Settings', networkConfig.settingsProxy ?? '', 'setWithdrawalFee', [value], {
        chainId: network.config.chainId,
      });
      spinner.succeed(`🧑‍🍳 Withdrawal Fee Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:getRebalancePriceMaxAge', 'Get Fee Rebalance Max Age').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getttin Rebalance Price MaxAge`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig.settingsProxy ?? '',
        'getRebalancePriceMaxAge',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Rebalance Max Age = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);
