import { describeif } from '../../common';

import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import BaseConfig from '../../../constants/network-deploy-config';
import { NetworkConfig } from '../../../constants/types';

describeif(network.name === 'base_devnet')('Strategy Supply Morpho', function () {
  async function deployFunction() {
    const [owner] = await ethers.getSigners();
    const config: NetworkConfig = BaseConfig[network.name];
    const StrategySupplyMorpho = await ethers.getContractFactory('StrategySupplyMorpho');

    // 1. Attach to WETH Contract on Base or Ethereum
    const WETH = await ethers.getContractFactory('WETH');
    const weth = WETH.attach(config.weth);
    const WSETH_ETH_Market = '0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba';

    // 2. Deposit 100 ETH to WETH
    const deployAmount = ethers.parseEther('100'); // 100 ETH in Wei
    await weth.deposit({ value: deployAmount });

    // 3. Deploy StrategySupplyMorpho
    const morphoSupply = await StrategySupplyMorpho.deploy(
      owner.address,
      config.weth,
      config.morpho,
      WSETH_ETH_Market,
    );

    await morphoSupply.waitForDeployment();
    await weth.approve(await morphoSupply.getAddress(), ethers.MaxUint256);

    return { morphoSupply, weth, config, owner };
  }

  it('Vault Initialization', async function () {
    const { morphoSupply, config } = await loadFixture(deployFunction);
    expect(await morphoSupply.asset()).to.equal(config.weth);
    // Verify if the deposit is reflected in the strategy
    expect(await morphoSupply.totalAssets()).to.equal(0);
  });

  it('Deposit 10 WETH', async function () {
    const { morphoSupply } = await loadFixture(deployFunction);
    // Deploy 10 WETH to StrategySupplyMorpho
    const deployAmount = ethers.parseEther('10');
    // 5. Deploy 10 WETH to StrategySupplyMorpho
    expect(await morphoSupply.deploy(deployAmount))
      .to.emit(morphoSupply, 'StrategyDeploy')
      .withArgs(deployAmount)
      .emit(morphoSupply, 'StrategyAmountUpdate')
      .withArgs(deployAmount);
    // Verify if the deposit is reflected in the strategy
    expect(await morphoSupply.totalAssets()).to.closeTo(deployAmount, 100);
  });

  it('Withdraw 5 WETH', async function () {
    const { morphoSupply } = await loadFixture(deployFunction);
    const deployAmount = ethers.parseEther('10');
    await morphoSupply.deploy(deployAmount);

    // 5. Deploy 10 WETH to StrategySupplyMorpho
    expect(await morphoSupply.undeploy(ethers.parseEther('5')))
      .to.emit(morphoSupply, 'StrategyUndeploy')
      .withArgs(deployAmount)
      .emit(morphoSupply, 'StrategyAmountUpdate');
  });

  it('Withdraw All', async function () {
    const { morphoSupply, owner } = await loadFixture(deployFunction);
    const deployAmount = ethers.parseEther('10');
    await morphoSupply.deploy(deployAmount);
    // 5. Deploy 10 WETH to StrategySupplyMorpho
    await expect(morphoSupply.undeploy(ethers.parseEther('10')))
      .to.emit(morphoSupply, 'StrategyUndeploy')
      .withArgs(owner.address, (value) => {
        return value >= deployAmount;
      })
      .emit(morphoSupply, 'StrategyAmountUpdate');
  });
});
