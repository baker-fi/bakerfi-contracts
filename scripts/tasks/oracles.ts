import ora from 'ora';
import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import NetworkDeployConfig from '../../constants/network-deploy-config';
import { PriceServiceConnection } from '@pythnetwork/price-service-client';
import { feedIds } from '../../constants/pyth';
import { OracleNamesEnum, StrategyImplementation } from '../../constants/types';
import { getClient } from './common';

task('oracles:priceUpdate', 'Update Required Prices').setAction(async ({}, { ethers, network }) => {
  const spinner = ora(`Pyth Price Updates`).start();
  const networkName = network.name;
  const networkDeployConfig = NetworkDeployConfig[networkName];
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
      feedIds[OracleNamesEnum.CBETH_USD], // BTC/USD price id
      feedIds[OracleNamesEnum.ETH_USD],
      feedIds[OracleNamesEnum.WSTETH_USD], // ETH/USD price id
    ];
    // Get the latest values of the price feeds as json objects.
    // If you set `binary: true` above, then this method also returns signed price updates for the on-chain Pyth contract.
    const currentPrices = await connection.getLatestPriceFeeds(priceIds);
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

task('oracles:getWSTETHPrice', 'Get WSTETH/USD')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Geeting  WSTETH/USD balance`).start();
    try {
      const oracle = await ethers.getContractAt(
        'PythOracle',
        networkConfig[strategy]?.collateralOracle ?? '',
      );
      const { price, lastUpdate } = await oracle.getSafeLatestPrice([360, 0]);
      spinner.succeed(`🧑‍🍳 WSTETH/USD = ${price} updatedAt ${lastUpdate}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('oracles:getETHPrice', 'Get ETH/USD')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Geeting  ETH/USD balance`).start();
    try {
      const oracle = await ethers.getContractAt(
        'PythOracle',
        networkConfig[strategy]?.debtOracle ?? '',
      );
      const { price, lastUpdate } = await oracle.getSafeLatestPrice([360, 0]);
      spinner.succeed(`🧑‍🍳 ETH/USD = ${price} updatedAt ${lastUpdate}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('oracles:prices', 'Generate an artifact tree')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { run }) => {
    await run('oracles:getETHPrice', { strategy });
    await run('oracles:getWSTETHPrice', { strategy });
  });

task('oracles:compare', 'Generate an artifact tree')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];

    try {
      const ethUSDOracle = await ethers.getContractAt(
        'PythOracle',
        networkConfig[strategy]?.debtOracle ?? '',
      );
      const wstETHUSDOracle = await ethers.getContractAt(
        'PythOracle',
        networkConfig[strategy]?.collateralOracle ?? '',
      );
      const priceETHUSD = (await ethUSDOracle.getLatestPrice()).price;
      const priceWSTETHUSD = (await wstETHUSDOracle.getLatestPrice()).price;
      const ratio = (priceWSTETHUSD * 10000n) / priceETHUSD;
      console.log(`${priceETHUSD}, ${priceWSTETHUSD}, ${ratio}`);
    } catch (e) {
      console.log(e);
    }
  });
