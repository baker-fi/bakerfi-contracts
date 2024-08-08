import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';

import { deployProd } from './common';

describeif(
  network.name === 'ethereum_devnet' ||
    network.name === 'optimism_devnet' ||
    network.name === 'arbitrum_devnet' ||
    network.name === 'base_devnet',
)('BakerFi - Production', function () {
  it('Test Initialized Vault', async function () {
    const { deployer, vault, strategy } = await loadFixture(deployProd);
    expect(await vault.symbol()).to.equal('brETH');
    expect(await vault.balanceOf(deployer.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[2]).to.equal(0);
    expect(await vault.totalAssets()).to.equal(0);
  });

  it('Deposit 1 ETH', async function () {
    const { vault, deployer, strategy } = await loadFixture(deployProd);

    const depositAmount = ethers.parseUnits('1', 18);
    await vault.depositNative(deployer.address, {
      value: depositAmount,
    });
    expect(await vault.balanceOf(deployer.address))
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 17))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('11', 17));
    expect((await strategy.getPosition([0, 0]))[0])
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('10000', 18))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('30000', 18));
    expect((await strategy.getPosition([0, 0]))[1])
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('5500', 18))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('20000', 18));
    expect(await vault.totalAssets())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 17))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('11', 17));
    expect((await strategy.getPosition([0, 0]))[2])
      // @ts-ignore
      .to.greaterThan(700000000n)
      // @ts-ignore
      .lessThanOrEqual(810000000n);
    expect(await vault.totalSupply())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 17))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('11', 17));
    expect(await vault.tokenPerAsset())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 17))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('11', 17));
  });

  it('Deposit + Withdraw', async function () {
    const { vault, deployer, strategy } = await loadFixture(deployProd);
    const depositAmount = ethers.parseUnits('10', 18);

    await strategy.setLoanToValue(ethers.parseUnits('500', 6));

    await vault.depositNative(deployer.address, {
      value: depositAmount,
    });

    const provider = ethers.provider;
    const balanceBefore = await provider.getBalance(deployer.address);

    await vault.redeemNative(ethers.parseUnits('5', 18));
    expect(await vault.balanceOf(deployer.address))
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('4', 18))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('6', 18));
    expect((await strategy.getPosition([0, 0]))[0])
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('10000', 18))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('40000', 18));
    expect((await strategy.getPosition([0, 0]))[1])
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('5000', 18))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('40000', 18));
    expect(await vault.totalAssets())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('4', 18))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('6', 18));
    expect((await strategy.getPosition([0, 0]))[2])
      // @ts-ignore
      .to.greaterThan(400000000n)
      // @ts-ignore
      .lessThanOrEqual(600000000n);
    expect(await vault.totalSupply())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('4', 18))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('6', 18));
    expect(await vault.tokenPerAsset())
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('9', 17))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('11', 17));
    const balanceAfter = await provider.getBalance(deployer.address);
    expect(balanceAfter - balanceBefore)
      // @ts-ignore
      .greaterThan(ethers.parseUnits('4', 18))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('11', 18));
  });

  it('Liquidation Protection - Adjust Debt', async function () {
    const { vault, strategy, deployer } = await loadFixture(deployProd);

    await strategy.setLoanToValue(ethers.parseUnits('500', 6));
    await strategy.setMaxLoanToValue(ethers.parseUnits('510', 6));

    const depositAmount = ethers.parseUnits('1', 18);

    await expect(
      vault.depositNative(deployer.address, {
        value: depositAmount,
      }),
    )
      // @ts-ignore
      .to.emit(strategy, 'StrategyAmountUpdate')
      .withArgs((value) => {
        return value >= 971432545612539374n;
      });

    await strategy.setLoanToValue(ethers.parseUnits('400', 6));
    await strategy.setMaxLoanToValue(ethers.parseUnits('400', 6));

    await expect(vault.rebalance())
      // @ts-ignore
      .to.emit(strategy, 'StrategyAmountUpdate')
      .withArgs((value) => {
        return value >= 902114986650737323n;
      });
    expect((await strategy.getPosition([0, 0]))[2])
      // @ts-ignore
      .to.greaterThan(300000000n)
      // @ts-ignore
      .lessThanOrEqual(410000000n);
  });

  it('Deposit and Withdraw and pay the fee', async function () {
    const { deployer, vault, settings } = await loadFixture(deployProd);
    const feeReceiver = '0x1260E3ca7aD848498e3D6446FBcBc7c7A0717607';

    await settings.setFeeReceiver(feeReceiver);
    // Fees are 10%
    await settings.setWithdrawalFee(ethers.parseUnits('100', 6));

    await vault.depositNative(deployer.address, {
      value: ethers.parseUnits('10', 18),
    });
    const balanceBefore = await ethers.provider.getBalance(feeReceiver);

    await vault.redeemNative(ethers.parseUnits('5', 18));

    const provider = ethers.provider;
    const balanceAfter = await provider.getBalance(feeReceiver);
    const balanceDiff = balanceAfter - balanceBefore;

    expect(balanceDiff)
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('4', 17))
      // @ts-ignore
      .lessThanOrEqual(ethers.parseUnits('6', 17));
  });

  it('Deposit and Withdraw all the shares from a user', async function () {
    const { deployer, vault, strategy } = await loadFixture(deployProd);

    await vault.depositNative(deployer.address, {
      value: ethers.parseUnits('10', 18),
    });
    const balanceOf = await vault.balanceOf(deployer.address);
    const withrawing = balanceOf;
    await vault.redeemNative(withrawing);
    expect(await vault.balanceOf(deployer.address)).to.equal(0n);
    expect(await vault.totalSupply()).to.equal(0n);
    expect((await strategy.getPosition([0, 0]))[0])
      .to.greaterThan(1500)
      .lessThanOrEqual(10000);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(0n);
    expect((await strategy.getPosition([0, 0]))[2]).to.equal(0n);
    expect(await vault.tokenPerAsset()).to.equal(ethers.parseUnits('1', 18));
  });
});
