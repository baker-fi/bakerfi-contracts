import '@nomicfoundation/hardhat-ethers';
import { ethers, network } from 'hardhat';
import {
  deployServiceRegistry,
  deployVault,
  deployBalancerFL,
  deployAAVEv3Strategy,
  deployStrategyLeverageMorphoBlue,
  deployETHOracle,
  deployWSTETHToUSDOracle,
  deploySettings,
} from '../../scripts/common';
import { PriceServiceConnection } from '@pythnetwork/price-service-client';
import BaseConfig from '../../constants/network-deploy-config';
import {
  AAVEv3Market,
  MorphoMarket,
  NetworkConfig,
  OracleNamesEnum,
  StrategyImplementation,
} from '../../constants/types';
import { feedIds } from '../../constants/pyth';

export async function deployMorphoProd() {
  return await deployProd(StrategyImplementation.MORPHO_BLUE_WSTETH_ETH);
}

export async function deployAAVEProd() {
  return await deployProd(StrategyImplementation.AAVE_V3_WSTETH_ETH);
}

export async function deployProd(type: StrategyImplementation) {
  const [deployer, otherAccount] = await ethers.getSigners();
  const networkName = network.name;
  const config: NetworkConfig = BaseConfig[networkName];

  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(deployer.address);
  await proxyAdmin.waitForDeployment();

  // 1. Deploy Service Registry
  const serviceRegistry = await deployServiceRegistry(deployer.address);
  // 3. Set the WETH Address
  await serviceRegistry.registerService(ethers.keccak256(Buffer.from('WETH')), config.weth);
  // 4. Deploy Settings
  const { proxy: settingsProxyDeploy, settings: settingsInstance } = await deploySettings(
    deployer.address,
    serviceRegistry,
    proxyAdmin,
  );

  await ethers.getContractAt('Settings', await settingsProxyDeploy.getAddress());
  // 5. Register UniswapV3 Universal Router
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Uniswap Router')),
    config.uniswapRouter02,
  );

  // 8. Register wstETH
  await serviceRegistry.registerService(ethers.keccak256(Buffer.from('wstETH')), config.wstETH);
  // 9. Deploy the Oracle
  await deployETHOracle(serviceRegistry, config.pyth);

  await deployWSTETHToUSDOracle(serviceRegistry, config.pyth);

  await updatePythPrices(
    [feedIds[OracleNamesEnum.ETH_USD], feedIds[OracleNamesEnum.WSTETH_USD]],
    config.pyth,
  );

  // 10. Balancer Vault
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Balancer Vault')),
    config.balancerVault,
  );

  // 11. Flash Lender Adapter
  await deployBalancerFL(serviceRegistry);

  let strategyProxyDeploy;
  // 12. Deploy the Strategy
  switch (type) {
    case StrategyImplementation.AAVE_V3_WSTETH_ETH:
      await serviceRegistry.registerService(
        ethers.keccak256(Buffer.from('AAVEv3')),
        config.AAVEPool,
      );
      const { proxy: aProxy } = await deployAAVEv3Strategy(
        deployer.address,
        deployer.address,
        await serviceRegistry.getAddress(),
        'wstETH',
        'WETH',
        'wstETH/USD Oracle',
        'ETH/USD Oracle',
        config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].swapFeeTier,
        (config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH] as AAVEv3Market)
          .AAVEEModeCategory,
        proxyAdmin,
      );
      strategyProxyDeploy = aProxy;
      break;

    case StrategyImplementation.MORPHO_BLUE_WSTETH_ETH:
      await serviceRegistry.registerService(
        ethers.keccak256(Buffer.from('Morpho Blue')),
        config.morpho,
      );
      const { proxy: mProxy } = await deployStrategyLeverageMorphoBlue(
        deployer.address,
        deployer.address,
        await serviceRegistry.getAddress(),
        'wstETH',
        'WETH',
        'wstETH/USD Oracle',
        'ETH/USD Oracle',
        config?.markets[StrategyImplementation.MORPHO_BLUE_WSTETH_ETH].swapFeeTier,
        (config?.markets[StrategyImplementation.MORPHO_BLUE_WSTETH_ETH] as MorphoMarket).oracle,
        (config?.markets[StrategyImplementation.MORPHO_BLUE_WSTETH_ETH] as MorphoMarket).irm,
        (config?.markets[StrategyImplementation.MORPHO_BLUE_WSTETH_ETH] as MorphoMarket).lltv,
        proxyAdmin,
      );
      strategyProxyDeploy = mProxy;
      break;
    default:
      throw 'No ';
  }

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Strategy')),
    await strategyProxyDeploy.getAddress(),
  );

  // 13. Deploy the Vault
  const { proxy: vaultProxyDeploy } = await deployVault(
    deployer.address,
    'Bread ETH',
    'brETH',
    await serviceRegistry.getAddress(),
    await strategyProxyDeploy.getAddress(),
    proxyAdmin,
  );

  const weth = await ethers.getContractAt('IWETH', config.weth);
  const aave3Pool = await ethers.getContractAt('IPoolV3', config.AAVEPool ?? '');
  const wstETH = await ethers.getContractAt('IERC20', config.wstETH);

  const settingsProxy = await ethers.getContractAt(
    'Settings',
    await settingsProxyDeploy.getAddress(),
  );

  const strategyProxy = await ethers.getContractAt(
    'StrategyLeverageAAVEv3',
    await strategyProxyDeploy.getAddress(),
  );
  const vaultProxy = await ethers.getContractAt('Vault', await vaultProxyDeploy.getAddress());
  await strategyProxy.setMaxSlippage(5n * 10n ** 7n);
  await strategyProxy.setLoanToValue(ethers.parseUnits('800', 6));
  await strategyProxy.transferOwnership(await vaultProxy.getAddress());
  await settingsProxy.setPriceMaxAge(360);
  await settingsProxy.setRebalancePriceMaxAge(360);
  await settingsProxy.setPriceMaxConf(0);

  return {
    serviceRegistry,
    weth,
    wstETH,
    vault: vaultProxy,
    deployer,
    otherAccount,
    strategy: strategyProxy,
    settings: settingsProxy,
    aave3Pool,
    config,
  };
}

export async function updatePythPrices(feeds: string[], pythAddress: string) {
  const connection = new PriceServiceConnection('https://hermes.pyth.network', {
    priceFeedRequestConfig: {
      // Provide this option to retrieve signed price updates for on-chain contracts.
      // Ignore this option for off-chain use.
      binary: true,
    },
  }); // See Hermes endpoints section below for other endpoints

  const currentPrices = await connection.getLatestPriceFeeds(feeds);
  const pyth = await ethers.getContractAt('IPyth', pythAddress);
  // @ts-ignore
  const vaas = currentPrices?.map((feed) => Buffer.from(feed.vaa, 'base64'));
  const fee = await pyth.getUpdateFee(vaas);
  await pyth.updatePriceFeeds(vaas, { value: fee });
}
