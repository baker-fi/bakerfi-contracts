import { describeif } from "../common";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network} from "hardhat";
import {
    deployServiceRegistry,
    deploySettings,
  } from "../../scripts/common";

describeif(network.name === "hardhat")("Settings", function () {

    async function deployFunction() {
        const [owner, otherAccount] = await ethers.getSigners();
        const serviceRegistry = await deployServiceRegistry(owner.address);     
        // 4. Deploy Settings
       const settings = await deploySettings(otherAccount.address, serviceRegistry);
        return {serviceRegistry, settings, otherAccount,owner };
    }

    it("Settings Defaults", async function () {
        const { settings } = await loadFixture(deployFunction);
        expect(await settings.owner()).to.equal("0xF39FC4F1d439D03E82f698a86f2D79C6aa9dD380");
        expect(await settings.getLoanToValue()).to.equal( 800*(1e6));
        expect(await settings.getMaxLoanToValue()).to.equal( 850*(1e6));
        expect(await settings.getWithdrawalFee()).to.equal(10*(1e6));
        expect(await settings.getPerformanceFee()).to.equal(10*(1e6));
        expect(await settings.getFeeReceiver()).to.equal("0x0000000000000000000000000000000000000000");
    })

    it("Change Loan to Value", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await settings.connect(otherAccount).setLoanToValue(700*(1e6));
        expect(await settings.connect(otherAccount).getLoanToValue()).to.equal( 700*(1e6));
    });


    it("❌ Invalid Loan to Value", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await expect(settings.connect(otherAccount).setLoanToValue(1100*(1e6)))
        .to.be.revertedWith("Invalid percentage value");
    });


    it("Change Max Loan to Value", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await settings.connect(otherAccount).setMaxLoanToValue(820*(1e6));
        expect(await settings.connect(otherAccount).getMaxLoanToValue()).to.equal( 820*(1e6));
    });


    it("❌ Invalid Max Loan to Value", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await expect(settings.connect(otherAccount).setMaxLoanToValue(400*(1e6)))
        .to.be.revertedWith("Max Loan to Value should be higher than loan to value");
    });

    it("❌ Invalid Max Loan to Value", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await expect(settings.connect(otherAccount).setMaxLoanToValue(1100*(1e6)))
        .to.be.revertedWith("Invalid percentage value");
    });

    it("Change Withdrawal Fee", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await settings.connect(otherAccount).setWithdrawalFee(20*(1e6));
        expect(await settings.getWithdrawalFee()).to.equal( 20*(1e6));
    });


    it("❌ Withdrawal Fee", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await expect(settings.connect(otherAccount).setWithdrawalFee(1100*(1e6)))
        .to.be.revertedWith("Invalid percentage value");       
    });

    it("Change Perfornance Fee", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await settings.connect(otherAccount).setPerformanceFee(20*(1e6));
        expect(await settings.getPerformanceFee()).to.equal( 20*(1e6));
    });

    it("❌ Invalid Perfornance Fee", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await expect(settings.connect(otherAccount).setPerformanceFee(1100*(1e6)))
        .to.be.revertedWith("Invalid percentage value");
    });

    it("Change Fee Receiver", async function () {
        const { settings,owner, otherAccount} = await loadFixture(deployFunction);
        await settings.connect(otherAccount).setFeeReceiver(owner.address);
        expect(await settings.getFeeReceiver()).to.equal(owner.address);
    });
    
    it("Owner is no able to update",async function () {
        const { settings,owner, otherAccount} = await loadFixture(deployFunction);
        await expect(settings.setFeeReceiver(owner.address))
          .to.be.revertedWith("Ownable: caller is not the owner");
    });


    it("Change Max Loan To value", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await settings.connect(otherAccount).setMaxLoanToValue(850*(1e6));
        expect(await settings.getMaxLoanToValue()).to.equal(850*(1e6));
    });


    it("Change Nr Loops", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await settings.connect(otherAccount).setNrLoops(5);
        expect(await settings.connect(otherAccount).getNrLoops()).to.equal( 5);
    });


    it("❌ Invalid Nr Loops", async function () {
        const { settings, otherAccount} = await loadFixture(deployFunction);
        await expect(settings.connect(otherAccount).setNrLoops(30)).to.be.revertedWith("Invalid Number of Loops");
    });

});