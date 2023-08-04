import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployBaseServices,
  deployAction,
} from "../common";

describe("Wrap Token", function () {

  async function deployBaseFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const {erc20, weth, proxyRegistry, stack, serviceRegistry } = await deployBaseServices(owner.address);
    const wrapETH = await deployAction(
        "WrapETH", 
        await weth.getAddress(), 
        await serviceRegistry.getAddress()
    );
    return {
      erc20,
      owner,
      otherAccount,
      proxyRegistry,
      stack,
      serviceRegistry,
      wrapETH,
    };
  }

  describe("Wrap Token", async function () {
    
    it("When i call using the proxy", async function () {
      const {
        owner,
        erc20,
        proxyRegistry,
        wrapETH,
        otherAccount,
      } = await loadFixture(deployBaseFunction);

      const proxyAddress = await proxyRegistry.proxies(owner.address);      
      const ownerProxy = await ethers.getContractAt("DSProxy", proxyAddress);
      const wrapETHAddress = await wrapETH.getAddress();
      // Sending 10ETH Mrs Billionaire
      const sendAmount =  ethers.parseUnits("10", 18);
      await ownerProxy.fallback?.call("", {value: sendAmount});

      const proxyBalance = await ethers.provider.getBalance(proxyAddress);
      expect(proxyBalance).to.equal(ethers.parseUnits("10", 18));

      
    });
  });

});
