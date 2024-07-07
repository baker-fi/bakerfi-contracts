import ora from 'ora';
import hre from 'hardhat';
import { task } from 'hardhat/config';
import DeployConfig from '../constants/contracts';
import NetworkDeployConfig from '../constants/network-deploy-config';
import { PriceServiceConnection } from '@pythnetwork/price-service-client';
import { ContractClientLedger } from './lib/contract-client-ledger';
import { ContractClientWallet } from './lib/contract-client-wallet';
import { STAGING_ACCOUNTS_PKEYS } from '../constants/test-accounts';
import { PythFeedNameEnum, feedIds } from '../constants/pyth';
import { JsonRpcApiProvider, JsonRpcProvider, Wallet } from 'ethers';

const fs = require('fs');
const path = require('path');

task('compile:artifactTree', 'Generate an artifact tree').setAction(
  async (taskArgs, { ethers, network, config, run }) => {
    await run('compile');
    // Ensure the contracts are compiled
    const artifactsPath = config.paths.artifacts;
    const contractsPath = config.paths.sources;
    const output = {};
    // Read the contracts directory
    const contractFiles = fs.readdirSync(contractsPath, { recursive: true });
    for (const file of contractFiles) {
      if (file.endsWith('.sol') && !file.includes('Mock')) {
        const contractName = path.basename(file).replace('.sol', '');
        const artifactPath = path.join(artifactsPath, 'contracts', file, `${contractName}.json`);
        if (fs.existsSync(artifactPath)) {
          const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
          output[contractName] = {
            abi: artifact.abi,
            bytecode: artifact.bytecode,
          };
        }
      }
    }
    // Output the result to a JSON file
    const outputPath = path.join(__dirname, '..', 'src', 'contract-blob.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`Contracts info exported to ${outputPath}`);
  },
);

task('balance', "Prints an account's balance")
  .addParam('account', "The account's address")
  .setAction(async (taskArgs, { ethers, network }) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);
    console.log(`🧑‍🍳 Account Balance ${taskArgs.account} = ${ethers.formatEther(balance)} ETH`);
  });

