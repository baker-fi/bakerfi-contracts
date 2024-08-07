import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import {
  deployServiceRegistry,
  deployCbETH,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deploySettings,
  deployAAVEv3Strategy,
  deployQuoterV2Mock,
} from '../../scripts/common';

import { describeif } from '../common';
import BaseConfig, { NetworkConfig } from '../../constants/network-deploy-config';

/**
 * StrategyAAVEv3 Unit Tests
 */
describeif(network.name === 'hardhat')
('Strategy Leverage AAVEv3', function () {
  it('Test Initialized Strategy', async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    expect(await strategy.getPosition([0, 0])).to.deep.equal([0n, 0n, 0n]);
    expect(await strategy.totalAssets([0, 0])).to.equal(0);
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
      105345072829122560000000n,
      82382400483102720000000n,
      782024239n,
    ]);
    expect(await strategy.totalAssets([0, 0])).to.equal(9962113816060668112n);
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
      105345072829122560000000n,
      82382400483102720000000n,
      782024239n,
    ]);
    expect(await strategy.totalAssets([0, 0])).to.equal(9962113816060668112n);
    // Receive ~=5 ETH
    await expect(
      strategy.undeploy(ethers.parseUnits('5', 18)),
      // @ts-ignore
    ).to.changeTokenBalances(weth, [owner.address], [4983156389718359984n]);
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
    const { oracle, weth, otherAccount, aave3Pool, strategy } = await loadFixture(deployFunction);

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
    const { owner, serviceRegistry, otherAccount, aave3Pool, config } = await loadFixture(
      deployFunction,
    );
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
      await serviceRegistry.getAddress(),
      'cbETH',
      'WETH',
      'cbETH/USD Oracle',
      'ETH/USD Oracle',
      config.swapFeeTier,
      config.AAVEEModeCategory,
      proxyAdmin,
    );
    const pStrategy = await ethers.getContractAt(
      'StrategyAAVEv3',
      await proxyStrategy.getAddress(),
    );

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
    const { weth, owner, serviceRegistry, otherAccount, aave3Pool, config } = await loadFixture(
      deployFunction,
    );
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
      await serviceRegistry.getAddress(),
      'cbETH',
      'WETH',
      'cbETH/USD Oracle',
      'ETH/USD Oracle',
      config.swapFeeTier,
      config.AAVEEModeCategory,
      proxyAdmin,
    );
    const pStrategy = await ethers.getContractAt(
      'StrategyAAVEv3',
      await proxyStrategy.getAddress(),
    );

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
    const { weth, serviceRegistry, strategy } = await loadFixture(deployFunction);

    const BorrowerAttacker = await ethers.getContractFactory('BorrowerAttacker');
    const attacker = await BorrowerAttacker.deploy();
    await attacker.initialize(await serviceRegistry.getAddress());

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
    const { weth, serviceRegistry, settings, strategy, oracle, ethOracle } = await loadFixture(
      deployFunction,
    );
    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    // Deposit 10 ETH
    await strategy.deploy(amount);
    await settings.setRebalancePriceMaxAge(60);
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
      105345072829122560000000n,
      82382400483102720000000n,
      782024239n,
    ]);

    expect(await strategy.totalAssets([0, 0])).to.equal(9962113816060668112n);

    // Decremennt the Collateral value by 10%
    await oracle.setLatestPrice(ethers.parseUnits('2606', 18));

    await expect(strategy.harvest())
      // @ts-ignore
      .to.emit(strategy, 'StrategyLoss')
      .withArgs(927802249567403037n);

    expect(await strategy.getPosition([0, 0])).to.deep.equal([
      103206488643869696000000n,
      82382400483102720000000n,
      798228886n,
    ]);

    expect(await strategy.totalAssets([0, 0])).to.equal(9034311566493265075n);
  });

  it('Harvest - Debt Adjust', async function () {
    const { owner, settings, weth, oracle, strategy, aave3Pool } = await loadFixture(
      deployFunction,
    );

    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    await strategy.deploy(amount);
    // Descrease the Collateral value by 20%
    await oracle.setLatestPrice(ethers.parseUnits('2394', 18));
    await strategy.setMaxLoanToValue(800 * 1e6);

    expect(await strategy.getPosition([0, 0])).to.deep.equal([
      94810565546210304000000n,
      82382400483102720000000n,
      868915821n,
    ]);

    await expect(strategy.harvest())
      // @ts-ignore
      .to.emit(strategy, 'StrategyAmountUpdate')
      .withArgs(5391828660784201301n);

    expect(await strategy.getPosition([0, 0])).to.deep.equal([
      65379801144452702660802n,
      49712660252430335986000n,
      760367259n,
    ]);

    expect(await strategy.totalAssets([0, 0])).to.equal(6797024248165885759n);
  });

  it('Harvest Loss - Collateral Value is lower than debt', async function () {
    const { owner, settings, weth, oracle, strategy, aave3Pool } = await loadFixture(
      deployFunction,
    );

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
    const { weth, serviceRegistry, settings, strategy, oracle, ethOracle } = await loadFixture(
      deployFunction,
    );
    // Deposit 10 ETH
    const amount = ethers.parseUnits('10', 18);
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await strategy.getAddress(), amount);

    await strategy.deploy(amount);
    await settings.setRebalancePriceMaxAge(4800);
    // advance time by one hour and mine a new block
    await time.increase(3600);
    await strategy.harvest();
    expect(true).to.be.equal(true);
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
  const serviceRegistry = await deployServiceRegistry(owner.address);
  const serviceRegistryAddress = await serviceRegistry.getAddress();

  const weth = await deployWETH(serviceRegistry);
  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

  const { proxy: settingsProxy } = await deploySettings(owner.address, serviceRegistry, proxyAdmin);
  const pSettings = await ethers.getContractAt('Settings', await settingsProxy.getAddress());

  // 1. Deploy Flash Lender
  const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
  // 2. Deploy cbEBT
  const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

  // Deploy cbETH -> ETH Uniswap Router
  const UniRouter = await ethers.getContractFactory('UniV3RouterMock');
  const uniRouter = await UniRouter.deploy(await weth.getAddress(), await cbETH.getAddress());

  await uniRouter.setPrice(8665 * 1e5);
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

  const oracle = await deployOracleMock(serviceRegistry, 'cbETH/USD Oracle');
  const ethOracle = await deployOracleMock(serviceRegistry, 'ETH/USD Oracle');

  await oracle.setLatestPrice(ethers.parseUnits('2660', 18));

  await ethOracle.setLatestPrice(ethers.parseUnits('2305', 18));

  await deployQuoterV2Mock(serviceRegistry);

  const { proxy: proxyStrategy } = await deployAAVEv3Strategy(
    owner.address,
    owner.address,
    serviceRegistryAddress,
    'cbETH',
    'WETH',
    'cbETH/USD Oracle',
    'ETH/USD Oracle',
    config.swapFeeTier,
    config.AAVEEModeCategory,
    proxyAdmin,
  );
  const pStrategy = await ethers.getContractAt('StrategyAAVEv3', await proxyStrategy.getAddress());

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Strategy')),
    await proxyStrategy.getAddress(),
  );
  return {
    cbETH,
    weth,
    owner,
    otherAccount,
    serviceRegistry,
    aave3Pool,
    flashLender,
    strategy: pStrategy,
    oracle,
    ethOracle,
    settings: pSettings,
    config,
  };
}
