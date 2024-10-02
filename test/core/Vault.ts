import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import {
  deployServiceRegistry,
  deployVault,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deployCbETH,
  deploySettings,
  deployQuoterV2Mock,
  deployAAVEv3StrategyAny,
} from '../../scripts/common';
import BaseConfig, { NetworkConfig } from '../../constants/network-deploy-config';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs';

/**
 * Unit Tests for BakerFi Vault with a regular AAVEv3Strategy
 */

describeif(network.name === 'hardhat')('BakerFi Vault For L2s', function () {
  it('Deposit - Emit Strategy Amount Update', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    await expect(
      vault.depositNative(owner.address, {
        value: ethers.parseUnits('10', 18),
        // @ts-ignore
      }),
    )
      .to.emit(strategy, 'StrategyAmountUpdate')
      .withArgs(9962113816060668112n);
  });

  it('Deposit - Emit Strategy Deploy', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    await expect(
      vault.depositNative(owner.address, {
        value: ethers.parseUnits('10', 18),
        // @ts-ignore
      }),
    )
      .to.emit(strategy, 'StrategyDeploy')
      .withArgs(anyValue, 9962113816060668112n);
  });

  it('Deposit with no Flash Loan Fees', async function () {
    const { owner, vault, weth, aave3Pool, strategy, cbETH, flashLender } = await loadFixture(
      deployFunction,
    );
    await flashLender.setFlashLoanFee(0);
    const tx = await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });
    // @ts-ignore
    await expect(tx).to.changeEtherBalances([owner.address], [ethers.parseUnits('-10', 18)]);
    await expect(tx)
      // @ts-ignore
      .to.emit(aave3Pool, 'Supply')
      .withArgs(
        await cbETH.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        39603410838016000000n,
        0,
      );
    await expect(tx)
      // @ts-ignore
      .to.emit(aave3Pool, 'Borrow')
      .withArgs(
        await weth.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        35705032704000000000n,
        0,
        0,
        0,
      );
  });

  it('Deposit with 1% Flash Loan Fees', async function () {
    const { owner, vault, weth, aave3Pool, strategy, cbETH, flashLender } = await loadFixture(
      deployFunction,
    );
    await flashLender.setFlashLoanFee(10e6); // 1%
    await expect(
      await vault.depositNative(owner.address, {
        value: ethers.parseUnits('10', 18),
      }),
    ) // @ts-ignore
      .to.emit(aave3Pool, 'Borrow')
      .withArgs(
        await weth.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        36062083031040000000n,
        0,
        0,
        0,
      );
  });

  it('Multiple Deposits', async function () {
    const { owner, vault, uniRouter, strategy } = await loadFixture(deployFunction);

    await expect(
      vault.depositNative(owner.address, {
        value: ethers.parseUnits('10', 18),
      }),
    ) // @ts-ignore
      .to.emit(strategy, 'StrategyAmountUpdate')
      .withArgs(9962113816060668112n);

    await expect(
      vault.depositNative(owner.address, {
        value: ethers.parseUnits('10', 18),
      }),
    ) // @ts-ignore
      .to.emit(strategy, 'StrategyAmountUpdate')
      .withArgs(19924227632121336224n);
    await expect(
      vault.depositNative(owner.address, {
        value: ethers.parseUnits('10', 18),
      }),
    ) // @ts-ignore
      .to.emit(strategy, 'StrategyAmountUpdate')
      .withArgs(29886341448182004336n);
  });

  it('convertToShares - 1ETH', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    expect(await vault.convertToShares(ethers.parseUnits('1', 18))).to.equal(1000000000000000000n);
  });

  it('convertToAssets - 1e18 brETH', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });
    expect(await vault.convertToAssets(ethers.parseUnits('1', 18))).to.equal(1000000000000000000n);
  });

  it('convertToShares - 1ETH no balance', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);

    expect(await vault.convertToAssets(ethers.parseUnits('1', 18))).to.equal(
      ethers.parseUnits('1', 18),
    );
  });

  it('convertToAssets - 1e18 brETH  no balance', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    expect(await vault.convertToAssets(ethers.parseUnits('1', 18))).to.equal(
      ethers.parseUnits('1', 18),
    );
  });

  it('tokenPerAsset - No Balance', async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    expect(await vault.tokenPerAsset()).to.equal(ethers.parseUnits('1', 18));
  });

  it('Deposit Fails when the prices are outdated', async () => {
    const { settings, vault, owner, strategy } = await loadFixture(deployFunction);

    // Price Max Age 6 Min
    await settings.setPriceMaxAge(360);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    // advance time by one hour and mine a new block
    await time.increase(3600);

    await expect(
      vault.depositNative(owner.address, {
        value: ethers.parseUnits('10', 18),
      }),
      // @ts-ignore
    ).to.be.revertedWithCustomError(strategy, 'PriceOutdated');
  });

  it('Deposit Fails when the prices are outdated', async () => {
    const { settings, vault, owner, strategy } = await loadFixture(deployFunction);

    // Price Max Age 6 Min
    await settings.setPriceMaxAge(360);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    // advance time by one hour and mine a new block
    await time.increase(3600);

    await expect(
      vault.depositNative(owner.address, {
        value: ethers.parseUnits('10', 18),
      }),
      // @ts-ignore
    ).to.be.revertedWithCustomError(strategy, 'PriceOutdated');
  });

  it('Deposit Success with old prices', async () => {
    const { settings, vault, owner } = await loadFixture(deployFunction);

    // Price Max Age 10 Hours
    await settings.setPriceMaxAge(360);
    const tx = await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    // advance time by one hour and mine a new block
    await time.increase(3600);
    // @ts-ignore
    await expect(tx).to.changeEtherBalances([owner.address], [ethers.parseUnits('-10', 18)]);
  });

  it('convertToShares should return with outdated prices', async () => {
    const { settings, vault, owner } = await loadFixture(deployFunction);

    await settings.setPriceMaxAge(360);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    // advance time by one hour and mine a new block
    await time.increase(3600);

    expect(await vault.convertToShares(ethers.parseUnits('1', 18))).to.equal(1000000000000000000n);
  });

  it('convertToAssets should return with outdated prices', async () => {
    const { settings, vault, owner } = await loadFixture(deployFunction);

    // Price Max Age 10 Hours
    await settings.setPriceMaxAge(360);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    // advance time by one hour and mine a new block
    await time.increase(3600);

    expect(await vault.convertToAssets(ethers.parseUnits('1', 18))).to.equal(1000000000000000000n);
  });

  it('tokenPerAsset should return with outdated prices', async () => {
    const { settings, vault, owner } = await loadFixture(deployFunction);

    // Price Max Age 10 Hours
    await settings.setPriceMaxAge(360);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    // advance time by one hour and mine a new block
    await time.increase(3600);

    expect(await vault.tokenPerAsset()).to.equal(1000000000000000000n);
  });

  it('totalAssets should return with outdated prices', async () => {
    const { settings, vault, owner } = await loadFixture(deployFunction);

    // Price Max Age 10 Hours
    await settings.setPriceMaxAge(360);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });

    // advance time by one hour and mine a new block
    await time.increase(3600);

    expect(await vault.totalAssets()).to.equal(9962113816060668112n);
  });

  it('Pause and Unpause', async () => {
    const { vault, owner } = await loadFixture(deployFunction);
    expect(await vault.paused()).to.equal(false);
    await vault.pause();
    expect(await vault.paused()).to.equal(true);
    await vault.unpause();
    expect(await vault.paused()).to.equal(false);

    await vault.depositNative(owner.address, {
      value: ethers.parseUnits('10', 18),
    });
    expect(await vault.totalAssets()).to.greaterThan(0);
  });

  it('Withdraw Fails when vault is paused', async () => {
    const { vault, owner } = await loadFixture(deployFunction);

    await vault.pause();
    // @ts-ignore
    await expect(vault.redeemNative(1)).to.be.revertedWith('Pausable: paused');
  });

  it('Deposit Fails when vault is paused', async () => {
    const { vault, owner } = await loadFixture(deployFunction);
    await vault.pause();
    await expect(
      vault.depositNative(owner.address, {
        value: ethers.parseUnits('10', 18),
      }),
      // @ts-ignore
    ).to.be.revertedWith('Pausable: paused');
  });

  it('Rebalance Fails when vault is paused', async () => {
    const { vault, owner } = await loadFixture(deployFunction);
    await vault.pause();
    // @ts-ignore
    await expect(vault.rebalance()).to.be.revertedWith('Pausable: paused');
  });

  it('Transfer ETH to contract should fail', async () => {
    const { vault, owner } = await loadFixture(deployFunction);
    // Create a transaction object
    let tx = {
      to: await vault.getAddress(),
      // Convert currency unit from ether to wei
      value: ethers.parseUnits('10', 18),
    };
    // @ts-ignore
    await expect(owner.sendTransaction(tx)).to.be.revertedWithCustomError(
      vault,
      'ETHTransferNotAllowed',
    );
  });

  it('Transfer Ownership in 2 Steps', async function () {
    const { vault, owner, otherAccount } = await loadFixture(deployFunction);
    await vault.transferOwnership(otherAccount.address);
    expect(await vault.pendingOwner()).to.equal(otherAccount.address);
    // @ts-ignore
    await vault.connect(otherAccount).acceptOwnership();
    expect(await vault.owner()).to.equal(otherAccount.address);
  });

  it('Deposit Success', async function () {
    const { vault, weth, owner, otherAccount } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await vault.getAddress(), amount);

    expect(await weth.balanceOf(owner.address)).to.equal(amount);

    const sharesMinted = 9962113816060668112n;
    await expect(vault.deposit(amount, owner.address))
      // @ts-ignore
      .to.emit(vault, 'Deposit')
      .withArgs(owner.address, owner.address, amount, sharesMinted);

    expect(await weth.balanceOf(owner.address)).to.equal(0n);
    expect(await vault.balanceOf(owner.address)).to.equal(sharesMinted);
    expect(await vault.totalSupply()).to.equal(sharesMinted);
  });

  it('Deposit Failed - No Allowance', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: amount });
    expect(await weth.balanceOf(owner.address)).to.equal(amount);

    await expect(vault.deposit(amount, owner.address))
      .to.be // @ts-ignore
      .revertedWith('SafeERC20: low-level call failed');

    expect(await weth.balanceOf(owner.address)).to.equal(amount);
  });

  it('Deposit Failed - Zero Deposit', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: amount });
    expect(await weth.balanceOf(owner.address)).to.equal(amount);

    // @ts-ignore
    await expect(vault.deposit(0, owner.address)).to.be.revertedWithCustomError(
      vault,
      'InvalidDepositAmount',
    );
  });

  it('Deposit Failed - Zero Receiver', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await vault.getAddress(), amount);
    expect(await weth.balanceOf(owner.address)).to.equal(amount);

    await expect(
      vault.deposit(amount, '0x0000000000000000000000000000000000000000'),
      // @ts-ignore
    ).to.be.revertedWithCustomError(vault, 'InvalidReceiver');
  });

  it('MaxDeposit', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    expect(await vault.maxDeposit(owner.address)).to.equal(ethers.MaxUint256);
  });

  it('PreviewDeposit - First Deposit', async function () {
    const { vault } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);
    expect(await vault.previewDeposit(amount)).to.equal(amount);
  });

  it('PreviewDeposit - Second Deposit', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    const firstAmount = ethers.parseUnits('10', 18);
    const secondAmount = ethers.parseUnits('5', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: firstAmount });
    await weth.approve(await vault.getAddress(), firstAmount);
    await vault.deposit(firstAmount, owner.address);

    expect(await vault.previewDeposit(secondAmount)).to.equal(secondAmount);
  });

  it('MaxMint', async function () {
    const { vault, owner } = await loadFixture(deployFunction);
    expect(await vault.maxMint(owner.address)).to.equal(ethers.MaxUint256);
  });

  it('PreviewMint', async function () {
    const { vault } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);
    expect(await vault.previewMint(amount)).to.equal(amount);
  });

  it('Mint Success', async function () {
    const { vault, weth, owner, otherAccount } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await vault.getAddress(), amount);

    expect(await weth.balanceOf(owner.address)).to.equal(amount);

    const sharesMinted = 9962113816060668112n;
    await expect(vault.mint(amount, owner.address))
      // @ts-ignore
      .to.emit(vault, 'Deposit')
      .withArgs(owner.address, owner.address, amount, sharesMinted);

    expect(await weth.balanceOf(owner.address)).to.equal(0n);
    expect(await vault.balanceOf(owner.address)).to.equal(sharesMinted);
    expect(await vault.totalSupply()).to.equal(sharesMinted);
  });

  it('Mint Failed - No Allowance', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: amount });
    expect(await weth.balanceOf(owner.address)).to.equal(amount);

    await expect(vault.mint(amount, owner.address))
      .to.be // @ts-ignore
      .revertedWith('SafeERC20: low-level call failed');

    expect(await weth.balanceOf(owner.address)).to.equal(amount);
  });

  it('Mint Failed - Zero Shares', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: amount });
    expect(await weth.balanceOf(owner.address)).to.equal(amount);

    // @ts-ignore
    await expect(vault.mint(0, owner.address)).to.be.revertedWithCustomError(
      vault,
      'InvalidDepositAmount',
    );
  });

  it('Mint Failed - No Receiver', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    const amount = ethers.parseUnits('10', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await vault.getAddress(), amount);
    expect(await weth.balanceOf(owner.address)).to.equal(amount);

    await expect(
      vault.mint(amount, '0x0000000000000000000000000000000000000000'),
      // @ts-ignore
    ).to.be.revertedWithCustomError(vault, 'InvalidReceiver');
  });

  it('MaxWithdraw - Empty Vault', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    expect(await vault.maxWithdraw(owner.address)).to.equal(0n);
  });

  it('MaxWithdraw - Some shares', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    const firstAmount = ethers.parseUnits('10', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: firstAmount });
    await weth.approve(await vault.getAddress(), firstAmount);
    await vault.deposit(firstAmount, owner.address);
    const sharesBalance = await vault.balanceOf(owner.address);
    expect(await vault.maxWithdraw(owner.address)).to.equal(sharesBalance);
  });

  it('PreviewWithdraw', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);
    const firstAmount = ethers.parseUnits('10', 18);
    const withdrawAmount = ethers.parseUnits('1', 18);

    // Convert Native ETH to WETH
    await weth.deposit?.call('', { value: firstAmount });

    await weth.approve(await vault.getAddress(), firstAmount);
    await vault.deposit(firstAmount, owner.address);
    expect(await vault.previewWithdraw(withdrawAmount)).to.equal(withdrawAmount);
  });

  it('Withdraw Success', async function () {
    const { vault, weth, owner, strategy } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits('10', 18);
    const withdrawAmount = ethers.parseUnits('5', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    expect(await vault.balanceOf(owner.address)).to.equal(9962113816060668112n);

    await expect(vault.withdraw(withdrawAmount, owner.address, owner.address))
      // @ts-ignore
      .to.emit(vault, 'Withdraw')
      .withArgs(owner.address, owner.address, owner.address, 4983156389718359985n, withdrawAmount)
      // @ts-ignore
      .emit(strategy, 'StrategyUndeploy')
      .withArgs(anyValue, 4999999996959053025n)
      // @ts-ignore
      .emit(strategy, 'StrategyAmountUpdate')
      .withArgs(4962113819101615087n)
      // @ts-ignore
      .emit(vault, 'Transfer')
      .withArgs(owner.address, '0x0000000000000000000000000000000000000000', 5000000000000000000n);

    expect(await vault.balanceOf(owner.address)).to.equal(4962113816060668112n);
  });

  it('Withdraw Success - In Name of', async function () {
    const { vault, weth, owner, otherAccount } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits('10', 18);
    const withdrawAmount = ethers.parseUnits('5', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    expect(await vault.balanceOf(owner.address)).to.equal(9962113816060668112n);

    await vault.approve(otherAccount.address, withdrawAmount);

    await expect(
      vault.connect(otherAccount).withdraw(withdrawAmount, otherAccount.address, owner.address),
    )
      // @ts-ignore
      .to.emit(vault, 'Withdraw')
      .withArgs(
        otherAccount.address,
        otherAccount.address,
        owner.address,
        4983156389718359985n,
        withdrawAmount,
      )
      .emit(vault, 'Transfer')
      .withArgs(owner.address, otherAccount.address, 5000000000000000000n)
      .emit(vault, 'Transfer')
      .withArgs(
        otherAccount.address,
        '0x0000000000000000000000000000000000000000',
        5000000000000000000n,
      );

    expect(await vault.balanceOf(owner.address)).to.equal(4962113816060668112n);
  });

  it('Withdraw Failed - Withdraw in name of holder', async function () {
    const { vault, weth, owner, otherAccount } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('10', 18);
    const withdrawAmount = ethers.parseUnits('5', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    await expect(
      vault.connect(otherAccount).withdraw(withdrawAmount, otherAccount.address, owner.address),
    )
      .to.be // @ts-ignore
      .revertedWithCustomError(vault, 'NoAllowance');
  });

  it('Withdraw Failed - No Balance', async function () {
    const { vault, weth, owner, otherAccount } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('10', 18);
    const withdrawAmount = ethers.parseUnits('500', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    await expect(vault.withdraw(withdrawAmount, owner.address, owner.address))
      .to.be // @ts-ignore
      .revertedWithCustomError(vault, 'NotEnoughBalanceToWithdraw');
  });

  it('Withdraw Failed - No Balance In Name of', async function () {
    const { vault, weth, owner, otherAccount } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('10', 18);
    const withdrawAmount = ethers.parseUnits('50', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    await expect(
      vault.connect(otherAccount).withdraw(withdrawAmount, otherAccount.address, owner.address),
    )
      .to.be // @ts-ignore
      .revertedWithCustomError(vault, 'NotEnoughBalanceToWithdraw');
  });

  it('MaxRedeem', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits('10', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    expect(await vault.maxRedeem(owner.address)).to.equal(9962113816060668112n);
  });

  it('PreviewRedeem', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits('10', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    expect(await vault.previewRedeem(ethers.parseUnits('5', 18))).to.equal(
      ethers.parseUnits('5', 18),
    );
  });

  it('Redeem Sucess', async function () {
    const { vault, weth, owner } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits('10', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    const balanceOf = vault.balanceOf(owner.address);

    await expect(vault.redeem(balanceOf, owner.address, owner.address))
      // @ts-ignore
      .to.emit(vault, 'Withdraw')
      .withArgs(
        owner.address,
        owner.address,
        owner.address,
        9928554229559296000n,
        9962113816060668112n,
      )
      .emit(vault, 'Transfer')
      .withArgs(owner.address, '0x0000000000000000000000000000000000000000', balanceOf);
  });

  it('Redeem Sucess - In Name of ', async function () {
    const { vault, weth, owner, otherAccount } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits('10', 18);
    const withdrawAmount = ethers.parseUnits('5', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    expect(await vault.balanceOf(owner.address)).to.equal(9962113816060668112n);

    await vault.approve(otherAccount.address, withdrawAmount);

    await expect(
      vault.connect(otherAccount).redeem(withdrawAmount, otherAccount.address, owner.address),
    )
      // @ts-ignore
      .to.emit(vault, 'Withdraw')
      .withArgs(
        otherAccount.address,
        otherAccount.address,
        owner.address,
        4983156389718359985n,
        withdrawAmount,
      )
      .emit(vault, 'Transfer')
      .withArgs(owner.address, otherAccount.address, 5000000000000000000n)
      .emit(vault, 'Transfer')
      .withArgs(
        otherAccount.address,
        '0x0000000000000000000000000000000000000000',
        5000000000000000000n,
      );

    expect(await vault.balanceOf(owner.address)).to.equal(4962113816060668112n);
  });

  it('Redeem Failed - In Name of ', async function () {
    const { vault, weth, owner, otherAccount } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('10', 18);
    const withdrawAmount = ethers.parseUnits('5', 18);

    await weth.deposit?.call('', { value: depositAmount });
    await weth.approve(await vault.getAddress(), depositAmount);
    await vault.deposit(depositAmount, owner.address);

    await expect(
      vault.connect(otherAccount).redeem(withdrawAmount, otherAccount.address, owner.address),
    )
      .to.be // @ts-ignore
      .revertedWithCustomError(vault, 'NoAllowance');
  });
});

/**
 * Deploy Test Function
 */
async function deployFunction() {
  const [owner, otherAccount, anotherAccount] = await ethers.getSigners();
  const networkName = network.name;
  const config: NetworkConfig = BaseConfig[networkName];
  const CBETH_MAX_SUPPLY = ethers.parseUnits('1000000000', 18);
  const FLASH_LENDER_DEPOSIT = ethers.parseUnits('10000', 18);
  const AAVE_DEPOSIT = ethers.parseUnits('10000', 18);
  const serviceRegistry = await deployServiceRegistry(owner.address);
  const serviceRegistryAddress = await serviceRegistry.getAddress();
  const weth = await deployWETH(serviceRegistry);
  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');

  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

  // Deploy Flash Lender
  const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);

  // Deploy cbETH
  const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

  // Deploy cbETH -> ETH Uniswap Router
  const UniRouter = await ethers.getContractFactory('UniV3RouterMock');
  const uniRouter = await UniRouter.deploy(await weth.getAddress(), await cbETH.getAddress());

  // Register Uniswap Router
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Uniswap Router')),
    await uniRouter.getAddress(),
  );

  await uniRouter.setPrice(8665 * 1e5);

  // Deposit ETH on Uniswap Mock Router
  await weth.deposit?.call('', { value: ethers.parseUnits('10000', 18) });
  await weth.transfer(await uniRouter.getAddress(), ethers.parseUnits('10000', 18));

  // Deposit cbETH on Uniswap Mock Router
  await cbETH.transfer(await uniRouter.getAddress(), ethers.parseUnits('10000', 18));

  const { proxy: settingsProxy } = await deploySettings(owner.address, serviceRegistry, proxyAdmin);
  const pSettings = await ethers.getContractAt('Settings', await settingsProxy.getAddress());
  await pSettings.setPriceMaxAge(0);
  await pSettings.setRebalancePriceMaxAge(0);
  // 5. Deploy AAVEv3 Mock Pool
  const aave3Pool = await deployAaveV3(cbETH, weth, serviceRegistry, AAVE_DEPOSIT);

  // 6. Deploy wstETH/ETH Oracle
  const oracle = await deployOracleMock(serviceRegistry, 'cbETH/USD Oracle');
  const ethOracle = await deployOracleMock(serviceRegistry, 'ETH/USD Oracle');

  await oracle.setLatestPrice(ethers.parseUnits('2660', 18));
  await ethOracle.setLatestPrice(ethers.parseUnits('2305', 18));

  await deployQuoterV2Mock(serviceRegistry);

  const { proxy: proxyStrategy } = await deployAAVEv3StrategyAny(
    owner.address,
    owner.address,
    serviceRegistryAddress,
    'cbETH',
    'cbETH/USD Oracle',
    config.swapFeeTier,
    config.AAVEEModeCategory,
    proxyAdmin,
  );

  const pStrategy = await ethers.getContractAt('StrategyAAVEv3', await proxyStrategy.getAddress());

  const { proxy } = await deployVault(
    owner.address,
    'Bread ETH',
    'brETH',
    serviceRegistryAddress,
    await proxyStrategy.getAddress(),
    proxyAdmin,
  );

  await pStrategy.transferOwnership(await proxy.getAddress());
  const pVault = await ethers.getContractAt('Vault', await proxy.getAddress());
  return {
    cbETH,
    weth,
    owner,
    otherAccount,
    anotherAccount,
    serviceRegistry,
    vault: pVault,
    aave3Pool,
    flashLender,
    uniRouter,
    oracle,
    strategy: pStrategy,
    settings: pSettings,
  };
}
