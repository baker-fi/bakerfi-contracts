import "@nomicfoundation/hardhat-ethers";
import { describeif } from "../common";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";


describeif(network.name === "hardhat")("OwnableUpgradeable2StepMock", function () {
    
    it("Initial Owner", async function () {
        const { ownable, owner, otherAccount } = await loadFixture(deployFunction);
        expect(await ownable.owner()).to.equal(owner.address);
    });

    it("Transfer Ownership", async function () {
        const { ownable, owner, otherAccount } = await loadFixture(deployFunction);
        await ownable.transferOwnership(otherAccount.address);
        expect(await ownable.pendingOwner()).to.equal(otherAccount.address);
        // @ts-expect-error
        await ownable.connect(otherAccount).acceptOwnership();
        expect(await ownable.pendingOwner()).to.equal("0x0000000000000000000000000000000000000000");
        expect(await ownable.owner()).to.equal(otherAccount.address);
    });

    it("Revert when other account tries to transfer ownership", async function () {

        const { ownable, owner, otherAccount } = await loadFixture(deployFunction);

        await expect(
            // @ts-expect-error
            ownable.connect(otherAccount).transferOwnership(otherAccount.address)
            // @ts-expect-error
          ).to.be.revertedWithCustomError(ownable, "CallerNotTheOwner");
    });


    it("Revert when other account tries to accept ownership", async function () {
        const { ownable, owner, otherAccount } = await loadFixture(deployFunction);
        await ownable.transferOwnership(otherAccount.address);
        expect(await ownable.pendingOwner()).to.equal(otherAccount.address);
        await expect(
            ownable.acceptOwnership()
            // @ts-expect-error
          ).to.be.revertedWithCustomError(ownable, "CallerNotThePendingOwner");
    });

    it("Revert when tries to transfer ownership to invalid address", async function () {
        const { ownable, owner, otherAccount } = await loadFixture(deployFunction);
        await expect(
            ownable.transferOwnership("0x0000000000000000000000000000000000000000")
            // @ts-expect-error
        ).to.be.revertedWithCustomError(ownable, "InvalidOwnerAddress");
    });

});


async function deployFunction() {
    const [owner, otherAccount, anotherAccount] = await ethers.getSigners();

  
    const BakerFiProxyAdmin = await ethers.getContractFactory(
      "BakerFiProxyAdmin"
    );
    const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
    await proxyAdmin.waitForDeployment();
  
    const OwnableUpgradable2Step = await ethers.getContractFactory("OwnableUpgradeable2StepMock");
    const ou2Step = await OwnableUpgradable2Step.deploy();
    await ou2Step.waitForDeployment();
    const BakerFiProxy = await ethers.getContractFactory("BakerFiProxy");

    const proxy = await BakerFiProxy.deploy(
        await ou2Step.getAddress(),
        await proxyAdmin.getAddress(),
        OwnableUpgradable2Step.interface.encodeFunctionData("initialize", [owner.address])
      );
      await proxy.waitForDeployment();
  
    const ownableUpgradablep = await ethers.getContractAt(
      "OwnableUpgradeable2Step",
      await proxy.getAddress()
    );
  
    return { ownable: ownableUpgradablep, otherAccount, owner };
}