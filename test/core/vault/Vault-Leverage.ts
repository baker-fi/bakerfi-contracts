import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../../common';
import {
  deployVaultRegistry,
  deployOracleMock,
  deployWETH,
  deployMockERC20,
} from '../../../scripts/common';

describeif(network.name === 'hardhat')('Vault Leverage with Mock', function () {
  it('Initialization', async function () {
    const { strategy, vault, owner, usdc } = await deployFunction();
    expect(await vault.symbol()).to.equal('brUSDC');
    expect(await vault.balanceOf(owner.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[0]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(0);
    expect((await strategy.getPosition([0, 0]))[2]).to.equal(0);
    expect(await strategy.asset()).to.equal(await usdc.getAddress());
    expect(await vault.asset()).to.equal(await usdc.getAddress());
    expect(await vault.totalAssets()).to.equal(0);
    expect(await vault.decimals()).to.equal(6);
    expect(await vault.tokenPerAsset()).to.equal(1000000);
  });

  it('Deposit', async function () {
    const { strategy, vault, owner, usdc } = await deployFunction();
    // Deposit 4000 USDC
    const depositAmount = 4000n * 10n ** 6n;
    await usdc.approve(await vault.getAddress(), depositAmount);
    // Deposit 4000 USDC on Vault and mint shares to owner
    await vault.deposit(depositAmount, owner.address);
    expect((await strategy.getPosition([0, 0]))[0]).to.closeTo(18282012000, 100000);
    expect((await strategy.getPosition([0, 0]))[1]).to.equal(14282013081n);
    expect((await strategy.getPosition([0, 0]))[2]).to.closeTo(780000000, 10000000);
    expect(await vault.totalAssets()).to.closeTo(4000 * 10 ** 6, 10 ** 6);
    expect(await vault.balanceOf(owner.address)).to.closeTo(4000 * 10 ** 6, 10 ** 6);
    expect(await strategy.totalAssets()).closeTo(4000 * 10 ** 6, 10 ** 6);
  });

  it('Withdraw', async function () {
    const { strategy, vault, owner, usdc, weth } = await deployFunction();
    // Deposit 4000 USDC
    const depositAmount = 4000n * 10n ** 6n;
    const withdrawAmount = 1000n * 10n ** 6n;
    await usdc.approve(await vault.getAddress(), depositAmount);
    // Deposit 4000 USDC on Vault and mint shares to owner
    await vault.deposit(depositAmount, owner.address);
    // Withdraw 1000 Shares
    await vault.approve(await vault.getAddress(), withdrawAmount);
    await expect(vault.redeem(withdrawAmount, owner.address, owner.address)).to.changeTokenBalance(
      usdc,
      owner.address,
      1000003773n,
    );
  });
});

// Collateal ETH
async function deployFunction() {
  const [owner, otherAccount, anotherAccount] = await ethers.getSigners();
  const networkName = network.name;

  // Deploy Proxy Admin
  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

  // Deploy Service Registry
  const serviceRegistry = await deployVaultRegistry(owner.address);
  const weth = await deployWETH(serviceRegistry);

  // WETH/USDC
  const oracle = await deployOracleMock();
  await oracle.setDecimals(9);
  await oracle.setLatestPrice(4000 * 1e9);

  // USDC with 1m supply
  const usdc = await deployMockERC20('USDC', 'USDC', 1000000n * 10n ** 6n, owner.address);
  await usdc.setDecimals(6);
  expect(await usdc.decimals()).to.equal(6);

  // USDC Flash Lender
  const MockFlashLender = await ethers.getContractFactory('MockFlashLender');
  const flashLender = await MockFlashLender.deploy(await usdc.getAddress());
  await flashLender.waitForDeployment();
  const flashLenderAddress = await flashLender.getAddress();
  await flashLender.setFlashLoanFee(0);

  // Transfer 100K USDC to Flash Lender
  await usdc.transfer(flashLenderAddress, 100000n * 10n ** 6n);

  await weth.deposit?.call('', { value: ethers.parseUnits('1000', 18) });

  const StrategyLeverageMock = await ethers.getContractFactory('StrategyLeverageMock');
  const strategy = await StrategyLeverageMock.deploy();
  await strategy.waitForDeployment();
  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const proxyStrategy = await BakerFiProxy.deploy(
    await strategy.getAddress(),
    await proxyAdmin.getAddress(),
    StrategyLeverageMock.interface.encodeFunctionData('initialize', [
      owner.address,
      owner.address,
      await weth.getAddress(),
      await usdc.getAddress(),
      await oracle.getAddress(),
      await flashLender.getAddress(),
    ]),
  );

  // Transfer 1000 WETH to Strategy to be used as Balance
  await weth.transfer(await proxyStrategy.getAddress(), ethers.parseUnits('1000', 18));

  // Transfer 200K USDC to Strategy to be used as Balance
  await usdc.transfer(await proxyStrategy.getAddress(), 200000n * 10n ** 6n);

  await proxyStrategy.waitForDeployment();

  const pStrategy = await ethers.getContractAt(
    'StrategyLeverageAAVEv3',
    await proxyStrategy.getAddress(),
  );

  await pStrategy.setPriceMaxAge(0);

  const Vault = await ethers.getContractFactory('Vault');
  const vault = await Vault.deploy();
  await vault.waitForDeployment();

  const vaultProxy = await BakerFiProxy.deploy(
    await vault.getAddress(),
    await proxyAdmin.getAddress(),
    Vault.interface.encodeFunctionData('initialize', [
      owner.address,
      'Bread USDC',
      'brUSDC',
      await usdc.getAddress(),
      await pStrategy.getAddress(),
      await weth.getAddress(),
    ]),
  );
  await vaultProxy.waitForDeployment();
  const pVault = await ethers.getContractAt('Vault', await vaultProxy.getAddress());

  await pStrategy.transferOwnership(await vaultProxy.getAddress());

  return {
    weth,
    usdc,
    oracle,
    flashLender,
    strategy: pStrategy,
    vault: pVault,
    owner,
    otherAccount,
    anotherAccount,
  };
}
