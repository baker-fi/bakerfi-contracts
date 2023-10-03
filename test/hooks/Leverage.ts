import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";
import {
    deployLeverage,  
  } from "../../scripts/common";

describeif(network.name === "hardhat")("Leverage", function () {
        
    async function deployFunction() {
        const [owner, otherAccount] = await ethers.getSigners();
        const leverage = await deployLeverage();
        return {owner, leverage};
    }

    it("LTV 80% and 10 Loops", async function () {
        const { leverage } = await loadFixture(deployFunction);
        expect(await leverage.calculateLeverageRatio(
            ethers.parseUnits("10", 18), 
            800*1e6,
            10
        )).to.equal(45705032704000000000n);
    })

    it("LTV 90% and 5 Loops", async function () {
        const { leverage } = await loadFixture(deployFunction);
        expect(await leverage.calculateLeverageRatio(
            ethers.parseUnits("10", 18), 
            800*1e6,
            5
        )).to.equal(36892800000000000000n);
    })

    it("LTV 10% and 1 Loops", async function () {
        const { leverage } = await loadFixture(deployFunction);
        expect(await leverage.calculateLeverageRatio(
            ethers.parseUnits("10", 18), 
            100*1e6,
            1
        )).to.equal(11000000000000000000n);
    })

    it("LTV 10% and 0 Loops", async function () {
        const { leverage } = await loadFixture(deployFunction);
        expect(await leverage.calculateLeverageRatio(
            ethers.parseUnits("10", 18), 
            100*1e6,
            0
        )).to.equal(10000000000000000000n);
    })

    it("Fail LTV 0% and 10 Loops", async function () {
        const { leverage } = await loadFixture(deployFunction);
        await expect(leverage.calculateLeverageRatio(
            ethers.parseUnits("10", 18), 
            0,
            10
        )).to.be.revertedWith("Invalid Loan to value");
    })

    it("Fail LTV 110% and 10 Loops", async function () {
        const { leverage } = await loadFixture(deployFunction);
        await expect( leverage.calculateLeverageRatio(
            ethers.parseUnits("10", 18), 
            1100*1e6,
            10
        )).to.be.revertedWith("Invalid Loan to value");
    })

    it("Fail LTV 80% and 21 Loops", async function () {
        const { leverage } = await loadFixture(deployFunction);
        await expect(leverage.calculateLeverageRatio(
            ethers.parseUnits("10", 18), 
            100*1e6,
            21
        )).to.be.revertedWith("Invalid Number of Loops");
    })
})