import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployBaseServices,
  deployAction,
} from "../common";

describe("Pull Token", function () {

  async function deployBaseFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const {erc20, proxyRegistry, stack, serviceRegistry } = await deployBaseServices(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
    const pullToken = await deployAction("PullToken", serviceRegistryAddress);
    return {
      erc20,
      owner,
      otherAccount,
      proxyRegistry,
      stack,
      serviceRegistry,
      pullToken,
    };
  }

  describe("Pull Token", async function () {
    
    it("When i call using the proxy", async function () {
      const {
        owner,
        erc20,
        proxyRegistry,
        pullToken,
      } = await loadFixture(deployBaseFunction);

      const proxyAddress = await proxyRegistry.proxies(owner.address);      
      const pullTokenAddress = await pullToken.getAddress();
      const ownerProxy = await ethers.getContractAt("DSProxy", proxyAddress);
      const pulledAmount =  ethers.parseUnits("10", 18);
      
      const encodeData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint256"],
        [
          await erc20.getAddress(),
          owner.address,          
          pulledAmount,
        ]
      );
      
      const encodedCall = pullToken.interface.encodeFunctionData("run", [
        encodeData,
        [0, 0, 0],
      ]);

      // Allow the Proxy to Pull the assets
      await erc20.approve(proxyAddress, pulledAmount);

      // Push the Funds to Proxy
      await ownerProxy.executeTarget(
        pullTokenAddress,
        encodedCall
      );
      expect(
        await erc20.balanceOf(proxyAddress)
    ).to.equal(pulledAmount);
    });
  });

});
