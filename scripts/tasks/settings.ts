import ora from 'ora';
import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import { getClient } from './common';
import { StrategyImplementation } from '../../constants/types';

task('settings:getFeeReceiver', 'Get Fee Receiver Account')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Fee Revceiver`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  });

task('settings:enableAccount', 'Enable an account on the whitelist')
  .addParam('account', 'Accoun to enable')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .addParam('enabled', 'enabled')
  .setAction(async ({ account, strategy, enabled }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Setting ${account} has ${enabled}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy, account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Checking Whitelist for ${account}`).start();
    try {
      let app = await getClient(ethers);
      const res = await app?.call(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy, value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Max Deposit in ETH ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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

task('settings:getMaxDeposit', 'Get Max Deposit in ETH')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Max Deposit in ETH`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  });

task('settings:getPriceMaxAge', 'Get Max Price Age')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    let app = await getClient(ethers);
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Nr Loop ${networkConfig.settings}`).start();
    try {
      const value = await app?.call(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Nr Of Loops to ${value}`).start();

    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
        'setPriceMaxAge',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Price Max Age Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:setRebalancePriceMaxAge', 'Set number of Loopps')
  .addParam('value', 'loop coount')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Rebalance Max Age ${value}`).start();

    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Price Max Confidence to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
        'setPriceMaxConf',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Price Max Confidence Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:getPriceMaxConfidence', 'Get Price Max Confidence')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Price Max Confidence`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  });

task('settings:getWithdrawalFee', 'get Withdrawal Fee')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Withdrawal Fee`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  });

task('settings:setPerformanceFee', 'Set Performance Fee')
  .addParam('value', 'The new performance fee')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Performance Fee to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
        'setPerformanceFee',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Performance Fee Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:getPerformanceFee', 'Get Performance Fee')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(
      `Gettting Performance Fee ${networkConfig[strategy]?.settingsProxy}`,
    ).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  });

task('settings:setFeeReceiver', 'Set Fee Receiver Accoutn')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .addParam('account', 'The feee receiver account')
  .setAction(async ({ strategy, account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Fee Revceiver to ${account}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
        'setFeeReceiver',
        [account],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Fee Receiver Account Changed to ${account} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:setWithdrawalFee', 'Set Withdrawal Fee')
  .addParam('value', 'Withdrawal Fee')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy, value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Withdrawal Fee to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
        'setWithdrawalFee',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Withdrawal Fee Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('settings:getRebalancePriceMaxAge', 'Get Fee Rebalance Max Age')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getttin Rebalance Price MaxAge`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Settings',
        networkConfig[strategy]?.settingsProxy ?? '',
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
  });
