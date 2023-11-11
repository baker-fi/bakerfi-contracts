import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";
import {
    deployServiceRegistry,
    deployVault,
    deployStEth,
    deployWStEth,
    deployAaveV3,
    deployFlashLender,
    deployOracleMock,
    deployWETH,
    deployAAVEv3StrategyWstETH,
    deploySettings,
    deployQuoterV2Mock,
  } from "../../scripts/common";

describeif(network.name === "hardhat")("Vault Proxy", function () {
  
  async function deployFunction() {
    const [deployer, otherAccount] = await ethers.getSigners();

    // Deploy Proxy Admin
    const BakerFiProxyAdmin = await ethers.getContractFactory("BakerFiProxyAdmin");
    const proxyAdmin = await BakerFiProxyAdmin.deploy(deployer.address);
    await proxyAdmin.waitForDeployment();    
    
    // Deploy Service Registry
    const serviceRegistry = await deployServiceRegistry(deployer.address);

    // Deploy Strategy Mock
    const StrategyMock = await ethers.getContractFactory("StrategyMock");
    const strategy = await StrategyMock.deploy();
    await strategy.waitForDeployment();
    
    // Deploy Non Upgradable Settings 
    const Settings = await ethers.getContractFactory("Settings");
    const settings = await Settings.deploy();
    await settings.waitForDeployment();    
    await serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("Settings")),
        await settings.getAddress()
    );
        
    // Deploy Vault Default Implementation
    const BakerFiVault = await ethers.getContractFactory("BakerFiVault");
    const vault = await BakerFiVault.deploy();
    await vault.waitForDeployment();

    // Vault Proxy Deployment 
    const BakerFiProxy = await ethers.getContractFactory("BakerFiProxy");
    const proxyDeployment = await BakerFiProxy.deploy(
      await vault.getAddress(),
      await proxyAdmin.getAddress(),
      BakerFiVault.interface.encodeFunctionData("initialize", [
        deployer.address,
        await serviceRegistry.getAddress(),
        await strategy.getAddress()
      ])
    );
    
    await proxyDeployment.waitForDeployment();    

    const vaultProxy = await BakerFiVault.attach(await proxyDeployment.getAddress());

    return { deployer, settings, vaultProxy, proxyAdmin, otherAccount, proxyDeployment};
  }


  it("Vault Initialization", async function () {
    const { vaultProxy, deployer } = await loadFixture(deployFunction);    
    expect(await vaultProxy.symbol()).to.equal("brETH");
    expect(await vaultProxy.balanceOf(deployer.address)).to.equal(0);
    expect(await vaultProxy.totalSupply()).to.equal(0);
    expect(await vaultProxy.owner()).to.equal(deployer.address);
  })

  
});