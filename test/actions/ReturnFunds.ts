import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { deployBaseServices, deployAction } from "../common";

describe("ReturnFunds", function () {
  async function deployBaseFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const { erc20, proxyRegistry, stack, serviceRegistry } =
      await deployBaseServices(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
    const pullToken = await deployAction("PullToken", serviceRegistryAddress);
    const returnFunds = await deployAction(
      "ReturnFunds",
      serviceRegistryAddress
    );
    return {
      erc20,
      owner,
      otherAccount,
      proxyRegistry,
      stack,
      serviceRegistry,
      pullToken,
      returnFunds,
    };
  }

  it("When i call using the proxy", async function () {
    const {
      owner,
      returnFunds,
      otherAccount,
      erc20,
      proxyRegistry,
      pullToken,
    } = await loadFixture(deployBaseFunction);

    const proxyAddress = await proxyRegistry.proxies(owner.address);
    const pullTokenAddress = await pullToken.getAddress();
    const returnFundsAddres = await returnFunds.getAddress();
    const ownerProxy = await ethers.getContractAt("DSProxy", proxyAddress);
    const pulledAmount = ethers.parseUnits("10", 18);
    const returnAmount = ethers.parseUnits("5", 18);

    // Allow the Proxy to Pull the assets
    await erc20.approve(proxyAddress, pulledAmount);

    // Push the Funds to Proxy
    await ownerProxy.executeTarget(
      pullTokenAddress,
      pullToken.interface.encodeFunctionData("run", [
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "address", "uint256"],
          [await erc20.getAddress(), owner.address, pulledAmount]
        ),
        [0, 0, 0],
      ])
    );
    expect(await erc20.balanceOf(proxyAddress)).to.equal(pulledAmount);

    // Pull the Funds from the token
    await ownerProxy.executeTarget(
      returnFundsAddres,
      pullToken.interface.encodeFunctionData("run", [
        ethers.AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256"],
          [await erc20.getAddress(), returnAmount]
        ),
        [0, 0, 0],
      ])
    );
    expect(await erc20.balanceOf(owner.address)).to.equal(
      ethers.parseUnits("9999995", 18)
    );
  });
});
