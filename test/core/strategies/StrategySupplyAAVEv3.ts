import { describeif } from '../../common';

import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import {
  deployVaultRegistry,
  deployStEth,
  deployAaveV3,
  deployWETH,
} from '../../../scripts/common';
describeif(network.name === 'hardhat')('Strategy Supply', function () {
  // Fixture to deploy contracts before each test
  async function deployStrategySupplyFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const AAVE_DEPOSIT = ethers.parseEther('100000');
    const serviceRegistry = await deployVaultRegistry(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
  
    const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
    const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
    await proxyAdmin.waitForDeployment();
    
    const MAX_SUPPLY = ethers.parseUnits('1000000000');
    const WETH = await deployWETH(serviceRegistry);

    const stETH = await deployStEth(serviceRegistry, owner, MAX_SUPPLY);

    // Deposit ETH
    await WETH.deposit?.call('', { value: ethers.parseUnits('10000', 18) });

    // Deposit cbETH 
    await stETH.deposit?.call('', { value: ethers.parseUnits('10000', 18) });
    // Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(stETH, WETH, serviceRegistry, AAVE_DEPOSIT);


    // Deploy StrategySupply contract
    const StrategySupply = await ethers.getContractFactory('StrategySupplyAAVEv3');
    const strategySupply = await StrategySupply.deploy(owner.address, await stETH.getAddress(), await aave3Pool.getAddress());
    await strategySupply.waitForDeployment();
    return { strategySupply, owner, otherAccount, stETH };
  }

  it('should deploy successfully', async () => {
    const { strategySupply } = await loadFixture(deployStrategySupplyFixture);
    expect(await strategySupply.getAddress()).to.be.properAddress;
  });

  it('Contructor', async () => {
    const { strategySupply, stETH, owner } = await loadFixture(deployStrategySupplyFixture);
    expect(await strategySupply.asset()).to.equal(await stETH.getAddress());
    let reserveData = await strategySupply.getReserveData();
    let totalAssets = await strategySupply.totalAssets();
    expect(totalAssets).to.equal(0n);
    expect(await strategySupply.owner()).to.equal(owner.address);
  });

  it('Deploy - 2 stETH', async () => {
    const { strategySupply, stETH } = await loadFixture(deployStrategySupplyFixture);
    const deployAmount = ethers.parseEther("2");
    await stETH.approve(await strategySupply.getAddress(), deployAmount);
    await strategySupply.deploy(deployAmount);
    expect(await stETH.balanceOf(await strategySupply.getAddress())).to.equal(deployAmount);
    expect(await strategySupply.totalAssets()).to.equal(deployAmount);
  });

  it('Deploy revert if caller is not owner', async () => {
    const deployAmount = 10000n * 10n ** 18n;
    const { strategySupply, stETH, otherAccount } = await loadFixture(deployStrategySupplyFixture);
    await expect(strategySupply.connect(otherAccount).deploy(deployAmount)).to.be.revertedWith(
      'Ownable: caller is not the owner',
    );
  });

  it('Deploy revert if amount is 0', async () => {
    const { strategySupply, stETH } = await loadFixture(deployStrategySupplyFixture);
    await expect(strategySupply.deploy(0n)).to.be.revertedWithCustomError(strategySupply, 'ZeroAmount');
  });

  it('Undeploy', async () => {
    const { strategySupply, stETH } = await loadFixture(deployStrategySupplyFixture);
    const deployAmount = 10000n * 10n ** 18n;
    await stETH.approve(await strategySupply.getAddress(), deployAmount);
    await strategySupply.deploy(deployAmount);
    expect(await strategySupply.totalAssets()).to.equal(deployAmount);
    await strategySupply.undeploy(deployAmount);
    expect(await strategySupply.totalAssets()).to.equal(0n);
    expect(await stETH.balanceOf(await strategySupply.getAddress())).to.equal(0n);
  });

  it('Undeploy revert if caller is not owner', async () => {
    const { strategySupply, stETH, otherAccount } = await loadFixture(deployStrategySupplyFixture);
    await expect(
      strategySupply.connect(otherAccount).undeploy(10000n * 10n ** 18n),
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Undeploy revert if amount is 0', async () => {
    const { strategySupply, stETH } = await loadFixture(deployStrategySupplyFixture);
    await expect(strategySupply.undeploy(0n)).to.be.revertedWithCustomError(
      strategySupply,
      'ZeroAmount',
    );
  });

  it('Undeploy revert if amount is greater than deployed amount', async () => {
    const { strategySupply, stETH } = await loadFixture(deployStrategySupplyFixture);
    await expect(strategySupply.undeploy(10000n * 10n ** 18n)).to.be.revertedWithCustomError(
      strategySupply,
      'InsufficientBalance',
    );
  });

  it('Harvest returns profit', async () => {
    const { strategySupply, stETH } = await loadFixture(deployStrategySupplyFixture);
    const deployAmount = 10000n * 10n ** 18n;
    await stETH.approve(await strategySupply.getAddress(), deployAmount);
    await strategySupply.deploy(deployAmount);
    // Artificial profit
    await stETH.transfer(await strategySupply.getAddress(), 1000n * 10n ** 18n);

    await expect(strategySupply.harvest())
      .to.emit(strategySupply, 'StrategyProfit')
      .withArgs(1000n * 10n ** 18n)
      .to.emit(strategySupply, 'StrategyAmountUpdate')
      .withArgs(11000n * 10n ** 18n);
  });
});
