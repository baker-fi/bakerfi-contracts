import "@nomicfoundation/hardhat-ethers";
import { describeif } from "../common";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { deployServiceRegistry, deploySettings } from "../../scripts/common";

/**
 * Settings Contract Unit Tests
 */

/**
 * Deploys the ProxyAdmin and a Settings behind a BakerFiProxy
 *
 */
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

describeif(network.name === "hardhat")("Settings", function () {
  it("Settings Defaults ✅", async function () {
    const { settings } = await loadFixture(deployFunction);
    expect(await settings.owner()).to.equal(
      "0xF39FC4F1d439D03E82f698a86f2D79C6aa9dD380"
    );
    expect(await settings.getLoanToValue()).to.equal(800 * 1e6);
    expect(await settings.getMaxLoanToValue()).to.equal(850 * 1e6);
    expect(await settings.getWithdrawalFee()).to.equal(10 * 1e6);
    expect(await settings.getPerformanceFee()).to.equal(10 * 1e6);
    expect(await settings.getFeeReceiver()).to.equal(
      "0x0000000000000000000000000000000000000000"
    );
    expect(await settings.getMaxDepositInETH()).to.equal(0);
  });

  it("Change Loan to Value ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setLoanToValue(700 * 1e6);
    // @ts-expect-error
    expect(await settings.connect(otherAccount).getLoanToValue()).to.equal(
      700 * 1e6
    );
  });

  it("Invalid Loan to Value ❌", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setLoanToValue(1100 * 1e6)
    ).to.be.revertedWithCustomError(settings, "InvalidValue");
  });

  it("Change Max Loan to Value ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setMaxLoanToValue(820 * 1e6);
    // @ts-expect-error
    expect(await settings.connect(otherAccount).getMaxLoanToValue()).to.equal(
      820 * 1e6
    );
  });

  it("Invalid Max Loan to Value ❌", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setMaxLoanToValue(400 * 1e6)
    ).to.be.revertedWithCustomError(settings, "InvalidMaxLoanToValue");
  });

  it("Invalid Max Loan to Value ❌", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setMaxLoanToValue(1100 * 1e6)
    ).to.be.revertedWithCustomError(settings, "InvalidPercentage");
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
    await expect(settings.setFeeReceiver(owner.address)).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Change Max Loan To value ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setMaxLoanToValue(850 * 1e6);
    expect(await settings.getMaxLoanToValue()).to.equal(850 * 1e6);
  });

  it("Change Nr Loops ✅", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setNrLoops(5);

    // @ts-expect-error
    expect(await settings.connect(otherAccount).getNrLoops()).to.equal(5);
  });

  it("Invalid Nr Loops ❌", async function () {
    const { settings, owner, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setNrLoops(30)
    ).to.be.revertedWithCustomError(settings, "InvalidLoopCount");
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
    ).to.be.revertedWithCustomError(settings, "WhiteListAlreadyEnabled");
  });

  it("Fail to disable an address that is disabled ❌", async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).enableAccount(otherAccount.address, false)
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
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
