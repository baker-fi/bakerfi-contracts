import { describeif } from '../../common';

import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { deployMockERC20, deployOracleMock, deployUniV3RouterMock } from '../../../scripts/common';

describeif(network.name === 'hardhat')('Strategy Swap and Park', function () {
  it('Initialization', async function () {
    const { strategySwapAndPark, owner, oracle, usdc, tkai, uniV3Router } = await loadFixture(
      deployFixture,
    );
    expect(await strategySwapAndPark.owner()).to.equal(owner.address);
    expect(await strategySwapAndPark.asset()).to.equal(await usdc.getAddress());
    expect(await strategySwapAndPark.underlyingAsset()).to.equal(await tkai.getAddress());
    expect(await strategySwapAndPark.feeTier()).to.equal(3000);
    expect(await strategySwapAndPark.oracle()).to.equal(await oracle.getAddress());
    expect(await strategySwapAndPark.uniRouter()).to.equal(await uniV3Router.getAddress());
  });

  it('Deploy 1000 USDC', async function () {
    const { strategySwapAndPark, strategyPark, usdc, tkai, owner } = await loadFixture(
      deployFixture,
    );
    const deployAmount = 1000n * 10n ** 18n;
    await usdc.approve(await strategySwapAndPark.getAddress(), deployAmount);
    await expect(strategySwapAndPark.deploy(deployAmount))
      .to.emit(strategySwapAndPark, 'StrategyDeploy')
      .withArgs(owner.address, deployAmount)
      .to.emit(strategySwapAndPark, 'StrategyAmountUpdate')
      .withArgs(100000n * 10n ** 18n);
    expect(await usdc.balanceOf(await strategySwapAndPark.getAddress())).to.equal(0n);
    expect(await tkai.balanceOf(await strategyPark.getAddress())).to.equal(100000n * 10n ** 18n);
    expect(await strategySwapAndPark.totalAssets()).to.equal(1000n * 10n ** 18n);
  });

  it('Deploy 1000 USDC with slippage', async function () {
    const { strategySwapAndPark, strategyPark, usdc, tkai, owner } = await loadFixture(
      deployFixture,
    );
    const deployAmount = 1000n * 10n ** 18n;
    await usdc.approve(await strategySwapAndPark.getAddress(), deployAmount);
    await expect(strategySwapAndPark.deploy(deployAmount)).to.changeTokenBalance(
      tkai,
      await strategyPark.getAddress(),
      100000n * 10n ** 18n,
    );
    expect(await usdc.balanceOf(await strategySwapAndPark.getAddress())).to.equal(0n);
    expect(await tkai.balanceOf(await strategyPark.getAddress())).to.equal(100000n * 10n ** 18n);
    expect(await strategySwapAndPark.totalAssets()).to.equal(1000n * 10n ** 18n);
  });

  it('Undeploy 1000 USDC', async function () {
    const { strategySwapAndPark, usdc, tkai, owner } = await loadFixture(deployFixture);
    const deployAmount = 1000n * 10n ** 18n;
    await usdc.approve(await strategySwapAndPark.getAddress(), deployAmount);
    await strategySwapAndPark.deploy(deployAmount);
    await expect(strategySwapAndPark.undeploy(deployAmount))
      .to.emit(strategySwapAndPark, 'StrategyUndeploy')
      .withArgs(owner.address, deployAmount)
      .to.emit(strategySwapAndPark, 'StrategyAmountUpdate')
      .withArgs(0n);
    expect(await tkai.balanceOf(await strategySwapAndPark.getAddress())).to.equal(0n);
    expect(await strategySwapAndPark.totalAssets()).to.equal(0n);
  });

  it('Undeploy 1000 USDC with slippage', async function () {
    const { strategySwapAndPark, usdc, owner } = await loadFixture(deployFixture);
    const deployAmount = 1000n * 10n ** 18n;
    await usdc.approve(await strategySwapAndPark.getAddress(), deployAmount);
    await strategySwapAndPark.deploy(deployAmount);
    await strategySwapAndPark.setMaxSlippage(5n * 10n ** 7n); // 0.005 USDC
    await expect(strategySwapAndPark.undeploy(deployAmount)).to.changeTokenBalance(
      usdc,
      owner.address,
      1000n * 10n ** 18n,
    );
  });

  it('Harvest wih no profit', async function () {
    const { strategySwapAndPark, usdc, tkai } = await loadFixture(deployFixture);
    const deployAmount = 1000n * 10n ** 18n;
    await usdc.approve(await strategySwapAndPark.getAddress(), deployAmount);
    await strategySwapAndPark.deploy(deployAmount);
    await strategySwapAndPark.harvest();
    expect(await strategySwapAndPark.totalAssets()).to.equal(1000n * 10n ** 18n);
  });

  it('Harvest wih no assets', async function () {
    const { strategySwapAndPark } = await loadFixture(deployFixture);
    await strategySwapAndPark.harvest();
    expect(await strategySwapAndPark.totalAssets()).to.equal(0n);
  });

  it('Harvest fails if not owner', async function () {
    const { strategyPark, otherAccount } = await loadFixture(deployFixture);
    await expect(strategyPark.connect(otherAccount).harvest()).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  async function deployFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const usdc = await deployMockERC20(
      'USDC',
      'USDC',
      // 10M USDC
      10000000n * 10n ** 18n,
      owner.address,
    );

    const tkai = await deployMockERC20(
      'TKAI',
      'TKASI',
      // 300M TKAI
      300000000n * 10n ** 18n,
      owner.address,
    );

    const oracle = await deployOracleMock();
    // 1TKAI = 0.01 USDC
    await oracle.setDecimals(18);
    await oracle.setLatestPrice(1n * 10n ** 16n);

    const uniV3Router = await deployUniV3RouterMock(
      usdc,
      100000n * 10n ** 18n,
      tkai,
      30000000n * 10n ** 18n, // 3M TKAI
    );

    // 1TKAI = 0.01 USDC
    await uniV3Router.setPrice(1n * 10n ** 11n);

    const StrategyPark = await ethers.getContractFactory('StrategyPark');

    const strategyPark = await StrategyPark.deploy(owner.address, await tkai.getAddress());

    // Deploy StrategyPark contract
    const StrategyUniV3SwapAnd = await ethers.getContractFactory('StrategyUniV3SwapAnd');

    const strategySwapAndPark = await StrategyUniV3SwapAnd.deploy(
      owner.address,
      await usdc.getAddress(),
      await strategyPark.getAddress(),
      await oracle.getAddress(),
      await uniV3Router.getAddress(),
      3000,
    );
    await strategyPark.waitForDeployment();
    await strategySwapAndPark.waitForDeployment();

    await strategyPark.transferOwnership(await strategySwapAndPark.getAddress());
    return {
      strategySwapAndPark,
      strategyPark,
      owner,
      oracle,
      otherAccount,
      usdc,
      tkai,
      uniV3Router,
    };
  }
});
