import ora from 'ora';
import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import NetworkDeployConfig from '../../constants/network-deploy-config';
import { PriceServiceConnection } from '@pythnetwork/price-service-client';
import { PythFeedNameEnum, feedIds } from '../../constants/pyth';
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
      feedIds[PythFeedNameEnum.CBETH_USD], // BTC/USD price id
      feedIds[PythFeedNameEnum.ETH_USD],
      feedIds[PythFeedNameEnum.WSTETH_USD], // ETH/USD price id
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

task('oracles:getWSTETHPrice', 'Get WSTETH/USD').setAction(async ({}, { ethers, network }) => {
  const networkName = network.name;
  const networkConfig = DeployConfig[networkName];
  const spinner = ora(`Geeting  WSTETH/USD balance`).start();
  try {
    const oracle = await ethers.getContractAt('PythOracle', networkConfig.wstETHUSDOracle ?? '');
    const { price, lastUpdate } = await oracle.getSafeLatestPrice([360, 0]);
    spinner.succeed(`🧑‍🍳 WSTETH/USD = ${price} updatedAt ${lastUpdate}`);
  } catch (e) {
    console.log(e);
    spinner.fail('Failed 💥');
  }
});

task('oracles:getETHPrice', 'Get ETH/USD').setAction(async ({}, { ethers, network }) => {
  const networkName = network.name;
  const networkConfig = DeployConfig[networkName];
  const spinner = ora(`Geeting  ETH/USD balance`).start();
  try {
    const oracle = await ethers.getContractAt('PythOracle', networkConfig.ethUSDOracle ?? '');
    const { price, lastUpdate } = await oracle.getSafeLatestPrice([360, 0]);
    spinner.succeed(`🧑‍🍳 ETH/USD = ${price} updatedAt ${lastUpdate}`);
  } catch (e) {
    console.log(e);
    spinner.fail('Failed 💥');
  }
});

task('oracles:prices', 'Generate an artifact tree').setAction(async ({}, { run }) => {
  await run('oracles:getETHPrice');
  await run('oracles:getWSTETHPrice');
});
