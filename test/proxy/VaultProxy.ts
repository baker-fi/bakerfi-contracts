import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { deployServiceRegistry, deployWETH } from '../../scripts/common';

describeif(network.name === 'hardhat')('Vault Proxy', function () {
  it('Vault Initialization', async function () {
    const { vaultProxy, deployer } = await loadFixture(deployFunction);
    expect(await vaultProxy.symbol()).to.equal('brETH');
    expect(await vaultProxy.balanceOf(deployer.address)).to.equal(0);
    expect(await vaultProxy.totalSupply()).to.equal(0);
    expect(await vaultProxy.owner()).to.equal(deployer.address);
  });
});

async function deployFunction() {
  const [deployer, otherAccount] = await ethers.getSigners();

  // Deploy Proxy Admin
  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(deployer.address);
  await proxyAdmin.waitForDeployment();

  // Deploy Service Registry
  const serviceRegistry = await deployServiceRegistry(deployer.address);
  const weth = await deployWETH(serviceRegistry);
  // Deploy Strategy Mock
  const StrategyMock = await ethers.getContractFactory('StrategyMock');
  const strategy = await StrategyMock.deploy(await weth.getAddress());
  await strategy.waitForDeployment();

  // Deploy Non Upgradable Settings
  const Settings = await ethers.getContractFactory('Settings');
  const settings = await Settings.deploy();
  await settings.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Settings')),
    await settings.getAddress(),
  );

  // Deploy Vault Default Implementation
  const Vault = await ethers.getContractFactory('Vault');
  const vault = await Vault.deploy();
  await vault.waitForDeployment();

  // Vault Proxy Deployment
  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const proxyDeployment = await BakerFiProxy.deploy(
    await vault.getAddress(),
    await proxyAdmin.getAddress(),
    Vault.interface.encodeFunctionData('initialize', [
      deployer.address,
      'Bread ETH',
      'brETH',
      await serviceRegistry.getAddress(),
      await strategy.getAddress(),
    ]),
  );

  await proxyDeployment.waitForDeployment();

  const vaultProxy = await Vault.attach(await proxyDeployment.getAddress());

  return {
    deployer,
    settings,
    vaultProxy,
    proxyAdmin,
    otherAccount,
    proxyDeployment,
  };
}
