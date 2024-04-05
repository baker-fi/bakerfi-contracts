import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";


describeif(network.name === "hardhat")("Proxy Settings", function () {
  
  async function deployFunction() {
    const [deployer, otherAccount] = await ethers.getSigners();
    const Settings = await ethers.getContractFactory("Settings");
    const BakerFiProxy = await ethers.getContractFactory("BakerFiProxy");
    const BakerFiProxyAdmin = await ethers.getContractFactory("BakerFiProxyAdmin");
    
    const proxyAdmin = await BakerFiProxyAdmin.deploy(deployer.address);
    await proxyAdmin.waitForDeployment();

    const settings = await Settings.deploy();
    await settings.waitForDeployment();

    const proxyDeployment = await BakerFiProxy.deploy(
      await settings.getAddress(),
      await proxyAdmin.getAddress(),
      Settings.interface.encodeFunctionData("initialize", [deployer.address])
    );
    
    await proxyDeployment.waitForDeployment();    

    const proxy = await Settings.attach(await proxyDeployment.getAddress());

    return { deployer, settings, proxy, proxyAdmin, otherAccount, proxyDeployment};
  }


  it("Settings Initialization ", async function () {
    const { proxy } = await loadFixture(deployFunction);    
    expect(await proxy.getWithdrawalFee()).to.equal(10 * 1e6);
    expect(await proxy.getPerformanceFee()).to.equal(10 * 1e6);
    expect(await proxy.getFeeReceiver()).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
  })

  it("Proxy Owner Update settings", async function () {
    const { proxy } = await loadFixture(deployFunction);    
    await proxy.setPerformanceFee(700 * 1e6);
    expect(await proxy.getPerformanceFee()).to.equal(
      700 * 1e6
    );
  });

   it("❌ Failed to update, not the owner", async function () {
    const { proxy, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      proxy.connect(otherAccount).setPerformanceFee(400 * 1e6)
      // @ts-expect-error
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });


  it("Proxy Owner Upgrade settings implementation", async function () {
    const { deployer, proxyAdmin, proxy, proxyDeployment} = await loadFixture(deployFunction);        
    
    await proxy.setPerformanceFee(700 * 1e6);

    const SettingsV2 = await ethers.getContractFactory("SettingsV2");   
    const settingsV2 = await SettingsV2.deploy();
    await settingsV2.waitForDeployment();


    await expect(proxyAdmin.upgrade(
      await proxy.getAddress(),
      await settingsV2.getAddress(),
      // @ts-expect-error
    )).to.emit(proxyDeployment, "Upgraded")
    .withArgs(
      await settingsV2.getAddress()
    );;

    const proxyNew = SettingsV2.attach(await proxy.getAddress());    

    expect(await proxyNew.getPerformanceFee()).to.equal(
      700 * 1e6
    );
    expect(await proxyNew.getNumber()).to.equal(10);
  });
  
});