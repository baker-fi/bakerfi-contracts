import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";


describeif(network.name === "hardhat")("Proxy Settings", function () {
  async function deployFunction() {
    const [deployer, proxyOwner, settingsOwner] = await ethers.getSigners();
    const Settings = await ethers.getContractFactory("Settings");
    const settings = await Settings.deploy(settingsOwner.address);
    await settings.waitForDeployment();
    
    const UpgradableProxy = await ethers.getContractFactory("UpgradableProxy");
    const proxySettings = await UpgradableProxy.deploy(
      await settings.getAddress(),
      proxyOwner.address,
      "0x"
    );
    await proxySettings.waitForDeployment();
    
    return { deployer, proxyOwner, settingsOwner, proxySettings };
  }

  it("Proxy Owner Upgrade settings implementation", async function () {
    
  });
});