task('vault:deposit', 'Deposit ETH on the vault')
  .addParam('account', "The account's address")
  .addParam('amount', 'The ETH deposited amount')
  .setAction(async ({ account, amount }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Depositing ${account} ${amount}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send('Vault', networkConfig.vaultProxy ?? '', 'deposit', [account], {
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
        'deposit',
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

task('vault:tokenPerETH', 'Prints an tokenPerETH').setAction(async ({}, { ethers, network }) => {
  const networkName = network.name;
  const networkConfig = DeployConfig[networkName];
  const spinner = ora(`Geeting Vault Assets`).start();
  try {
    let app = await getClient(ethers);
    const balance = await app?.call('Vault', networkConfig.vaultProxy ?? '', 'tokenPerETH', [], {
      chainId: network.config.chainId,
    });
    spinner.succeed(`🧑‍🍳 Vault tokenPerETH ${ethers.formatEther(balance)}`);
  } catch (e) {
    console.log(e);
    spinner.fail('Failed 💥');
  }
});

task('strategy:setLoanToValue', 'Set Target Loan To value')
  .addParam('value', 'The new target LTV')
  .setAction(async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Target LTV ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'StrategyAAVEv3',
        networkConfig.strategyProxy ?? '',
        'setLoanToValue',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Target LTV Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('strategy:getLoanToValue', 'Set Target Loan To value').setAction(
  async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Target LTV `).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'StrategyAAVEv3',
        networkConfig.strategyProxy ?? '',
        'getLoanToValue',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 LTV = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('strategy:setMaxLoanToValue', 'Set Max Target Loan To value')
  .addParam('value', 'The new max LTV')
  .setAction(async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Max Target LTV ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'StrategyAAVEv3',
        networkConfig.strategyProxy ?? '',
        'setMaxLoanToValue',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Max LTV Changed to  ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('strategy:getMaxLoanToValue', 'Get Max Target Loan To value').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Max Target LTV`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'StrategyAAVEv3',
        networkConfig.strategyProxy ?? '',
        'getMaxLoanToValue',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Max LTV = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

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

task('strategy:getNrLoops', 'Get Recursive Number of Loops').setAction(
  async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Nr Loop ${networkConfig.settings}`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'StrategyAAVEv3',
        networkConfig.strategyProxy ?? '',
        'getNrLoops',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Nr of Loops = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('strategy:setNrLoops', 'Set number of Loopps')
  .addParam('value', 'loop coount')
  .setAction(async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Nr Of Loops to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send('StrategyAAVEv3', networkConfig.strategyProxy ?? '', 'setNrLoops', [value], {
        chainId: network.config.chainId,
      }),
        spinner.succeed(`🧑‍🍳 Nr of Loops Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

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

task('pyth:priceUpdate', 'Update Required Prices').setAction(async ({}, { ethers, network }) => {
  const networkName = network.name;
  const networkConfig = DeployConfig[networkName];
  const spinner = ora(`Pyth Price Updates`).start();
  try {
    let app = await getClient(ethers);
    const connection = new PriceServiceConnection('https://hermes.pyth.network', {
      priceFeedRequestConfig: {
        // Provide this option to retrieve signed price updates for on-chain contracts.
        // Ignore this option for off-chain use.
        binary: true,
      },
    }); // See Hermes endpoints section below for other endpoints
    const priceIds = [
      // You can find the ids of prices at https://pyth.network/developers/price-feed-ids
      //  pythFeedIds.CBETH_USD_FEED_ID, // BTC/USD price id
      feedIds[PythFeedNameEnum.CBETH_USD], // BTC/USD price id
      feedIds[PythFeedNameEnum.ETH_USD],
      feedIds[PythFeedNameEnum.WSTETH_USD], // ETH/USD price id
    ];
    // Get the latest values of the price feeds as json objects.
    // If you set `binary: true` above, then this method also returns signed price updates for the on-chain Pyth contract.
    const currentPrices = await connection.getLatestPriceFeeds(priceIds);
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const networkDeployConfig = NetworkDeployConfig[networkName];
    // You can also call this function to get price updates for the on-chain contract directly.
    const vaas = currentPrices?.map((feed) =>
      // @ts-ignore: Unreachable code error
      Buffer.from(feed.vaa, 'base64'),
    );
    console.log('Updating Prices...');
    const fee = await app?.call('IPyth', networkDeployConfig.pyth ?? '', 'getUpdateFee', [vaas], {
      chainId: network.config.chainId,
    });
    await app?.send('IPyth', networkDeployConfig.pyth ?? '', 'updatePriceFeeds', [vaas], {
      value: fee,
      chainId: network.config.chainId,
    });
    spinner.succeed(`🧑‍🍳 Pyth Price Updates`);
  } catch (e) {
    console.log(`${e.reason} - ${e.code}`);
    spinner.fail('Failed 💥');
  }
});

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

task('strategy:getPosition', 'Set number of Loopps').setAction(
  async ({ value }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Rebalance Max Age ${value}`).start();

    try {
      let app = await getClient(ethers);
      const [totalCollateralInEth, totalDebtInEth, loanToValue] = await app?.call(
        'StrategyAAVEv3',
        networkConfig.strategyProxy ?? '',
        'getPosition',
        [[0, 0]],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(
        `🧑‍🍳 Strategy Position ${totalCollateralInEth},${totalDebtInEth}, ${loanToValue} `,
      );
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  },
);

task('bakerfi:resume', 'Generate an artifact tree').setAction(async ({}, { run }) => {
  console.log('🧑‍🍳 BakerFi Settings resume ....');

  await run('vault:assets');
  await run('strategy:getLoanToValue');
  await run('strategy:getMaxLoanToValue');
  await run('settings:getWithdrawalFee');
  await run('settings:getPerformanceFee');
  await run('settings:getPriceMaxAge');
  await run('settings:getRebalancePriceMaxAge');
  await run('strategy:getNrLoops');
  await run('settings:getFeeReceiver');
  await run('settings:getMaxDeposit');
  console.log('Served ...');
});
async function getClient(ethers) {
  const [signerPKey] = STAGING_ACCOUNTS_PKEYS;
  let app;
  const contractTree = await import('../src/contract-blob.json');
  if (process.env.DEPLOY_WITH_LEDGER === 'true') {
    app = new ContractClientLedger(
      ethers.provider,
      contractTree.default,
      process.env?.BAKERFI_LEDGER_PATH ?? '',
    );
  } else {
    app = new ContractClientWallet(ethers.provider, contractTree.default, signerPKey);
  }
  await app?.init();
  return app;
}


task('bakerfi:loop', 'Test deposit and with loop')
  .addParam('amount', 'The ETH deposited amount')
  .addParam('loops', 'The ETH deposited amount')
  .setAction(async ({ loops, amount }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    try {
      const loopsNumber = parseInt(loops);
      for (let i = 0; i < loopsNumber; i++) {
        const value = ethers.parseUnits(amount, 18);
        const vault = await ethers.getContractAt('Vault', networkConfig.vaultProxy ?? '');
        const jsonRpcProvider = new JsonRpcProvider(
          `https://rpc.ankr.com/base/${process.env.ANKR_API_KEY}`,
        );
        const wallet = new Wallet(process.env.TEST_LOOP_KEY ?? '', jsonRpcProvider);
        const depositTx = await vault.connect(wallet).deposit(wallet.address, {
          value,
        });
        console.log('Transaction waiting', depositTx.hash);
        await jsonRpcProvider.waitForTransaction(depositTx.hash, 3);
        const balance = await vault.balanceOf(wallet.address);
        console.log(`Withdrawing ${balance}`);
        const withdrawTx = await vault.connect(wallet).withdraw(balance);
        await jsonRpcProvider.waitForTransaction(withdrawTx.hash, 3);
        console.log(`Withdrawed ${withdrawTx.hash}`);
      }
    } catch (e) {
      console.log(e);
      console.log(e.stack);
      process.exit(0);
    }
  });
0;