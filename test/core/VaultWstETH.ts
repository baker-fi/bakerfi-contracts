import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import {
  deployServiceRegistry,
  deployVault,
  deployStEth,
  deployWStEth,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deployStrategyAAVEv3WstETH,
  deploySettings,
  deployQuoterV2Mock,
} from '../../scripts/common';
import BaseConfig, { NetworkConfig } from '../../constants/network-deploy-config';

/**
 * Unit Tests for BakerFi Vault with a regular AAVEv3StrategyWstETH
 * This strategy uses Lido Contracts for asset wrapping and conversion
 */

describeif(network.name === 'hardhat')('BakerFi Vault Main Net wstETH/ETH', function () {
  it('Vault Initilization', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    expect(await vault.symbol()).to.equal('brETH');
    expect(await vault.balanceOf(owner.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[2]).to.equal(0);
    expect(await vault.tokenPerAsset()).to.equal(ethers.parseUnits('1', 18));
  });

  it('Deposit 10TH', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('10', 18);
    const tx = vault.depositNative(owner.address, { value: depositAmount });
    await expect(tx)
      // @ts-ignore
      .to.emit(vault, 'Deposit')
      .withArgs(owner.address, owner.address, ethers.parseUnits('10', 18), 9962113816060668112n);
    // @ts-ignore
    await expect(tx).to.changeEtherBalances([owner.address], [-ethers.parseUnits('10', 18)]);

    expect(await vault.symbol()).to.equal('brETH');
    expect(await vault.name()).to.equal('Bread ETH');
    expect(await vault.balanceOf(owner.address)).to.equal(9962113816060668112n);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(105345072829122560000000n);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(82382400483102720000000n);
    expect(await vault.totalAssets()).to.equal(9962113816060668112n);
    expect((await strategy.getPosition([0, 0]))[2]).to.equal(782024239);
    expect(await vault.totalSupply()).to.equal(9962113816060668112n);
    expect(await vault.tokenPerAsset()).to.equal(1000000000000000000n);
  });

  it('Withdraw - 1 brETH', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits('10', 18);

    await vault.depositNative(owner.address, {
      value: depositAmount,
    });

    await vault.approve(vault.getAddress(), ethers.parseUnits('1', 18));
    const tx = vault.redeemNative(ethers.parseUnits('1', 18));
    await expect(tx)
      // @ts-ignore
      .to.emit(vault, 'Withdraw')
      .withArgs(
        owner.address,
        owner.address,
        owner.address,
        996631271986539460n,
        ethers.parseUnits('1', 18),
      );
    // @ts-ignore
    await expect(tx).to.changeEtherBalances([owner.address], [996631271986539460n]);
    expect(await vault.balanceOf(owner.address)).to.equal(8962113816060668112n);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(94770502604323243031740n);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(74112830243123923070780n);
    expect(await vault.totalAssets()).to.equal(8962113822646125796n);
    expect((await strategy.getPosition([0, 0]))[2]).to.equal(782024239n);
    expect(await vault.totalSupply()).to.equal(8962113816060668112n);
    expect(await vault.tokenPerAsset()).to.equal(999999999265189238n);
  });

  it('Deposit - 0 ETH', async function () {
    const { owner, vault } = await loadFixture(deployFunction);

    await expect(
      vault.depositNative(owner.address, {
        value: ethers.parseUnits('0', 18),
      }),
    ).to.be.revertedWithCustomError(vault, 'InvalidDepositAmount');
  });

  it('Withdraw failed not enough brETH', async function () {
    const { owner, vault } = await loadFixture(deployFunction);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    await vault.approve(vault.getAddress(), ethers.parseUnits('20', 18));
    await expect(vault.redeemNative(ethers.parseUnits('20', 18))).to.be.revertedWithCustomError(
      vault,
      'NotEnoughBalanceToWithdraw',
    );
  });

  it('Transfer 10 brETH', async function () {
    const { owner, vault, otherAccount } = await loadFixture(deployFunction);
    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });
    // @ts-ignore
    expect(vault.transfer(1000, otherAccount.address)).to.changeTokenBalances(
      vault,
      [owner.address, otherAccount.address],
      [-1000, 1000],
    );
  });

  it('Harvest Profit on Rebalance', async function () {
    const { owner, vault, oracle, otherAccount, strategy, settings } = await loadFixture(
      deployFunction,
    );
    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    expect(await vault.totalAssets()).to.equal(9962113816060668112n);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(105345072829122560000000n);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(82382400483102720000000n);
    // =~1% Increase in Value
    await oracle.setLatestPrice(ethers.parseUnits('2686', 18));

    expect(await vault.totalAssets()).to.equal(10408833417704232537n);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(106374761510910976000000n);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(82382400483102720000000n);
    await settings.setFeeReceiver(otherAccount.address);
    await expect(vault.rebalance())
      // @ts-ignore
      .to.emit(vault, 'Transfer')
      .withArgs(
        '0x0000000000000000000000000000000000000000',
        otherAccount.address,
        4275475777976300n,
      );
    expect(await vault.balanceOf(otherAccount.address)).to.equal(4275475777976300n);
  });

  it('Withdraw With Service Fees', async function () {
    const { owner, vault, settings, otherAccount } = await loadFixture(deployFunction);

    const provider = ethers.provider;
    const depositAmount = ethers.parseUnits('10', 18);

    await settings.setFeeReceiver(otherAccount.address);
    expect(await settings.getFeeReceiver()).to.equal(otherAccount.address);
    await vault.depositNative(owner.address, {
      value: depositAmount,
    });

    await vault.approve(vault.getAddress(), ethers.parseUnits('1', 18));
    await vault.redeemNative(ethers.parseUnits('1', 18));

    expect(await provider.getBalance(otherAccount.address)).to.greaterThan(
      // @ts-ignore
      1000000000877192792268345n,
    );
  });

  it('Withdraw - Burn all brETH', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    const provider = ethers.provider;
    const balanceOf = await vault.balanceOf(owner.address);
    const balanceBefore = await provider.getBalance(owner.address);
    await vault.approve(vault.getAddress(), balanceOf);
    await vault.redeemNative(balanceOf);
    const balanceAfter = await provider.getBalance(owner.address);

    expect(await vault.balanceOf(owner.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(0);
    expect(balanceAfter - balanceBefore).to.greaterThan(
      // @ts-ignore
      ethers.parseUnits('9', 18),
    );
    expect((await strategy.getPosition([0, 0]))[2]).to.equal(0);
    expect(await vault.tokenPerAsset()).to.equal(ethers.parseUnits('1', 18));
  });

  it('Withdraw - Burn all brETH except 10', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    const provider = ethers.provider;
    const balanceOf = await vault.balanceOf(owner.address);
    const balanceBefore = await provider.getBalance(owner.address);
    await vault.approve(vault.getAddress(), balanceOf);

    await expect(vault.redeemNative(balanceOf - 10n))
      // @ts-ignore
      .to.be.revertedWithCustomError(vault, 'InvalidShareBalance');
  });

  it('Withdraw - a withdraw that reaches the minimum shares should fail', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    const balanceOf = await vault.balanceOf(owner.address);
    await expect(vault.redeemNative(balanceOf - 100n))
      // @ts-ignore
      .to.be.revertedWithCustomError(vault, 'InvalidShareBalance');
  });

  it('Deposit with No Flash Loan Fees', async () => {
    const { owner, vault, strategy, flashLender } = await loadFixture(deployFunction);

    await flashLender.setFlashLoanFee(0);
    const depositAmount = ethers.parseUnits('10', 18);

    await vault.depositNative(owner.address, {
      value: depositAmount,
    });

    expect(await vault.balanceOf(owner.address)).to.equal(9997818848764668112n);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(105345072829122560000000n);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(82300100382720000000000n);
    expect(await vault.totalAssets()).to.equal(9997818848764668112n);
    expect((await strategy.getPosition([0, 0]))[2]).to.equal(781242996n);
    expect(await vault.totalSupply()).to.equal(9997818848764668112n);
    expect(await vault.tokenPerAsset()).to.equal(1000000000000000000n);
  });

  it('Withdraw with No Flash Loan Fees', async () => {
    const { owner, vault, flashLender } = await loadFixture(deployFunction);

    await flashLender.setFlashLoanFee(0);
    const depositAmount = ethers.parseUnits('10', 18);

    await vault.depositNative(owner.address, {
      value: depositAmount,
    });
    const tx = vault.redeemNative(ethers.parseUnits('5', 18));
    await expect(tx)
      // @ts-ignore
      .to.emit(vault, 'Withdraw')
      .withArgs(
        '0xf15CC0ccBdDA041e2508B829541917823222F364',
        '0xf15CC0ccBdDA041e2508B829541917823222F364',
        '0xf15CC0ccBdDA041e2508B829541917823222F364',
        5001090809999999999n,
        5000000000000000000n,
      );
    // @ts-ignore
    await expect(tx).to.changeEtherBalances([owner.address], [5001090809999999999n]);
  });

  it('Adjust Debt with No Flash Loan Fees', async () => {
    const { owner, vault, wstETH, weth, strategy, oracle, aave3Pool } = await loadFixture(
      deployFunction,
    );
    const depositAmount = ethers.parseUnits('10', 18);
    await vault.depositNative(owner.address, {
      value: depositAmount,
    });

    await strategy.setMaxSlippage(5 * 1e7);

    await oracle.setLatestPrice(ethers.parseUnits('2394', 18));
    await strategy.setMaxLoanToValue(800 * 1e6);

    await expect(vault.rebalance())
      // @ts-ignore
      .to.emit(aave3Pool, 'Repay')
      .withArgs(
        await weth.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        14173423093567194800n,
        false,
      )
      .to.emit(aave3Pool, 'Withdraw')
      .withArgs(
        await wstETH.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        14328833434505431585n,
      );

    expect(await vault.totalAssets()).to.equal(6797024248165885759n);
  });

  it.skip('Withdraw - Invalid Receiver', async () => {
    const { owner, vault } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('10', 18);
    await vault.depositNative(owner.address, {
      value: depositAmount,
    });

    await expect(
      vault.redeemNative(ethers.parseUnits('1', 18), '0x0000000000000000000000000000000000000000'),
    ).to.be.revertedWith('Invalid Receiver');
  });

  it('Rebalance - no balance', async () => {
    const { owner, vault } = await loadFixture(deployFunction);
    await vault.rebalance();
    expect(true).to.equal(true);
  });

  it('Withdraw - Invalid Receiver', async () => {
    const { owner, vault } = await loadFixture(deployFunction);

    for (let i = 0; i < 10; i++) {
      await vault.depositNative(owner.address, {
        value: ethers.parseUnits('1', 18),
      });
      const balance = await vault.balanceOf(owner.address);
      await vault.redeemNative((balance * BigInt(Math.floor(Math.random() * 199 + 1))) / 200n);
    }
    expect(true).to.equal(true);
  });

  it('Deposit - Account not allowed', async () => {
    const { owner, vault, settings, otherAccount } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('10', 18);

    await settings.enableAccount(otherAccount.address, true);

    await expect(
      vault.depositNative(owner.address, {
        value: depositAmount,
      }),
      // @ts-ignore
    ).to.be.revertedWithCustomError(vault, 'NoPermissions');
  });

  it('Withdraw - Account not allowed', async () => {
    const { owner, vault, settings, otherAccount } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('10', 18);

    await vault.depositNative(owner.address, {
      value: depositAmount,
    });

    await settings.enableAccount(otherAccount.address, true);

    await expect(vault.redeemNative(ethers.parseUnits('1', 18))).to.be.revertedWithCustomError(
      vault,
      'NoPermissions',
    );
  });

  // Mocked Strategy
  it('Deposit 10 Wei - should fail no mininum share balance reached', async () => {
    const { owner, vault } = await loadFixture(deployWithMockStrategyFunction);
    await expect(
      vault.depositNative(owner.address, {
        value: 10,
      }),
      // @ts-ignore
    ).to.be.revertedWithCustomError(vault, 'InvalidShareBalance');
  });

  it('Deposit - Fails Deposit when debt is higher than collateral ', async () => {
    const { owner, vault, strategy } = await loadFixture(deployWithMockStrategyFunction);

    const depositAmount = ethers.parseUnits('10', 18);
    await vault.depositNative(owner.address, {
      value: depositAmount,
    });

    await strategy.setRatio(110);

    await expect(vault.redeemNative(ethers.parseUnits('1', 18))).to.be.revertedWithCustomError(
      vault,
      'NoAssetsToWithdraw',
    );
  });

  it('Rebalance - Generates Revenue ', async () => {
    const { owner, vault, strategy, settings, otherAccount } = await loadFixture(
      deployWithMockStrategyFunction,
    );
    await vault.depositNative(owner.address, {
      value: 10000,
    });

    expect(await vault.totalAssets()).to.equal(5000);
    expect(await vault.totalSupply()).to.equal(10000);

    await settings.setFeeReceiver(otherAccount.address);
    await settings.setPerformanceFee(100 * 1e6);
    await strategy.setHarvestPerCall(1000);

    await expect(vault.rebalance())
      // @ts-ignore
      .to.emit(vault, 'Transfer')
      .withArgs('0x0000000000000000000000000000000000000000', otherAccount.address, 200);
    expect(await vault.totalSupply()).to.equal(10200);
  });

  it('Rebalance - Assets on Uncollateralized positions ', async () => {
    const { owner, vault, strategy } = await loadFixture(deployWithMockStrategyFunction);
    await vault.depositNative(owner.address, {
      value: 10000,
    });
    await strategy.setRatio(110);
    expect(await vault.totalAssets()).to.equal(0n);
    expect(await vault.convertToShares(10)).to.equal(10n);
    expect(await vault.convertToAssets(10)).to.equal(0n);
  });

  it('Deposit - Success Deposit When the value is under the max', async () => {
    const { owner, vault, settings } = await loadFixture(deployFunction);
    await settings.setMaxDepositInETH(ethers.parseUnits('1', 18));
    const depositAmount = ethers.parseUnits('1', 17);
    expect(await vault.depositNative(owner.address, { value: depositAmount }));
    expect(await vault.balanceOf(owner.address)).to.equal(99621138160606681n);
  });

  it('Deposit - Failed Deposit When the value is over the max', async () => {
    const { owner, vault, settings } = await loadFixture(deployFunction);
    await settings.setMaxDepositInETH(ethers.parseUnits('1', 18));
    const depositAmount = ethers.parseUnits('10', 18);
    await expect(
      vault.depositNative(owner.address, { value: depositAmount }),
    ).to.be.revertedWithCustomError(vault, 'MaxDepositReached');
  });

  it('Deposit - Failed Deposit When the second deposit exceeds the max', async () => {
    const { owner, vault, settings } = await loadFixture(deployFunction);
    await settings.setMaxDepositInETH(ethers.parseUnits('1', 18));

    expect(
      await vault.depositNative(owner.address, {
        value: ethers.parseUnits('5', 17),
      }),
    );
    expect(await vault.balanceOf(owner.address)).to.equal(498105690803033405n);
    await expect(
      vault.depositNative(owner.address, { value: ethers.parseUnits('6', 17) }),
    ).to.be.revertedWithCustomError(vault, 'MaxDepositReached');
  });

  it('Deposit - Success Deposit When the value is under the max', async () => {
    const { owner, vault, settings } = await loadFixture(deployFunction);
    await settings.setMaxDepositInETH(ethers.parseUnits('1', 18));
    const depositAmount = ethers.parseUnits('1', 17);
    expect(await vault.depositNative(owner.address, { value: depositAmount }));
    expect(await vault.balanceOf(owner.address)).to.equal(99621138160606681n);
    expect(await vault.depositNative(owner.address, { value: depositAmount }));
    expect(await vault.balanceOf(owner.address)).to.equal(199242276321213362n);
    expect(await vault.depositNative(owner.address, { value: depositAmount }));
    expect(await vault.balanceOf(owner.address)).to.equal(298863414481820043n);
  });
});

