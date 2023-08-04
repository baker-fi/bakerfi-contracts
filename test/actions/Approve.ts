import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployBaseServices,
  deploySetApproval,
} from "../common";

describe("Approve", function () {

  async function deployBaseFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const {erc20, proxyRegistry, stack, serviceRegistry } = await deployBaseServices(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
    const setApproval = await deploySetApproval(serviceRegistryAddress);
    return {
      erc20,
      owner,
      otherAccount,
      proxyRegistry,
      stack,
      serviceRegistry,
      setApproval,
    };
  }

  describe("Approve", async function () {
    
    it("When i call using a proxy", async function () {
      const {
        owner,
        erc20,
        proxyRegistry,
        serviceRegistry,
        setApproval,
        otherAccount,
      } = await loadFixture(deployBaseFunction);
      const proxyAddress = await proxyRegistry.proxies(owner.address);
      const approvalAddress = await setApproval.getAddress();
      const ownerProxy = await ethers.getContractAt("DSProxy", proxyAddress);
      
      const encodeData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint256"],
        [
          await erc20.getAddress(),
          otherAccount.address,
          ethers.parseUnits("10", 18),
        ]
      );
      const encodedCall = setApproval.interface.encodeFunctionData("run", [
        encodeData,
        [0, 0, 0],
      ]);
      await ownerProxy.executeTarget(
        await setApproval.getAddress(),
        encodedCall
      );

      expect(
        await erc20.allowance(proxyAddress, otherAccount.address)
      ).to.equal(ethers.parseUnits("10", 18));
    });
  });



});
