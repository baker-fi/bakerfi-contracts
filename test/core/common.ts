import '@nomicfoundation/hardhat-ethers';
import { ethers, network } from 'hardhat';
import {
  deployVaultRegistry,
  deployVault,
  deployBalancerFL,
  deployAAVEv3Strategy,
  deployStrategyLeverageMorphoBlue,
  deployETHOracle,
  deployWSTETHToUSDPythOracle,
  deployWSTETHToUSDCustomOracle,
} from '../../scripts/common';
import { PriceServiceConnection } from '@pythnetwork/price-service-client';
import BaseConfig from '../../constants/network-deploy-config';
import {
  AAVEv3Market,
  AAVEv3MarketNames,
  AAVEv3MarketNamesType,
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
  return await deployProd(StrategyImplementation.AAVE_V3_WSTETH_ETH, AAVEv3MarketNames.AAVE_V3);
}
export async function deployAAVELidoProd() {
  return await deployProd(
    StrategyImplementation.AAVE_V3_WSTETH_ETH,
    AAVEv3MarketNames.AAVE_V3_LIDO_MARKET,
  );
}

export async function deployProd(
  type: StrategyImplementation,
  aavev3MarketName?: AAVEv3MarketNamesType,
) {
  const [deployer, otherAccount] = await ethers.getSigners();
  const networkName = network.name;
  const config: NetworkConfig = BaseConfig[networkName];

  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(deployer.address);
  await proxyAdmin.waitForDeployment();

  // 1. Deploy Service Registry
  const serviceRegistry = await deployVaultRegistry(deployer.address);
  // 3. Set the WETH Address
  await serviceRegistry.registerService(ethers.keccak256(Buffer.from('WETH')), config.weth);

  // 5. Register UniswapV3 Universal Router
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Uniswap Router')),
    config.uniswapRouter02,
  );

  // 8. Register wstETH
  await serviceRegistry.registerService(ethers.keccak256(Buffer.from('wstETH')), config.wstETH);
  // 9. Deploy the Oracle
  const ethOracle = await deployETHOracle(serviceRegistry, config.pyth);

  let oracle;
  if (networkName === 'ethereum' || networkName === 'ethereum_devnet') {
    oracle = await deployWSTETHToUSDCustomOracle(
      serviceRegistry,
      await ethOracle.getAddress(),
      config.wstETH,
    );
  } else {
    oracle = await deployWSTETHToUSDPythOracle(serviceRegistry, config.pyth);
  }

  await updatePythPrices(
    [feedIds[OracleNamesEnum.ETH_USD], feedIds[OracleNamesEnum.WSTETH_USD]],
    config.pyth,
  );

  // 11. Flash Lender Adapter
  const flashLender = await deployBalancerFL(config.balancerVault);

  let strategyProxyDeploy;
  // 12. Deploy the Strategy
  const aavev3Market = aavev3MarketName ?? AAVEv3MarketNames.AAVE_V3;
  switch (type) {
    case StrategyImplementation.AAVE_V3_WSTETH_ETH:
    case StrategyImplementation.AAVE_V3_WSTETH_ETH_LIDO:
      await serviceRegistry.registerService(
        ethers.keccak256(Buffer.from('AAVEv3')),
        config.aavev3?.[aavev3Market],
      );
      const { proxy: aProxy } = await deployAAVEv3Strategy(
        deployer.address,
        deployer.address,
        config.wstETH,
        config.weth,
        await oracle.getAddress(),
        await ethOracle.getAddress(),
        await flashLender.getAddress(),
        config.aavev3?.[aavev3Market] ?? '',
        (config.markets[type] as AAVEv3Market).AAVEEModeCategory,
        proxyAdmin,
      );
      const sp = await ethers.getContractAt('StrategyLeverageAAVEv3', await aProxy.getAddress());
      await sp.enableRoute(config.wstETH, config.weth, {
        router: await config.uniswapRouter02,
        provider: 1,
        uniV3Tier: config.markets[type].swapFeeTier,
        tickSpacing: 0,
      });
      strategyProxyDeploy = aProxy;
      break;
    case StrategyImplementation.MORPHO_BLUE_WSTETH_ETH:
      const { proxy: mProxy } = await deployStrategyLeverageMorphoBlue(
        deployer.address,
        deployer.address,
        'wstETH',
        'WETH',
        'wstETH/USD Oracle',
        'ETH/USD Oracle',
        await flashLender.getAddress(),
        config.morpho ?? '',
        (config?.markets[StrategyImplementation.MORPHO_BLUE_WSTETH_ETH] as MorphoMarket).oracle,
        (config?.markets[StrategyImplementation.MORPHO_BLUE_WSTETH_ETH] as MorphoMarket).irm,
        (config?.markets[StrategyImplementation.MORPHO_BLUE_WSTETH_ETH] as MorphoMarket).lltv,
        proxyAdmin,
      );
      strategyProxyDeploy = mProxy;
      const sp2 = await ethers.getContractAt('StrategyLeverageAAVEv3', await mProxy.getAddress());
      await sp2.enableRoute(config.wstETH, config.weth, {
        router: await config.uniswapRouter02,
        provider: 1,
        uniV3Tier: config.markets[type].swapFeeTier,
        tickSpacing: 0,
      });
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
    await strategyProxyDeploy.getAddress(),
    config.weth,
    proxyAdmin,
  );

  const weth = await ethers.getContractAt('IWETH', config.weth);
  const aave3Pool = await ethers.getContractAt('IPoolV3', config.aavev3?.[aavev3Market] ?? '');
  const wstETH = await ethers.getContractAt('IERC20', config.wstETH);

  const strategyProxy = await ethers.getContractAt(
    'StrategyLeverageAAVEv3',
    await strategyProxyDeploy.getAddress(),
  );

  const vaultProxy = await ethers.getContractAt('Vault', await vaultProxyDeploy.getAddress());
  await strategyProxy.setMaxSlippage(5n * 10n ** 7n);
  await strategyProxy.setLoanToValue(ethers.parseUnits('800', 6));
  await strategyProxy.transferOwnership(await vaultProxy.getAddress());
  await strategyProxy.setPriceMaxAge(360);
  await strategyProxy.setPriceMaxConf(0);

  return {
    serviceRegistry,
    weth,
    wstETH,
    vault: vaultProxy,
    deployer,
    otherAccount,
    strategy: strategyProxy,
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
