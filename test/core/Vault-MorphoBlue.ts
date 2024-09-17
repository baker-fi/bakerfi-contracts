import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';
import { deployMorphoProd } from './common';

describeif(network.name === 'ethereum_devnet' || network.name === 'base_devnet')(
  'BakerFi Morpho Blue Vault - Production',
  function () {
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
      const depositAmount = ethers.parseUnits('1', 18);

      await expect(
        vault.depositNative(deployer.address, {
          value: depositAmount,
        }),
      ) // @ts-ignore
        .to.emit(strategy, 'StrategyDeploy')
        .emit(strategy, 'StrategyAmountUpdate');

      expect(await vault.balanceOf(deployer.address))
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('9', 17))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('10', 18));
      expect(await vault.totalSupply())
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('9', 17))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('10', 18));
      expect(await vault.totalAssets())
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('9', 17))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('11', 17));

      expect(await vault.totalAssets())
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('9', 17))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('11', 17));
    });

    it('Deposit + Withdraw', async function () {
      const { vault, deployer, strategy } = await loadFixture(deployMorphoProd);
      const depositAmount = ethers.parseUnits('1', 18);

      await vault.depositNative(deployer.address, {
        value: depositAmount,
      });

      const [collateralBalance, debtBalance] = await strategy.getBalances();

      expect(collateralBalance)
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('3', 18))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('5', 18));
      expect(debtBalance)
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('3', 18))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('5', 18));

      await expect(vault.redeemNative(ethers.parseUnits('5', 17)))
        // @ts-ignore
        .to.emit(vault, 'Withdraw')
        // @ts-ignore
        .emit(strategy, 'StrategyUndeploy')
        // @ts-ignore
        .emit(strategy, 'StrategyAmountUpdate')
        .withArgs(anyValue);

      expect(await vault.totalAssets())
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('4', 17))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('6', 17));
    });

    it('Withdraw - Burn all brETH', async function () {
      const { vault, deployer, strategy } = await loadFixture(deployMorphoProd);

      await vault.depositNative(deployer.address, {
        value: ethers.parseUnits('1', 18),
      });
      const [collateralBalanceInUSD, debtBalanceInUSD] = await strategy.getPosition([0, 0]);

      expect(collateralBalanceInUSD)
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('10000', 18))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('100000', 18));
      expect(debtBalanceInUSD)
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('1000', 18))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('100000', 18));
      const balanceOf = await vault.balanceOf(deployer.address);
      await vault.approve(vault.getAddress(), balanceOf);
      await vault.redeemNative(balanceOf);
      expect(await vault.balanceOf(deployer.address)).to.equal(0);
      expect(await vault.totalSupply()).to.equal(0);
      expect((await strategy.getPosition([0, 0]))[0]).to.equal(0);
      expect((await strategy.getPosition([0, 0]))[1]).to.equal(0);

      await vault.depositNative(deployer.address, {
        value: ethers.parseUnits('1', 18),
      });

      expect(await vault.totalAssets())
        // @ts-ignore
        .to.greaterThan(ethers.parseUnits('9', 17))
        // @ts-ignore
        .lessThanOrEqual(ethers.parseUnits('11', 17));
    });
  },
);