/**
 * Deploy Test Function With a Real Strategy
 * @returns
 */
async function deployFunction() {
  const networkName = network.name;
  const config: NetworkConfig = BaseConfig[networkName];
  const [owner, otherAccount, anotherAccount] = await ethers.getSigners();
  const STETH_MAX_SUPPLY = ethers.parseUnits('1000010000', 18);
  const STETH_TO_WRAPPER = ethers.parseUnits('10000', 18);
  const FLASH_LENDER_DEPOSIT = ethers.parseUnits('10000', 18);
  const AAVE_DEPOSIT = ethers.parseUnits('10000', 18);
  const serviceRegistry = await deployServiceRegistry(owner.address);
  const serviceRegistryAddress = await serviceRegistry.getAddress();
  const weth = await deployWETH(serviceRegistry);
  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

  // 1. Deploy Flash Lender
  const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
  // 2. Deploy stETH
  const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
  // 3. Deploy wstETH
  const wstETH = await deployWStEth(serviceRegistry, await stETH.getAddress());
  await stETH.transfer(await wstETH.getAddress(), STETH_TO_WRAPPER);
  const UniRouter = await ethers.getContractFactory('UniV3RouterMock');
  const uniRouter = await UniRouter.deploy(await weth.getAddress(), await wstETH.getAddress());

  // Register Uniswap Router
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Uniswap Router')),
    await uniRouter.getAddress(),
  );

  await uniRouter.setPrice(8665 * 1e5);

  const { proxy: settingsProxy } = await deploySettings(owner.address, serviceRegistry, proxyAdmin);
  const pSettings = await ethers.getContractAt('Settings', await settingsProxy.getAddress());
  // Deposit some WETH on Swapper
  await weth.deposit?.call('', { value: ethers.parseUnits('10000', 18) });
  await weth.transfer(await uniRouter.getAddress(), ethers.parseUnits('10000', 18));
  // 5. Deploy AAVEv3 Mock Pool
  const aave3Pool = await deployAaveV3(wstETH, weth, serviceRegistry, AAVE_DEPOSIT);
  // 6. Deploy wstETH/ETH Oracle
  const oracle = await deployOracleMock(serviceRegistry, 'wstETH/USD Oracle');
  await deployQuoterV2Mock(serviceRegistry);
  const ethOracle = await deployOracleMock(serviceRegistry, 'ETH/USD Oracle');

  await oracle.setLatestPrice(ethers.parseUnits('2660', 18));
  await ethOracle.setLatestPrice(ethers.parseUnits('2305', 18));
  await oracle.setDecimals(18);
  await ethOracle.setDecimals(18);
  const { proxy: proxyStrategy } = await deployStrategyAAVEv3WstETH(
    owner.address,
    owner.address,
    serviceRegistryAddress,
    config.swapFeeTier,
    config.AAVEEModeCategory,
    proxyAdmin,
  );

  const pStrategy = await ethers.getContractAt(
    'StrategyAAVEv3WstETH',
    await proxyStrategy.getAddress(),
  );

  const { proxy } = await deployVault(
    owner.address,
    'Bread ETH',
    'brETH',
    serviceRegistryAddress,
    await proxyStrategy.getAddress(),
    proxyAdmin,
  );

  const pVault = await ethers.getContractAt('Vault', await proxy.getAddress());

  await pStrategy.transferOwnership(await proxy.getAddress());
  return {
    stETH,
    weth,
    owner,
    otherAccount,
    anotherAccount,
    serviceRegistry,
    vault: pVault,
    uniRouter,
    aave3Pool,
    flashLender,
    wstETH,
    oracle,
    strategy: pStrategy,
    settings: pSettings,
    config,
  };
}

