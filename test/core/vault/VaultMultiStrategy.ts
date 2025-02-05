import { describeif, VAULT_ROUTER_COMMAND_ACTIONS, VaultRouterABI } from '../../common';

import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { deployMockERC20 } from '../../../scripts/common';

describeif(network.name === 'hardhat')('MultiStrategy Vault', function () {
  async function deployMultiStrategyVaultFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
    const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
    await proxyAdmin.waitForDeployment();

    const weth = await deployMockERC20('WETH', 'WETH', 10000000n * 10n ** 18n, owner.address);
    const VaultLogic = await ethers.getContractFactory('MultiStrategyVault');
    const vaultLogic = await VaultLogic.deploy();
    await vaultLogic.waitForDeployment();

    const usdc = await deployMockERC20(
      'USDC',
      'USDC',
      // 10M USDC
      10000000n * 10n ** 18n,
      owner.address,
    );

    const weights = [7500, 2500];

    const StrategyPark = await ethers.getContractFactory('StrategyPark');

    const park1 = await StrategyPark.deploy(owner.address, await usdc.getAddress());

    const park2 = await StrategyPark.deploy(owner.address, await usdc.getAddress());

    const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');

    const proxyDeployment = await BakerFiProxy.deploy(
      await vaultLogic.getAddress(),
      await proxyAdmin.getAddress(),
      VaultLogic.interface.encodeFunctionData('initialize', [
        owner.address,
        'brUSDC',
        'brUSDC',
        await usdc.getAddress(),
        [await park1.getAddress(), await park2.getAddress()],
        weights,
        await weth.getAddress(),
      ]),
    );
    await proxyDeployment.waitForDeployment();

    const vault = await VaultLogic.attach(await proxyDeployment.getAddress());

    await park1.transferOwnership(await vault.getAddress());
    await park2.transferOwnership(await vault.getAddress());

    return { vault, park1, park2, usdc, owner, otherAccount };
  }

  it('Initialization', async () => {
    const { vault, usdc, owner, park1, park2 } = await loadFixture(deployMultiStrategyVaultFixture);
    expect(await vault.asset()).to.equal(await usdc.getAddress());
    expect(await vault.totalAssets()).to.equal(0n);
    expect(
      await vault.hasRole(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        owner.address,
      ),
    ).to.be.true;
    expect(await vault.strategies()).to.deep.equal([
      await park1.getAddress(),
      await park2.getAddress(),
    ]);
    expect(await vault.weights()).to.deep.equal([7500n, 2500n]);
    expect(await vault.totalWeight()).to.equal(10000n);
    expect(await vault.totalSupply()).to.equal(0n);
    expect(await vault.name()).to.equal('brUSDC');
    expect(await vault.symbol()).to.equal('brUSDC');
    expect(await usdc.allowance(vault.target, park1.target)).to.equal(ethers.MaxUint256);
    expect(await usdc.allowance(vault.target, park2.target)).to.equal(ethers.MaxUint256);
  });

  it('Deposit 10K USDC', async () => {
    const { vault, usdc, owner, park1, park2 } = await loadFixture(deployMultiStrategyVaultFixture);
    // 10K USDC
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);
    expect(await vault.totalAssets()).to.equal(amount);
    expect(await vault.totalSupply()).to.equal(amount);
    expect(await park1.totalAssets()).to.equal(7500n * 10n ** 18n);
    expect(await park2.totalAssets()).to.equal(2500n * 10n ** 18n);
    expect(await vault.balanceOf(owner.address)).to.equal(amount);
  });

  it('Deposit 0 Zero Reverts', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(vault.deposit(0n, owner.address)).to.be.revertedWithCustomError(
      vault,
      'InvalidAmount',
    );
  });

  it('Deposit Native should revert', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await expect(
      vault.depositNative(owner.address, {
        value: amount,
      }),
    ).to.be.revertedWithCustomError(vault, 'InvalidAsset');
  });

  it('Change Weights to 50/50', async () => {
    const { vault, usdc, owner, park1, park2 } = await loadFixture(deployMultiStrategyVaultFixture);
    const weights = [5000, 5000];
    await vault.setWeights(weights);
    expect(await vault.weights()).to.deep.equal(weights);
    expect(await vault.totalWeight()).to.equal(10000n);
  });

  it('Change Weights Reverts if the total weight is 0', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const weights = [0, 0];
    await expect(vault.setWeights(weights)).to.be.revertedWithCustomError(vault, 'InvalidWeights');
  });

  it('Change Weights to 100/0', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const weights = [10000, 0];
    await vault.setWeights(weights);
    expect(await vault.weights()).to.deep.equal(weights);
    expect(await vault.totalWeight()).to.equal(10000n);
  });

  it('Change Weight reverts if the array length is not equal to the number of strategies', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const weights = [10000, 0, 0];
    await expect(vault.setWeights(weights)).to.be.revertedWithCustomError(
      vault,
      'InvalidWeightsLength',
    );
  });

  it('Change Weights Reverts if the total weight is greater than 10000', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const weights = [10001, 0];
    await expect(vault.setWeights(weights)).to.be.revertedWithCustomError(vault, 'InvalidWeights');
  });

  it('Change Weights it not the owner', async () => {
    const { vault, otherAccount } = await loadFixture(deployMultiStrategyVaultFixture);
    const weights = [10000, 0];
    await expect(vault.connect(otherAccount).setWeights(weights)).to.be.revertedWith(
      /AccessControl: account .* is missing role/,
    );
  });

  it('Redeem 0 Zero Reverts', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(vault.redeem(0n, owner.address, owner.address)).to.be.revertedWithCustomError(
      vault,
      'InvalidAmount',
    );
  });

  it('Redeem Native Reverts', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await expect(vault.redeemNative(amount)).to.be.revertedWithCustomError(vault, 'InvalidAsset');
  });

  it('Withdraw 10K USDC', async () => {
    const { vault, usdc, owner, park1, park2 } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);
    await expect(vault.withdraw(amount, owner.address, owner.address)).to.changeTokenBalances(
      usdc,
      [owner.address, park1.target, park2.target],
      [amount, (-amount * 7500n) / 10000n, (-amount * 2500n) / 10000n],
    );
    expect(await vault.balanceOf(owner.address)).to.equal(0n);
  });

  it('Add Strategy', async () => {
    const { vault, park1 } = await loadFixture(deployMultiStrategyVaultFixture);
    await vault.addStrategy(await park1.getAddress());
    expect(await vault.strategies()).to.include(await park1.getAddress());
    expect(await vault.weights()).to.deep.equal([7500n, 2500n, 0n]);
  });

  it('Add Strategy Not the owner', async () => {
    const { vault, otherAccount, park1 } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(
      vault.connect(otherAccount).addStrategy(await park1.getAddress()),
    ).to.be.revertedWith(/AccessControl: account .* is missing role/);
  });

  it('Remove Strategy before having assets', async () => {
    const { vault, park1 } = await loadFixture(deployMultiStrategyVaultFixture);
    await vault.removeStrategy(1);
    expect(await vault.strategies()).to.deep.equal([await park1.getAddress()]);
    expect(await vault.weights()).to.deep.equal([7500n]);
  });

  it('Remove Strategy Reverts if the index is out of bounds', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(vault.removeStrategy(2)).to.be.revertedWithCustomError(
      vault,
      'InvalidStrategyIndex',
    );
  });

  it('Remove Strategy Not the owner', async () => {
    const { vault, otherAccount } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(vault.connect(otherAccount).removeStrategy(0)).to.be.revertedWith(
      /AccessControl: account .* is missing role/,
    );
  });

  it('Remove Last Strategy  - Fails if there is only one strategy', async () => {
    const { vault, usdc, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);
    await vault.removeStrategy(0);
    // Remove the last strategy
    await expect(vault.removeStrategy(0)).to.be.revertedWithCustomError(
      vault,
      'InvalidStrategyIndex',
    );
  });

  it('Rebalance After changing weights to 50/50', async () => {
    const { vault, usdc, owner, park1, park2 } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);
    //await vault.setWeights([5000n, 5000n]);
    await vault.rebalance([
      {
        action: 0x03,
        data: ethers.AbiCoder.defaultAbiCoder().encode(['uint16[]'], [[5000n, 5000n]]),
      },
      {
        action: 0x02,
        data: ethers.AbiCoder.defaultAbiCoder().encode(
          ['uint256[]', 'int256[]'],
          [
            [0, 1],
            [-2500n * 10n ** 18n, 2500n * 10n ** 18n],
          ],
        ),
      },
    ]);
    expect(await park1.totalAssets()).to.equal((amount * 5000n) / 10000n);
    expect(await park2.totalAssets()).to.equal((amount * 5000n) / 10000n);
  });

  it('Rebalance After changing weights to 100/0', async () => {
    const { vault, usdc, owner, park2 } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);
    await vault.rebalance([
      {
        action: 0x03,
        data: ethers.AbiCoder.defaultAbiCoder().encode(['uint16[]'], [[10000n, 0n]]),
      },
      {
        action: 0x02,
        data: ethers.AbiCoder.defaultAbiCoder().encode(
          ['uint256[]', 'int256[]'],
          [
            [1, 0],
            [-2500n * 10n ** 18n, 2500n * 10n ** 18n],
          ],
        ),
      },
    ]);
    //expect(await park1.totalAssets()).to.equal(amount);
    expect(await park2.totalAssets()).to.equal(0n);
  });

  it('Rebalance Fails if the deltas are not sorted', async () => {
    const { vault, usdc, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);
    await expect(
      vault.rebalance([
        {
          action: 0x02,
          data: ethers.AbiCoder.defaultAbiCoder().encode(
            ['uint256[]', 'int256[]'],
            [
              [0, 1],
              [2500n * 10n ** 18n, -2500n * 10n ** 18n],
            ],
          ),
        },
      ]),
    ).to.be.revertedWithCustomError(vault, 'InvalidDeltas');
  });

  it('Rebalance Fails - Delta sum is not 0', async () => {
    const { vault, usdc, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);
    await expect(
      vault.rebalance([
        {
          action: 0x02,
          data: ethers.AbiCoder.defaultAbiCoder().encode(
            ['uint256[]', 'int256[]'],
            [
              [0, 1],
              [-2500n * 10n ** 18n, -2500n * 10n ** 18n],
            ],
          ),
        },
      ]),
    ).to.be.revertedWithCustomError(vault, 'InvalidDeltas');
  });

  it('Rebalance After changing weights to 25/75', async () => {
    const { vault, usdc, owner, park1, park2 } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);
    await vault.rebalance([
      {
        action: 0x03,
        data: ethers.AbiCoder.defaultAbiCoder().encode(['uint16[]'], [[2500n, 7500n]]),
      },
      {
        action: 0x02,
        data: ethers.AbiCoder.defaultAbiCoder().encode(
          ['uint256[]', 'int256[]'],
          [
            [0, 1],
            [-5000n * 10n ** 18n, 5000n * 10n ** 18n],
          ],
        ),
      },
    ]);
    expect(await park1.totalAssets()).to.equal((amount * 2500n) / 10000n);
    expect(await park2.totalAssets()).to.equal((amount * 7500n) / 10000n);
  });

  it('Rebalance After changing weights to 0/100', async () => {
    const { vault, usdc, owner, park1, park2 } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);

    await vault.setWeights([0, 10000n]);
    await vault.rebalance([
      {
        action: 0x03,
        data: ethers.AbiCoder.defaultAbiCoder().encode(['uint16[]'], [[0n, 10000n]]),
      },
      {
        action: 0x02,
        data: ethers.AbiCoder.defaultAbiCoder().encode(
          ['uint256[]', 'int256[]'],
          [
            [0, 1],
            [-7500n * 10n ** 18n, 7500n * 10n ** 18n],
          ],
        ),
      },
    ]);
    expect(await park1.totalAssets()).to.equal(0);
    expect(await park2.totalAssets()).to.equal(amount);
  });

  it('Remove Strategy after having assets', async () => {
    const { vault, park1, usdc, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);
    await vault.removeStrategy(1);
    expect(await vault.strategies()).to.deep.equal([await park1.getAddress()]);
    expect(await vault.totalAssets()).to.equal(amount);
    expect(await vault.weights()).to.deep.equal([7500n]);
    expect(await park1.totalAssets()).to.equal(amount);
  });

  it('Rebalance before having assets', async () => {
    const { vault, park1, usdc, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    await vault.rebalance([
      {
        action: 0x01,
        data: '0x',
      },
    ]);
    expect(await park1.totalAssets()).to.equal(0n);
  });

  it('Pause - Vault should be able to be paused by the governor', async () => {
    const { owner, vault } = await loadFixture(deployMultiStrategyVaultFixture);
    await vault.pause();
    expect(await vault.paused()).to.be.true;
  });

  it('Pause - Vault should be able to be unpaused by the governor', async () => {
    const { owner, vault } = await loadFixture(deployMultiStrategyVaultFixture);
    await vault.pause();
    await vault.unpause();
    expect(await vault.paused()).to.be.false;
  });

  it('Grant Pause Role - Non-Pauser account cannot unpause vault', async () => {
    const { vault, otherAccount } = await loadFixture(deployMultiStrategyVaultFixture);
    await vault.pause();
    await expect(
      vault
        .connect(otherAccount)
        // @ts-ignore
        .unpause(),
    ).to.be.revertedWith(/AccessControl: account .* is missing role/);
  });

  it('Change Withdrawal Fee ✅', async function () {
    const { vault } = await loadFixture(deployMultiStrategyVaultFixture);
    await vault.setWithdrawalFee(20 * 1e6);
    expect(await vault.getWithdrawalFee()).to.equal(20 * 1e6);
  });

  it('Withdrawal Fee ❌', async function () {
    const { vault } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(vault.setWithdrawalFee(1100 * 1e6)).to.be.revertedWithCustomError(
      vault,
      'InvalidPercentage',
    );
  });

  it('Only Fund Manager can call rebalance', async () => {
    const { vault, otherAccount } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(vault.connect(otherAccount).rebalance([])).to.be.revertedWith(
      /AccessControl: account .* is missing role/,
    );
  });

  it('Change Perfornance Fee ✅', async function () {
    const { vault } = await loadFixture(deployMultiStrategyVaultFixture);
    await vault.setPerformanceFee(20 * 1e6);
    expect(await vault.getPerformanceFee()).to.equal(20 * 1e6);
  });

  it('Invalid Perfornance Fee ❌', async function () {
    const { vault } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(vault.setPerformanceFee(1100 * 1e6)).to.be.revertedWithCustomError(
      vault,
      'InvalidPercentage',
    );
  });

  it('Change Fee Receiver ✅', async function () {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    await vault.setFeeReceiver(owner.address);
    expect(await vault.getFeeReceiver()).to.equal(owner.address);
  });

  it('Change Max Deposit ✅', async function () {
    const { vault, otherAccount } = await loadFixture(deployMultiStrategyVaultFixture);

    await vault.setMaxDeposit(ethers.parseUnits('1', 17));
    // @ts-expect-error
    expect(await vault.connect(otherAccount).getMaxDeposit()).to.equal(ethers.parseUnits('1', 17));
  });

  it('Only Owner can change max deposit ❌', async function () {
    const { vault, otherAccount } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(
      vault
        .connect(otherAccount)
        // @ts-ignore
        .setMaxDeposit(ethers.parseUnits('1', 17)),
    ).to.be.revertedWith(/AccessControl: account .* is missing role/);

    it('tokenPerAsset - No Balance', async function () {
      const { vault } = await loadFixture(deployMultiStrategyVaultFixture);
      expect(await vault.tokenPerAsset()).to.equal(ethers.parseUnits('1', 18));
    });
  });

  it('Rebalance - Generates Revenue', async () => {
    const { owner, vault, otherAccount, usdc, park1 } = await loadFixture(
      deployMultiStrategyVaultFixture,
    );
    // 10K USDC
    const amount = 10000n * 10n ** 18n;
    await usdc.approve(vault.target, amount);
    await vault.deposit(amount, owner.address);

    expect(await vault.totalAssets()).to.equal(amount);
    expect(await vault.totalSupply()).to.equal(amount);

    await vault.setFeeReceiver(otherAccount.address);
    // 1% performance fee
    await vault.setPerformanceFee(1 * 1e7);
    // Artificial profit
    await usdc.transfer(park1.target, 1000n * 10n ** 18n);

    await expect(vault.rebalance([[0x01, '0x']]))
      // @ts-ignore
      .to.emit(vault, 'Transfer')
      .withArgs(
        '0x0000000000000000000000000000000000000000',
        otherAccount.address,
        9090909090909090910n,
      );
    expect(await vault.totalAssets()).to.equal(11000n * 10n ** 18n);
    // Increase by 10% de token per asset
    expect(await vault.tokenPerAsset()).to.equal(1099000908265213442n);
    const balanceFees =
      (BigInt(await vault.balanceOf(otherAccount.address)) * BigInt(await vault.tokenPerAsset())) /
      10n ** 18n;
    expect(balanceFees).to.equal(9990917347865576746n);
  });

  it('Deposit Reverts if the amount is 0', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(vault.deposit(0n, owner.address)).to.be.revertedWithCustomError(
      vault,
      'InvalidAmount',
    );
  });

  it('Withdraw Reverts if the asset is not the one set in the vault', async () => {
    const { vault, owner } = await loadFixture(deployMultiStrategyVaultFixture);
    await expect(vault.redeemNative(10000n * 10n ** 18n)).to.be.revertedWithCustomError(
      vault,
      'InvalidAsset',
    );
  });
});
