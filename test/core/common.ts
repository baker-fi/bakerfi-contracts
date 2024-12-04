import '@nomicfoundation/hardhat-ethers';
import { ethers, network } from 'hardhat';
import {
  deployVaultRegistry,
  deployVault,
  deployBalancerFL,
  deployAAVEv3Strategy,
  deployStrategyLeverageMorphoBlue,
  deployWSTETH_ETH_OracleL2,
  deployWSTETH_ETH_Oracle,
} from '../../scripts/common';

import BaseConfig from '../../constants/network-deploy-config';
import {
  AAVEv3Market,
  AAVEv3MarketNames,
  AAVEv3MarketNamesType,
  MorphoMarket,
  NetworkConfig,
  StrategyImplementation,
} from '../../constants/types';

export async function deployMorphoProd() {
  return await deployProd(StrategyImplementation.MORPHO_BLUE_WSTETH_ETH);
}

export async function deployStrategySupplyMorpho(
  morphoContractAddress: String,
  marketAddress: String,
) {
  const [owner, otherAccount] = await ethers.getSigners();

  const StrategySupply = await ethers.getContractFactory('StrategySupplyMorpho');
  const strategySupply = await StrategySupply.deploy(
    owner.address,
    morphoContractAddress,
    marketAddress,
  );
  await strategySupply.waitForDeployment();

  return { strategy: strategySupply };
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

  let oracle;
  if (networkName === 'ethereum' || networkName === 'ethereum_devnet') {
    oracle = await deployWSTETH_ETH_Oracle(config.wstETH);
  } else {
    oracle = await deployWSTETH_ETH_OracleL2(config.chainlink?.wstEthToETH);
  }
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
        config.wstETH,
        config.weth,
        await oracle.getAddress(),
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
  await strategyProxy.setPriceMaxAge(3600 * 48);
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
