import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import {
  deployVaultRegistry,
  deployCbETH,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deployAAVEv3Strategy,
} from '../../../scripts/common';

import { describeif } from '../../common';
import BaseConfig from '../../../constants/network-deploy-config';
import { AAVEv3Market, NetworkConfig, StrategyImplementation } from '../../../constants/types';

/**
 * StrategyLeverageAAVEv3 Unit Tests
 */
describeif(network.name === 'hardhat')('Strategy Leverage AAVEv3', function () {
  it('Test Initialized Strategy', async function () {
    const { strategy } = await loadFixture(deployFunction);
    expect(await strategy.getPosition([0, 0])).to.deep.equal([0n, 0n, 0n]);
    expect(await strategy.totalAssets()).to.equal(0);
  });

  it('Test Deploy', async function () {
    const { owner, weth, strategy } = await loadFixture(deployFunction);

    // Deploy 10 ETH
    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    expect(
      await strategy.deploy(amount),
      // @ts-ignore
    ).to.changeEtherBalances([owner.address], [ethers.parseUnits('10', 18)]);
    expect(await strategy.getPosition([0, 0])).to.deep.equal([
      45701778505671475200n,
      35740737736704000000n,
      782042601n,
    ]);
    expect(await strategy.totalAssets()).to.equal(9961040768967475200n);
  });

  //TODO: Test Deploy Emission

  it('Test Undeploy', async function () {
    const { owner, weth, strategy } = await loadFixture(deployFunction);
    const receiver = owner.address;

    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);
    // Deploy 10TH ETH
    await strategy.deploy(amount);

    expect(await strategy.getPosition([0, 0])).to.deep.equal([
      45701778505671475200n,
      35740737736704000000n,
      782042601n,
    ]);
    expect(await strategy.totalAssets()).to.equal(9961040768967475200n);
    // Receive ~=5 ETH
    await expect(
      strategy.undeploy(ethers.parseUnits('5', 18)),
      // @ts-ignore
    ).to.changeTokenBalances(weth, [owner.address], [4983693196859889569n]);
  });

  it('Deploy Fail - Zero Value', async () => {
    const { owner, otherAccount, strategy } = await loadFixture(deployFunction);

    await expect(
      strategy.deploy(0),
      // @ts-ignore
    ).to.be.revertedWithCustomError(strategy, 'InvalidDeployAmount');
  });

  it('Deploy Fail - No Permissions', async () => {
    const { owner, weth, otherAccount, strategy } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);
    await expect(
      // @ts-expect-error
      strategy.connect(otherAccount).deploy(amount),
      // @ts-ignore
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Undeploy Fail - No Permissions', async () => {
    const { owner, otherAccount, weth, strategy } = await loadFixture(deployFunction);

    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    strategy.deploy(amount);
    await expect(
      // @ts-expect-error
      strategy.connect(otherAccount).undeploy(ethers.parseUnits('5', 18)),
      // @ts-ignore
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Harvest Fail - No Permissions', async () => {
    const { owner, otherAccount, strategy } = await loadFixture(deployFunction);
    // @ts-expect-error
    await expect(strategy.connect(otherAccount).harvest()).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Undeploy Fail - Uncollateralized', async () => {
    const { oracle, weth, aave3Pool, strategy } = await loadFixture(deployFunction);

    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    await strategy.deploy(amount);
    await aave3Pool.setCollateralPerEth(1130 * 1e6 * 0.1);
    await oracle.setLatestPrice(1130 * 1e6 * 0.1);
    await expect(
      strategy.undeploy(ethers.parseUnits('10', 18)),
      // @ts-ignore
    ).to.be.revertedWithCustomError(strategy, 'NoCollateralMarginToScale');
  });

  it('onFlashLoan - Invalid Flash Loan Sender', async () => {
    const { oracle, otherAccount, aave3Pool, strategy } = await loadFixture(deployFunction);
    await expect(
      strategy.onFlashLoan(
        otherAccount.address,
        otherAccount.address,
        ethers.parseUnits('10', 18),
        0,
        '0x',
      ),
      // @ts-ignore
    ).to.be.revertedWithCustomError(strategy, 'InvalidFlashLoanSender');
  });

  it('onFlashLoan - Invalid Flash Loan Asset', async () => {
    const { owner, aave3Pool, uniRouter, otherAccount, weth, cbETH, oracle, config } =
      await loadFixture(deployFunction);
    const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
    const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
    await proxyAdmin.waitForDeployment();
    const { proxy: proxyStrategy } = await deployAAVEv3Strategy(
      owner.address,
      owner.address,
      await cbETH.getAddress(),
      await weth.getAddress(),
      await oracle.getAddress(),
      owner.address,
      await aave3Pool.getAddress(),
      (config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH] as AAVEv3Market).AAVEEModeCategory,
      proxyAdmin,
    );
    const pStrategy = await ethers.getContractAt(
      'StrategyLeverageAAVEv3',
      await proxyStrategy.getAddress(),
    );

    await pStrategy.enableRoute(await cbETH.getAddress(), await weth.getAddress(), {
      router: await uniRouter.getAddress(),
      provider: 1,
      uniV3Tier: config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].swapFeeTier,
      tickSpacing: 0,
    });

    await expect(
      pStrategy.onFlashLoan(
        await proxyStrategy.getAddress(),
        otherAccount.address,
        ethers.parseUnits('10', 18),
        0,
        '0x',
      ),
      // @ts-ignore
    ).to.be.revertedWithCustomError(pStrategy, 'InvalidFlashLoanAsset');
  });

  it('onFlashLoan - Failed to Validate Flash Loan Args', async () => {
    const { weth, aave3Pool, uniRouter, owner, serviceRegistry, cbETH, oracle, config } =
      await loadFixture(deployFunction);
    const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
    const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
    await proxyAdmin.waitForDeployment();
    await serviceRegistry.unregisterService(ethers.keccak256(Buffer.from('FlashLender')));
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from('FlashLender')),
      owner.address,
    );
    const { proxy: proxyStrategy } = await deployAAVEv3Strategy(
      owner.address,
      owner.address,
      await cbETH.getAddress(),
      await weth.getAddress(),
      await oracle.getAddress(),
      owner.address,
      await aave3Pool.getAddress(),
      (config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH] as AAVEv3Market).AAVEEModeCategory,
      proxyAdmin,
    );
    const pStrategy = await ethers.getContractAt(
      'StrategyLeverageAAVEv3',
      await proxyStrategy.getAddress(),
    );

    await pStrategy.enableRoute(await cbETH.getAddress(), await weth.getAddress(), {
      router: await uniRouter.getAddress(),
      provider: 1,
      uniV3Tier: config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].swapFeeTier,
      tickSpacing: 0,
    });

    await expect(
      pStrategy.onFlashLoan(
        await proxyStrategy.getAddress(),
        await weth.getAddress(),
        ethers.parseUnits('10', 18),
        0,
        '0x',
      ),
      // @ts-ignore
    ).to.be.revertedWithCustomError(pStrategy, 'FailedToAuthenticateArgs');
  });

  it('OnFlashLoan - Attacker', async () => {
    const { weth, flashLender, strategy } = await loadFixture(deployFunction);

    const BorrowerAttacker = await ethers.getContractFactory('BorrowerAttacker');
    const attacker = await BorrowerAttacker.deploy();
    await attacker.initialize(await flashLender.getAddress(), await strategy.getAddress());

    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    await strategy.deploy(amount);

    await expect(
      attacker.flashme(await weth.getAddress(), ethers.parseUnits('1', 18)),
      // @ts-ignore
    ).to.be.revertedWithCustomError(strategy, 'InvalidFlashLoanSender');
  });

  it('Rebalance - Fails with outdated prices', async () => {
    const { weth, strategy } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    // Deposit 10 ETH
    await strategy.deploy(amount);
    await strategy.setPriceMaxAge(60);
    // advance time by one hour and mine a new block
    await time.increase(3600);
    // @ts-ignore
    await expect(strategy.harvest()).to.be.revertedWithCustomError(strategy, 'PriceOutdated');
  });

  it('Harvest Loss - No Debt Adjust', async function () {
    const { owner, weth, oracle, strategy, aave3Pool } = await loadFixture(deployFunction);

    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    // Deploy 10 ETH
    await strategy.deploy(amount);

    expect(await strategy.getPosition([0, 0])).to.deep.equal([
      45701778505671475200n,
      35740737736704000000n,
      782042601n,
    ]);

    expect(await strategy.totalAssets()).to.equal(9961040768967475200n);

    await strategy.setMaxLoanToValue(900 * 1e6);
    // Decremennt the Collateral value by 10%
    await oracle.setLatestPrice(1187 * 1e6 * 0.9);

    await expect(strategy.harvest())
      // @ts-ignore
      .to.emit(strategy, 'StrategyLoss')
      .withArgs(4570177850567147520n);

    expect(await strategy.getPosition([0, 0])).to.deep.equal([
      41131600655104327680n,
      35740737736704000000n,
      868936223n,
    ]);

    expect(await strategy.totalAssets()).to.equal(5390862918400327680n);
  });

  it('Harvest - Debt Adjust', async function () {
    const { owner, weth, oracle, strategy, aave3Pool } = await loadFixture(deployFunction);

    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    await strategy.deploy(amount);
    await strategy.setMaxLoanToValue(850 * 1e6);
    // Descrease the Collateral value by 10%
    await oracle.setLatestPrice(1187 * 1e6 * 0.9);

    expect(await strategy.getPosition([0, 0])).to.deep.equal([
      41131600655104327680n,
      35740737736704000000n,
      868936223n,
    ]);

    await expect(strategy.harvest())
      // @ts-ignore
      .to.emit(strategy, 'StrategyAmountUpdate')
      .withArgs(5390862918400327680n);

    expect(await strategy.getPosition([0, 0])).to.deep.equal([
      28360193029826529452n,
      21563451673601310720n,
      760342203n,
    ]);

    expect(await strategy.totalAssets()).to.equal(6796741356225218732n);
  });

  it('Harvest Loss - Collateral Value is lower than debt', async function () {
    const { owner, weth, oracle, strategy, aave3Pool } = await loadFixture(deployFunction);

    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    await strategy.deploy(amount);
    // Increment the Collateral value by 10%
    await aave3Pool.setCollateralPerEth(1154 * 1e6 * 0.5);

    await oracle.setLatestPrice(1154 * 1e6 * 0.5);
    // @ts-ignore
    await expect(strategy.harvest()).to.be.revertedWithCustomError(
      strategy,
      'CollateralLowerThanDebt',
    );
  });

  it('Rebalance - Success when the price is updated', async () => {
    const { weth, strategy } = await loadFixture(deployFunction);
    // Deposit 10 ETH
    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    await strategy.deploy(amount);
    await strategy.setPriceMaxAge(4800);
    // advance time by one hour and mine a new block
    await time.increase(3600);
    await strategy.harvest();
    expect(true).to.be.equal(true);
  });

  it('Change Price Max Age ✅', async function () {
    const { strategy, otherAccount } = await loadFixture(deployFunction);

    await strategy.setPriceMaxAge(3600);

    // @ts-expect-error
    expect(await strategy.connect(otherAccount).getPriceMaxAge()).to.equal(3600);
  });

  it('Only Owner can change Rebalance Price Max Age', async function () {
    const { strategy, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      strategy.connect(otherAccount).setPriceMaxAge(3600),
    ).to.be.revertedWithCustomError(strategy, 'CallerNotTheGovernor');
  });

  it('Change Price Max Conf ✅', async function () {
    const { strategy, otherAccount } = await loadFixture(deployFunction);
    await strategy.setPriceMaxConf(1n * 10n ** 7n);

    expect(await strategy.getPriceMaxConf()).to.equal(10000000n);
  });

  it('Only Owner can change Price Max Conf', async function () {
    const { strategy, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      strategy.connect(otherAccount).setPriceMaxConf(10n ** 7n),
    ).to.be.revertedWithCustomError(strategy, 'CallerNotTheGovernor');
  });

  it('Invalid Percentage', async function () {
    const { strategy } = await loadFixture(deployFunction);
    await expect(
      // @ts-ignore
      strategy.setPriceMaxConf(1n * 10n ** 10n),
    ).to.be.revertedWithCustomError(strategy, 'InvalidPercentage');
  });
});

