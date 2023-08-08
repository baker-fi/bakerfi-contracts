import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployBaseServices,
  deployVault,
} from "../common";



describe.only("Vault", function () {

    async function deployFunction() {
        const [owner, otherAccount] = await ethers.getSigners();
        const { erc20, proxyRegistry, weth, stack, serviceRegistry } =
          await deployBaseServices(owner.address);
    
        const serviceRegistryAddress = await serviceRegistry.getAddress();
        const vault = await deployVault(owner.address, serviceRegistryAddress);
        
        return {
          erc20,
          weth,
          owner,
          otherAccount,
          proxyRegistry,
          stack,
          serviceRegistry,
          vault,
        };
      }
    

      it("Test Deposit", async function (){ 
        const {
            owner,
            erc20,
            weth,
            serviceRegistry,
            otherAccount,
            vault,
        } = await loadFixture(deployFunction);
        
        const depositAmount =  ethers.parseUnits("10", 18);

        await vault.deposit(otherAccount.address, {
            value: depositAmount,
        });

        expect(await vault.symbol()).to.equal("lndETH");
        expect(await vault.name()).to.equal("laundromat ETH");
        expect(await vault.totalSupply()).to.equal( ethers.parseUnits("10", 18));
        expect(await weth.balanceOf(await vault.getAddress())).to.equal(depositAmount);
        expect(await vault.balanceOf(otherAccount.address)).to.equal(depositAmount);

      })

})