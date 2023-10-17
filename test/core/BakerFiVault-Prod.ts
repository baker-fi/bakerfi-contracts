import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";

import {
  getDeployFunc,
} from "./common";

describeif(
    network.name === "ethereum_devnet" ||
    network.name === "optimism_devnet" || 
    network.name === "base_devnet"
)("BakerFi - Production", function () {
  
  it("Test Initialized Vault", async function () {   
    const { deployer, vault, strategy } = await loadFixture(getDeployFunc());
    expect(await vault.symbol()).to.equal("brETH");
    expect(await vault.balanceOf(deployer.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect((await strategy.getPosition())[0]).to.equal(0);
    expect((await strategy.getPosition())[1]).to.equal(0);
    expect((await strategy.getPosition())[2]).to.equal(0);
    expect(await vault.tokenPerETh()).to.equal(ethers.parseUnits("1", 18));
    expect(await vault.loanToValue()).to.equal(0);
  });

  it("Deposit 1 ETH", async function () {
    const { vault, deployer, strategy } = await loadFixture(getDeployFunc());

    const depositAmount = ethers.parseUnits("1", 18);
    await vault.deposit(deployer.address, {
      value: depositAmount,
    });
    expect(await vault.balanceOf(deployer.address))
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
    expect((await strategy.getPosition())[0])
      .to.greaterThan(ethers.parseUnits("40", 17))
      .lessThanOrEqual(ethers.parseUnits("46", 17));
    expect((await strategy.getPosition())[1])
      .to.greaterThan(ethers.parseUnits("33", 17))
      .lessThanOrEqual(ethers.parseUnits("37", 17));
    expect(await vault.totalAssets())
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
    expect((await strategy.getPosition())[2])
      .to.greaterThan(700000000n)
      .lessThanOrEqual(810000000n);
    expect(await vault.totalSupply())
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
    expect(await vault.tokenPerETh())
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
  });

  it("Deposit + Withdraw", async function () {
    const { vault, settings, deployer, strategy} = await loadFixture(getDeployFunc());
    const depositAmount = ethers.parseUnits("10", 18);

    await settings.setLoanToValue(ethers.parseUnits("500", 6));

    await vault.deposit(deployer.address, {
      value: depositAmount,
    });

    const provider = ethers.provider;
    const balanceBefore = await provider.getBalance(deployer.address);
    await vault.withdraw(ethers.parseUnits("5", 18));
    expect(await vault.balanceOf(deployer.address))
      .to.greaterThan(ethers.parseUnits("4", 18))
      .lessThanOrEqual(ethers.parseUnits("6", 18));
    expect((await strategy.getPosition())[0])
      .to.greaterThan(ethers.parseUnits("9", 18))
      .lessThanOrEqual(ethers.parseUnits("11", 18));
    expect((await strategy.getPosition())[1])
      .to.greaterThan(ethers.parseUnits("4", 18))
      .lessThanOrEqual(ethers.parseUnits("6", 18));
    expect(await vault.totalAssets())
      .to.greaterThan(ethers.parseUnits("4", 18))
      .lessThanOrEqual(ethers.parseUnits("6", 18));
    expect((await strategy.getPosition())[2])
      .to.greaterThan(400000000n)
      .lessThanOrEqual(600000000n);
    expect(await vault.totalSupply())
      .to.greaterThan(ethers.parseUnits("4", 18))
      .lessThanOrEqual(ethers.parseUnits("6", 18));
    expect(await vault.tokenPerETh())
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
    const balanceAfter = await provider.getBalance(deployer.address);
    expect(balanceAfter - balanceBefore)
      .greaterThan(ethers.parseUnits("4", 18))
      .lessThanOrEqual(ethers.parseUnits("11", 18));
  });

  it("Liquidation Protection - Adjust Debt", async function () {
    const { vault, strategy, settings, aave3Pool, weth, deployer, wstETH } =
      await loadFixture(getDeployFunc());

    await settings.setLoanToValue(ethers.parseUnits("500", 6));
    await settings.setMaxLoanToValue(ethers.parseUnits("510", 6));

    const depositAmount = ethers.parseUnits("1", 18);

    await expect(
      vault.deposit(deployer.address, {
        value: depositAmount,
      })
    )
      .to.emit(strategy, "StrategyAmountUpdate")
      .withArgs(await strategy.getAddress(), (value) => {
        return value >= 971432545612539374n;
      });

    await settings.setLoanToValue(ethers.parseUnits("400", 6));
    await settings.setMaxLoanToValue(ethers.parseUnits("400", 6));

    await expect(vault.rebalance())
      .to.emit(strategy, "StrategyAmountUpdate")
      .withArgs(await strategy.getAddress(), (value) => {
        return value >= 902114986650737323n;
      });
    expect((await strategy.getPosition())[2])
      .to.greaterThan(300000000n)
      .lessThanOrEqual(410000000n);
  });
});

