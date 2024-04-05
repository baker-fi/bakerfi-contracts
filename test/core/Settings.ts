import "@nomicfoundation/hardhat-ethers";
import { describeif } from "../common";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { deployServiceRegistry, deploySettings } from "../../scripts/common";



describeif(network.name === "hardhat")("Settings", function () {
  it("Settings Defaults ✅", async function () {
    const { settings } = await loadFixture(deployFunction);
    expect(await settings.owner()).to.equal(
      "0xF39FC4F1d439D03E82f698a86f2D79C6aa9dD380"
    );
    expect(await settings.getWithdrawalFee()).to.equal(10 * 1e6);
    expect(await settings.getPerformanceFee()).to.equal(10 * 1e6);
    expect(await settings.getFeeReceiver()).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(await settings.getMaxDepositInETH()).to.equal(0);
  });


  it("Change Withdrawal Fee ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setWithdrawalFee(20 * 1e6);
    expect(await settings.getWithdrawalFee()).to.equal(20 * 1e6);
  });

  it("Withdrawal Fee ❌", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setWithdrawalFee(1100 * 1e6)
    // @ts-expect-error
    ).to.be.revertedWithCustomError(settings, "InvalidPercentage");
  });

  it("Change Perfornance Fee ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setPerformanceFee(20 * 1e6);
    expect(await settings.getPerformanceFee()).to.equal(20 * 1e6);
  });

  it("Invalid Perfornance Fee ❌", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setPerformanceFee(1100 * 1e6)
    // @ts-expect-error
    ).to.be.revertedWithCustomError(settings, "InvalidPercentage");
  });

  it("Change Fee Receiver ✅", async function () {
    const { settings, owner, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setFeeReceiver(owner.address);
    expect(await settings.getFeeReceiver()).to.equal(owner.address);
  });

  it("Owner is no able to update ❌", async function () {
    const { settings, owner, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await expect(settings.setFeeReceiver(owner.address)).to.be.revertedWith("Ownable: caller is not the owner");
  });



  it("Account should be allowed when empty white list ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      await settings.isAccountEnabled(otherAccount.address)
    ).to.equal(true);
  });

  it("Account should not be allowed when is not on the whitelist ✅ ", async function () {
    const { settings, owner, otherAccount } = await loadFixture(deployFunction);

    await settings
      .connect(otherAccount)
      // @ts-expect-error
      .enableAccount(otherAccount.address, true);
    await expect(await settings.isAccountEnabled(owner.address)).to.equal(
      false
    );
  });

  it("Only Owner allowed to change white list ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      settings.enableAccount(otherAccount.address, true)
    // @ts-expect-error
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Fail to enable an address that is enabled ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);

    await settings
      .connect(otherAccount)
      // @ts-expect-error
      .enableAccount(otherAccount.address, true);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).enableAccount(otherAccount.address, true)
    // @ts-expect-error
    ).to.be.revertedWithCustomError(settings, "WhiteListAlreadyEnabled");
  });

  it("Fail to disable an address that is disabled ❌", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).enableAccount(otherAccount.address, false)
    // @ts-expect-error
    ).to.be.revertedWithCustomError(settings, "WhiteListNotEnabled");
  });

  it("Change Max Deposit ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);

    await settings
      .connect(otherAccount)
      // @ts-expect-error
      .setMaxDepositInETH(ethers.parseUnits("1", 17));

    // @ts-expect-error
    expect(await settings.connect(otherAccount).getMaxDepositInETH()).to.equal(
      ethers.parseUnits("1", 17)
    );
  });

  it("Only Owner can change max deposit ❌", async function () {
    const { settings } = await loadFixture(deployFunction);
    await expect(
      settings.setMaxDepositInETH(ethers.parseUnits("1", 17))
    // @ts-expect-error
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  
  it("Change Rebalance Price Max Age ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);

    await settings
      .connect(otherAccount)
      // @ts-expect-error
      .setRebalancePriceMaxAge(3600);

    // @ts-expect-error
    expect(await settings.connect(otherAccount).getRebalancePriceMaxAge()).to.equal(
      3600
    );
  });

  it("Only Owner can change Rebalance Price Max Age", async function () {
    const { settings } = await loadFixture(deployFunction);
    await expect(
      settings.setRebalancePriceMaxAge(3600)
    // @ts-expect-error
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Change Price Max Age ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);

    await settings
      .connect(otherAccount)
      // @ts-expect-error
      .setPriceMaxAge(3600);

    // @ts-expect-error
    expect(await settings.connect(otherAccount).getPriceMaxAge()).to.equal(
      3600
    );
  });

  it("Only Owner can change Rebalance Price Max Age", async function () {
    const { settings } = await loadFixture(deployFunction);
    await expect(
      settings.setPriceMaxAge(3600)
      // @ts-expect-error
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });


  it("Transfer Settings Ownership in 2 Steps", async function () {
    const { settings, owner, otherAccount} = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).transferOwnership(owner.address);
    expect(await settings.pendingOwner()).to.equal(owner.address);
    // @ts-expect-error
    await settings.connect(owner).acceptOwnership();
    expect(await settings.pendingOwner()).to.equal("0x0000000000000000000000000000000000000000");
    expect(await settings.owner()).to.equal(owner.address);
  });
});


async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();
  const serviceRegistry = await deployServiceRegistry(owner.address);

  const BakerFiProxyAdmin = await ethers.getContractFactory(
    "BakerFiProxyAdmin"
  );
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

  const { proxy } = await deploySettings(
    otherAccount.address,
    serviceRegistry,
    proxyAdmin
  );

  const pSettings = await ethers.getContractAt(
    "Settings",
    await proxy.getAddress()
  );

  return { serviceRegistry, settings: pSettings, otherAccount, owner };
}
