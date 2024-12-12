import ora from 'ora';
import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import { getClient } from './common';
import { StrategyImplementation } from '../../constants/types';

task('vault:getFeeReceiver', 'Get Fee Receiver Account')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Fee Revceiver`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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

task('vault:enableAccount', 'Enable an account on the whitelist')
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
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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

task('vault:isAccountEnabled', 'Enable an account on the whitelist')
  .addParam('account', 'Accoun to enable')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy, account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Checking Whitelist for ${account}`).start();
    try {
      let app = await getClient(ethers);
      const res = await app?.call(
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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

task('strategy:getPriceMaxAge', 'Get Max Price Age')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    let app = await getClient(ethers);
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Nr Loop ${networkConfig.settings}`).start();
    try {
      const value = await app?.call(
        'StrategyLeverage',
        networkConfig[strategy]?.strategyProxy ?? '',
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

task('strategy:setPriceMaxAge', 'Set the price max age')
  .addParam('value', 'max Age')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Nr Of Loops to ${value}`).start();

    try {
      let app = await getClient(ethers);
      await app?.send(
        'StrategyLeverage',
        networkConfig[strategy]?.strategyProxy ?? '',
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

task('strategy:setRebalancePriceMaxAge', 'Set number of Loopps')
  .addParam('value', 'loop coount')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Rebalance Max Age ${value}`).start();

    try {
      let app = await getClient(ethers);
      await app?.send(
        'StrategyLeverage',
        networkConfig[strategy]?.strategyProxy ?? '',
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

task('strategy:setPriceMaxConfidence', 'Set Price Max Confidencce')
  .addParam('value', 'The new Max confidence')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Price Max Confidence to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'StrategyLeverage',
        networkConfig[strategy]?.strategyProxy ?? '',
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

task('strategy:getPriceMaxConfidence', 'Get Price Max Confidence')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Price Max Confidence`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'StrategyLeverage',
        networkConfig[strategy]?.strategyProxy ?? '',
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

task('vault:getWithdrawalFee', 'get Withdrawal Fee')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Withdrawal Fee`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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

task('vault:setPerformanceFee', 'Set Performance Fee')
  .addParam('value', 'The new performance fee')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Performance Fee to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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

task('vault:getPerformanceFee', 'Get Performance Fee')
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
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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

task('vault:setFeeReceiver', 'Set Fee Receiver Accoutn')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .addParam('account', 'The feee receiver account')
  .setAction(async ({ strategy, account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Fee Revceiver to ${account}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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

task('vault:setWithdrawalFee', 'Set Withdrawal Fee')
  .addParam('value', 'Withdrawal Fee')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy, value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Withdrawal Fee to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'Vault',
        networkConfig[strategy]?.vaultProxy ?? '',
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