/**
 * Deploy Test Function
 */
async function deployFunction() {
  const networkName = network.name;
  const config: NetworkConfig = BaseConfig[networkName];
  const [owner, otherAccount] = await ethers.getSigners();
  const CBETH_MAX_SUPPLY = ethers.parseUnits('1000000000', 18);
  const FLASH_LENDER_DEPOSIT = ethers.parseUnits('10000', 18);
  const AAVE_DEPOSIT = ethers.parseUnits('10000', 18);
  const serviceRegistry = await deployVaultRegistry(owner.address);
  const serviceRegistryAddress = await serviceRegistry.getAddress();

  const weth = await deployWETH(serviceRegistry);
  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

  // 1. Deploy Flash Lender
  const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
  // 2. Deploy cbEBT
  const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

  // Deploy cbETH -> ETH Uniswap Router
  const UniRouter = await ethers.getContractFactory('UniV3RouterMock');
  const uniRouter = await UniRouter.deploy(await weth.getAddress(), await cbETH.getAddress());

  await uniRouter.setPrice(8424 * 1e5);
  // Register Uniswap Router
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Uniswap Router')),
    await uniRouter.getAddress(),
  );

  // Deposit ETH on Uniswap Mock Router
  await weth.deposit?.call('', { value: ethers.parseUnits('10000', 18) });
  await weth.transfer(await uniRouter.getAddress(), ethers.parseUnits('10000', 18));

  // Deposit cbETH on Uniswap Mock Router
  await cbETH.transfer(await uniRouter.getAddress(), ethers.parseUnits('10000', 18));

  // Deploy AAVEv3 Mock Pool
  const aave3Pool = await deployAaveV3(cbETH, weth, serviceRegistry, AAVE_DEPOSIT);

  const oracle = await deployOracleMock();

  await oracle.setDecimals(9);
  // Price of wstETH in ETH is 1.187
  await oracle.setLatestPrice(1187 * 1e6);

  const { proxy: proxyStrategy } = await deployAAVEv3Strategy(
    owner.address,
    owner.address,
    await cbETH.getAddress(),
    await weth.getAddress(),
    await oracle.getAddress(),
    await flashLender.getAddress(),
    await aave3Pool.getAddress(),
    (config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH] as AAVEv3Market).AAVEEModeCategory,
    proxyAdmin,
  );
  const pStrategy = await ethers.getContractAt(
    'StrategyLeverageAAVEv3',
    await proxyStrategy.getAddress(),
  );

  await pStrategy.enableRoute(await cbETH.getAddress(), await weth.getAddress(), {
    provider: 1,
    router: await uniRouter.getAddress(),
    uniV3Tier: config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].swapFeeTier,
    tickSpacing: 0,
  });

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Strategy')),
    await proxyStrategy.getAddress(),
  );
  return {
    cbETH,
    weth,
    owner,
    otherAccount,
    uniRouter,
    serviceRegistry,
    aave3Pool,
    flashLender,
    strategy: pStrategy,
    oracle,
    config,
  };
}
