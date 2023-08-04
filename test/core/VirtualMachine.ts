import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployBaseServices,
  deployVirtualMachine,
  deployAction,
} from "../common";

import { InstructionCallStruct, VirtualMachine } from '../../typechain-types/contracts/core/VirtualMachine';

describe("Virtual Machine", function () {
  async function deployFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const { erc20, proxyRegistry, stack, serviceRegistry } =
      await deployBaseServices(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
    const pullToken = await deployAction("PullToken", serviceRegistryAddress);
    const transfer = await deployAction("Transfer", serviceRegistryAddress);
    const vm = await deployVirtualMachine(owner.address, serviceRegistryAddress);
    const pullTokenAddress =  await pullToken.getAddress();

    await serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("PullToken")),     
        pullTokenAddress,      
    );
    
    return {
      erc20,
      owner,
      otherAccount,
      proxyRegistry,
      stack,
      serviceRegistry,
      pullToken,
      transfer,
      vm,
    };
  }

  it("When i call the Virtual Machine", async function () {
    const {
      owner,
      erc20,
      proxyRegistry,
      otherAccount,
      pullToken,
      transfer,
      vm,
    } = await loadFixture(deployFunction);

    const proxyAddress = await proxyRegistry.proxies(owner.address);
    const ownerProxy = await ethers.getContractAt("DSProxy", proxyAddress);
    const vmAddress = await vm.getAddress();
    const pulledAmount = ethers.parseUnits("10", 18);

    // Allow the Proxy to Pull the assets
    await erc20.approve(proxyAddress, pulledAmount);
    const erc20Address = await erc20.getAddress();

    const encodeData = ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "address", "uint256"],
        [erc20Address, owner.address, pulledAmount]
      );
  
    const PullCallData = pullToken.interface.encodeFunctionData("run", [
        encodeData,
        [0, 0, 0],
    ]);
    
    const instructions: InstructionCallStruct[] =[ {
        target: ethers.keccak256(Buffer.from("PullToken")),
        callData: PullCallData
    }]

    const vmCtc = await ethers.getContractAt("VirtualMachine", vmAddress );

    const encodedCall = vmCtc.interface.encodeFunctionData('execute', [
        instructions
    ]);
           
    await ownerProxy.executeTarget(
        vmAddress,
        encodedCall
    );
    expect(await erc20.balanceOf(proxyAddress)).to.equal(pulledAmount);

  });
});
