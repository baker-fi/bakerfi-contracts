import { describeif } from '../../common';

import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { deployMockERC20 } from '../../../scripts/common';

describeif(network.name === 'hardhat')('Strategy Park', function () {
  // Fixture to deploy contracts before each test
  async function deployStrategyParkFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const usdc = await deployMockERC20(
      'USDC',
      'USDC',
      // 10M USDC
      10000000n * 10n ** 18n,
      owner.address,
    );

    // Deploy StrategyPark contract
    const StrategyPark = await ethers.getContractFactory('StrategyPark');
    const strategyPark = await StrategyPark.deploy(owner.address, await usdc.getAddress());
    await strategyPark.waitForDeployment();
    return { strategyPark, owner, otherAccount, usdc };
  }

  it('should deploy successfully', async () => {
    const { strategyPark } = await loadFixture(deployStrategyParkFixture);
    expect(await strategyPark.getAddress()).to.be.properAddress;
  });

  it('Contructor', async () => {
    const { strategyPark, usdc, owner } = await loadFixture(deployStrategyParkFixture);
    expect(await strategyPark.asset()).to.equal(await usdc.getAddress());
    expect(await strategyPark.totalAssets()).to.equal(0n);
    expect(await strategyPark.owner()).to.equal(owner.address);
  });

  it('Deploy - 10K USDC', async () => {
    const { strategyPark, usdc } = await loadFixture(deployStrategyParkFixture);
    const deployAmount = 10000n * 10n ** 18n;
    await usdc.approve(await strategyPark.getAddress(), deployAmount);
    await strategyPark.deploy(deployAmount);
    expect(await usdc.balanceOf(await strategyPark.getAddress())).to.equal(deployAmount);
    expect(await strategyPark.totalAssets()).to.equal(deployAmount);
  });

  it('Deploy revert if caller is not owner', async () => {
    const deployAmount = 10000n * 10n ** 18n;
    const { strategyPark, usdc, otherAccount } = await loadFixture(deployStrategyParkFixture);
    await expect(strategyPark.connect(otherAccount).deploy(deployAmount)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Deploy revert if amount is 0', async () => {
    const { strategyPark, usdc } = await loadFixture(deployStrategyParkFixture);
    await expect(strategyPark.deploy(0n)).to.be.revertedWithCustomError(strategyPark, 'ZeroAmount');
  });

  it('Undeploy', async () => {
    const { strategyPark, usdc } = await loadFixture(deployStrategyParkFixture);
    const deployAmount = 10000n * 10n ** 18n;
    await usdc.approve(await strategyPark.getAddress(), deployAmount);
    await strategyPark.deploy(deployAmount);
    expect(await strategyPark.totalAssets()).to.equal(deployAmount);
    await strategyPark.undeploy(deployAmount);
    expect(await strategyPark.totalAssets()).to.equal(0n);
    expect(await usdc.balanceOf(await strategyPark.getAddress())).to.equal(0n);
  });

  it('Undeploy revert if caller is not owner', async () => {
    const { strategyPark, usdc, otherAccount } = await loadFixture(deployStrategyParkFixture);
    await expect(
      strategyPark.connect(otherAccount).undeploy(10000n * 10n ** 18n),
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Undeploy revert if amount is 0', async () => {
    const { strategyPark, usdc } = await loadFixture(deployStrategyParkFixture);
    await expect(strategyPark.undeploy(0n)).to.be.revertedWithCustomError(
      strategyPark,
      'ZeroAmount',
    );
  });

  it('Undeploy revert if amount is greater than deployed amount', async () => {
    const { strategyPark, usdc } = await loadFixture(deployStrategyParkFixture);
    await expect(strategyPark.undeploy(10000n * 10n ** 18n)).to.be.revertedWithCustomError(
      strategyPark,
      'InsufficientBalance',
    );
  });

  it('Harvest returns profit', async () => {
    const { strategyPark, usdc } = await loadFixture(deployStrategyParkFixture);
    const deployAmount = 10000n * 10n ** 18n;
    await usdc.approve(await strategyPark.getAddress(), deployAmount);
    await strategyPark.deploy(deployAmount);
    // Artificial profit
    await usdc.transfer(await strategyPark.getAddress(), 1000n * 10n ** 18n);

    await expect(strategyPark.harvest())
      .to.emit(strategyPark, 'StrategyProfit')
      .withArgs(1000n * 10n ** 18n)
      .to.emit(strategyPark, 'StrategyAmountUpdate')
      .withArgs(11000n * 10n ** 18n);
  });
});
