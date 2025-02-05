import { describeif } from '../../common';

import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { deployMockERC20 } from '../../../scripts/common';

describeif(network.name === 'hardhat')('Strategy Supply ERC4626', function () {
  async function deployFunction() {
    const [owner] = await ethers.getSigners();
    const StrategySupplyERC4626 = await ethers.getContractFactory('StrategySupplyERC4626');
    const ERC4626VaultMock = await ethers.getContractFactory('ERC4626VaultMock');

    const usdc = await deployMockERC20(
      'USDC',
      'USDC',
      // 10M USDC
      10000000n * 10n ** 18n,
      owner.address,
    );

    const vaultContract = await ERC4626VaultMock.deploy(await usdc.getAddress());
    await vaultContract.waitForDeployment();

    const strategySupplyERC4626 = await StrategySupplyERC4626.deploy(
      owner.address,
      await usdc.getAddress(),
      await vaultContract.getAddress(),
    );
    await strategySupplyERC4626.waitForDeployment();

    return { strategySupplyERC4626, usdc, vaultContract, owner };
  }

  it('Vault Initialization', async function () {
    const { strategySupplyERC4626, usdc, owner } = await loadFixture(deployFunction);
    expect(await strategySupplyERC4626.asset()).to.equal(await usdc.getAddress());
    expect(await strategySupplyERC4626.totalAssets()).to.equal(0);
    expect(await strategySupplyERC4626.owner()).to.equal(owner.address);
  });

  it('Deposit 10 USDC', async function () {
    const { strategySupplyERC4626, usdc, vaultContract } = await loadFixture(deployFunction);
    // 10 USDC
    const deployAmount = ethers.parseEther('10');
    await usdc.approve(await strategySupplyERC4626.getAddress(), deployAmount);
    await strategySupplyERC4626.deploy(deployAmount);
    expect(await strategySupplyERC4626.totalAssets()).to.equal(deployAmount);
    expect(await usdc.balanceOf(await vaultContract.getAddress())).to.equal(deployAmount);
  });

  it('Withdraw 10 USDC', async function () {
    const { strategySupplyERC4626, usdc, vaultContract } = await loadFixture(deployFunction);
    const withdrawAmount = ethers.parseEther('10');
    await usdc.approve(await strategySupplyERC4626.getAddress(), withdrawAmount);
    await strategySupplyERC4626.deploy(withdrawAmount);
    await strategySupplyERC4626.undeploy(withdrawAmount);
    expect(await strategySupplyERC4626.totalAssets()).to.equal(0);
    expect(await usdc.balanceOf(await vaultContract.getAddress())).to.equal(0);
  });
});
