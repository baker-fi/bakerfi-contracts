import { ethers, network } from 'hardhat';
import {
  deployAaveV3,
  deployFlashLender,
  deployVaultRegistry,
  deployStEth,
  deployVault,
  deployWETH,
  deployWStEth,
  deployBKR,
  deployAAVEv3Strategy,
  deployOracleMock,
  deployVaultRouter,
  deployPythMock,
  deployETHOracle,
} from './common';

import { AAVEv3Market, NetworkConfig, StrategyImplementation } from '../constants/types';

import BaseConfig from '../constants/network-deploy-config';

import ora from 'ora';

/**
 * Deploy the Basic System for testing
 */
async function main() {
  const networkName = network.name;
  const chainId = network.config.chainId;
  const config: NetworkConfig = BaseConfig[networkName];
  console.log('  🧑‍🍳 BakerFi Cooking .... ');
  const result: any[] = [];
  const spinner = ora('Cooking ....').start();
  // Max Staked ETH available
  result.push(['Network Name', networkName]);
  result.push(['Network Id', chainId]);

  const STETH_MAX_SUPPLY = ethers.parseUnits('1000000000', 18);
  const FLASH_LENDER_DEPOSIT = ethers.parseUnits('10000', 18);
  const AAVE_DEPOSIT = ethers.parseUnits('10000', 18);

  spinner.text = 'Getting Signers';
  const [owner, otherAccount] = await ethers.getSigners();

  // Deploy Proxy Admin
  spinner.text = 'Deploying Proxy Admin';
  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();
  result.push(['Proxy Admin', await proxyAdmin.getAddress()]);

  // 1. Deploy the Service Registry
  const serviceRegistry = await deployVaultRegistry(owner.address);
  spinner.text = 'Deploying Registry';
  result.push(['Service Registry', await serviceRegistry.getAddress()]);

  // 3. Deploy the WETH
  spinner.text = 'Deploying WETH';
  const weth = await deployWETH(serviceRegistry);
  result.push(['WETH', await weth.getAddress()]);

  // 4. Deploy the Vault attached to Leverage Lib
  spinner.text = 'Deploying Flash Lender';
  const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
  result.push(['Flash Lender', await flashLender.getAddress()]);
  result.push([
    'Flash Lender wETH',
    ethers.formatEther(await weth.balanceOf(await flashLender.getAddress())),
  ]);

  // 5. Deploy stETH ERC-20
  spinner.text = 'Deploying StETH';
  const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
  result.push(['StETH', await stETH.getAddress()]);

  // 6. Deploy wstETH ERC-20
  spinner.text = 'Deploying WstETH';
  const wstETH = await deployWStEth(serviceRegistry, await stETH.getAddress());
  result.push(['WstETH', await wstETH.getAddress()]);

  // Deploy cbETH -> ETH Uniswap Router
  spinner.text = 'Deploying Uniswap Router Mock';
  const UniRouter = await ethers.getContractFactory('UniV3RouterMock');
  const uniRouter = await UniRouter.deploy(await weth.getAddress(), await wstETH.getAddress());
  spinner.text = 'Deploying Uniswap Router Mock';

  await stETH.approve(await wstETH.getAddress(), ethers.parseUnits('20000', 18));

  spinner.text = 'Topping Up Uniswap Swapper';

  // Deposit WETH on UniRouter
  await weth
    .connect(otherAccount)
    // @ts-expect-error
    .deposit?.call('', { value: ethers.parseUnits('10000', 18) });
  await weth
    .connect(otherAccount)
    // @ts-expect-error
    .transfer(await uniRouter.getAddress(), ethers.parseUnits('10000', 18));
  await wstETH.wrap(ethers.parseUnits('20000', 18));
  const wstBalance = await wstETH.balanceOf(owner.address);
  await wstETH.transfer(await uniRouter.getAddress(), wstBalance);
  await stETH.transfer(await uniRouter.getAddress(), ethers.parseUnits('10000', 18));

  const stBalance = ethers.formatEther(await stETH.balanceOf(await uniRouter.getAddress()));
  const wstBalanece = ethers.formatEther(await wstETH.balanceOf(await uniRouter.getAddress()));
  const wethBalance = ethers.formatEther(await weth.balanceOf(await uniRouter.getAddress()));
  result.push(['Uniswap stETH', `${stBalance} stETH`]);
  result.push(['Uniswap wstETH', `${wstBalanece} wsETH`]);
  result.push(['Uniswap wETH', `${wethBalance} wETH`]);

  // Register Uniswap Router
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Uniswap Router')),
    await uniRouter.getAddress(),
  );
  await uniRouter.setPrice(8665 * 1e5);
  result.push(['Uniswap Router Mock', await uniRouter.getAddress()]);

  // 8. Deploy AAVE Mock Service
  spinner.text = 'Deploying AAVVE v3 Mock';
  const aaveV3PoolMock = await deployAaveV3(wstETH, weth, serviceRegistry, AAVE_DEPOSIT);
  result.push(['AAVE v3 Mock', await aaveV3PoolMock.getAddress()]);

  // Pyth Mockf for Price Update Testing
  const pyth = await deployPythMock(serviceRegistry);
  result.push(['Pyth Mock', await pyth.getAddress()]);

  // Deploy wstETH/ETH Oracle
  spinner.text = 'Deploying wstETH/ETH Oracle';
  const oracle = await deployOracleMock();
  await oracle.setDecimals(9);
  // Price of wstETH in ETH is 1.187
  await oracle.setLatestPrice(1187 * 1e6);
  result.push(['WSTETH/ETH Oracle', await oracle.getAddress()]);

  // Udpated ETH/USD Oracle with Pyth Infra
  const ethOracle = await deployETHOracle(serviceRegistry, pyth);
  result.push(['ETH/USD Oracle', await ethOracle.getAddress()]);

  // Deploying Proxied Strategy
  spinner.text = 'Deploying StrategyLeverageAAVEv3WstETH';
  const { strategy, proxy: strategyProxy } = await deployAAVEv3Strategy(
    owner.address,
    owner.address,
    await wstETH.getAddress(),
    await weth.getAddress(),
    await oracle.getAddress(),
    await flashLender.getAddress(),
    await aaveV3PoolMock.getAddress(),
    (config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH] as AAVEv3Market).AAVEEModeCategory,
    proxyAdmin,
  );

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Strategy')),
    await strategyProxy.getAddress(),
  );

  result.push(['AAVEv3 Strategy WstETH', await strategy.getAddress()]);
  result.push([
    'AAVEv3 Strategy WstETH (Proxy)',
    strategyProxy && (await (strategyProxy as any).getAddress()),
  ]);

  spinner.text = 'Deploying Vault';
  // 10. Deploy the Proxiec Vault attached to Leverage Lib
  const { vault, proxy: vaultProxy } = await deployVault(
    owner.address,
    config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].sharesName,
    config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].sharesSymbol,
    await strategyProxy.getAddress(),
    await weth.getAddress(),
    proxyAdmin,
  );
  result.push(['BakerFi Vault 🕋', await vault.getAddress()]);
  result.push(['BakerFi Vault (Proxy)🕋', vaultProxy && (await (vaultProxy as any).getAddress())]);

  spinner.text = 'Transferring Vault Ownership';
  const strategyProxied = await ethers.getContractAt(
    'StrategyLeverageAAVEv3',
    await (strategyProxy as any).getAddress(),
  );

  await strategyProxied.enableRoute(await wstETH.getAddress(), await weth.getAddress(), {
    router: await uniRouter.getAddress(),
    provider: 1,
    uniV3Tier: config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].swapFeeTier,
    tickSpacing: 10000,
  });
  await strategyProxied.transferOwnership(vaultProxy);

  // Deploy Vault Router
  spinner.text = 'Deploying Vault Router';
  const { vaultRouter: vaultRouterImpl, proxy: vaultRouterProxy } = await deployVaultRouter(
    owner.address,
    await weth.getAddress(),
    proxyAdmin,
  );
  result.push(['Vault Impl', await vaultRouterImpl.getAddress()]);
  result.push(['Vault Router', await vaultRouterProxy.getAddress()]);
  const vaultRouter = await ethers.getContractAt(
    'VaultRouter',
    await vaultRouterProxy.getAddress(),
  );
  await vaultRouter.approveTokenForVault(await vaultProxy.getAddress(), await weth.getAddress());
  await vaultRouter.approveTokenForVault(await vaultProxy.getAddress(), await wstETH.getAddress());

  // 2. Deploy BKR
  spinner.text = 'Deploying BKR';
  const bkr = await deployBKR(owner.address, serviceRegistry);
  result.push(['BKR', await bkr.getAddress()]);

  spinner.succeed('🧑‍🍳 BakerFi Served 🍰');
  console.table(result);
  process.exit(0);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