async function deployWithMockStrategyFunction() {
  const [owner, otherAccount] = await ethers.getSigners();
  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');

  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();
  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const Vault = await ethers.getContractFactory('Vault');
  const vault = await Vault.deploy();
  await vault.waitForDeployment();

  const serviceRegistry = await deployServiceRegistry(owner.address);
  const weth = await deployWETH(serviceRegistry);
  const { proxy: settingsProxy } = await deploySettings(owner.address, serviceRegistry, proxyAdmin);
  const pSettings = await ethers.getContractAt('Settings', await settingsProxy.getAddress());

  const StrategyMock = await ethers.getContractFactory('StrategyMock');
  const strategy = await StrategyMock.deploy(await weth.getAddress());
  await strategy.waitForDeployment();

  const proxy = await BakerFiProxy.deploy(
    await vault.getAddress(),
    await proxyAdmin.getAddress(),
    Vault.interface.encodeFunctionData('initialize', [
      owner.address,
      'Bread ETH',
      'brETH',
      await serviceRegistry.getAddress(),
      await strategy.getAddress(),
    ]),
  );
  await proxy.waitForDeployment();
  await strategy.waitForDeployment();
  const pVault = await ethers.getContractAt('Vault', await proxy.getAddress());
  return { owner, weth, otherAccount, settings: pSettings, vault: pVault, strategy };
}
