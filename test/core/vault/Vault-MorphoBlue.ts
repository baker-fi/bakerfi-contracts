import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../../common';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { deployMorphoProd } from '../common';

describeif(network.name === 'base_devnet')('BakerFi Morpho Blue Vault - Production', function () {
  it('Vault Initialization', async function () {
    const { vault, deployer, strategy } = await loadFixture(deployMorphoProd);
    expect(await vault.symbol()).to.equal('brETH');
    expect(await vault.balanceOf(deployer.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[2]).to.equal(0);
    expect(await vault.totalAssets()).to.equal(0);
  });

  it('Deposit 1 ETH', async function () {
    const { vault, deployer, strategy } = await loadFixture(deployMorphoProd);
    const depositAmount = ethers.parseUnits('1', 17);

    await expect(
      vault.depositNative(deployer.address, {
        value: depositAmount,
      }),
    ) // @ts-ignore
      .to.emit(strategy, 'StrategyDeploy')
      .emit(strategy, 'StrategyAmountUpdate');

    expect(await vault.balanceOf(deployer.address))
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 16))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('10', 17));
    expect(await vault.totalSupply())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 16))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('10', 16));
    expect(await vault.totalAssets())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 16))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('11', 16));

    expect(await vault.totalAssets())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 16))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('11', 16));
  });

  it('Deposit + Withdraw', async function () {
    const { vault, deployer, strategy } = await loadFixture(deployMorphoProd);
    const depositAmount = ethers.parseUnits('1', 17);

    await vault.depositNative(deployer.address, {
      value: depositAmount,
    });

    const [collateralBalance, debtBalance] = await strategy.getBalances();

    expect(collateralBalance)
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('3', 17))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('5', 17));
    expect(debtBalance)
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('3', 17))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('5', 17));

    await expect(vault.redeemNative(ethers.parseUnits('5', 16)))
      // @ts-ignore
      .to.emit(vault, 'Withdraw')
      // @ts-ignore
      .emit(strategy, 'StrategyUndeploy')
      // @ts-ignore
      .emit(strategy, 'StrategyAmountUpdate')
      .withArgs(anyValue);

    expect(await vault.totalAssets())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('4', 16))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('6', 16));
  });

  it('Withdraw - Burn all brETH', async function () {
    const { vault, deployer, strategy } = await loadFixture(deployMorphoProd);

    await vault.depositNative(deployer.address, {
      value: ethers.parseUnits('1', 17),
    });
    const [collateralBalanceInETH, debtBalanceInETH] = await strategy.getPosition([0, 0]);

    expect(collateralBalanceInETH)
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('10', 16))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('50', 16));
    expect(debtBalanceInETH)
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('10', 16))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('50', 16));
    const balanceOf = await vault.balanceOf(deployer.address);
    await vault.approve(vault.getAddress(), balanceOf);
    await vault.redeemNative(balanceOf);
    expect(await vault.balanceOf(deployer.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(0);

    await vault.depositNative(deployer.address, {
      value: ethers.parseUnits('1', 17),
    });

    expect(await vault.totalAssets())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 16))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('11', 17));
  });
});
