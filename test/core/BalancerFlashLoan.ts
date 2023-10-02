import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import BaseConfig from "../../scripts/config";
import { describeif } from "../common";
import {
  deployServiceRegistry,
  deployBalancerFL,
  deployFlashBorrowerMock,
} from "../../scripts/common";

describeif(network.name === "base_devnet")("Balancer Flash Loan", function () {

    async function deployFunction() {
        // ETH Token
        const [owner, otherAccount] = await ethers.getSigners();    
        const serviceRegistry = await deployServiceRegistry(owner.address);
        const networkName = network.name;
        const config = BaseConfig[networkName];
    
        await serviceRegistry.registerService(
          ethers.keccak256(Buffer.from("Balancer Vault")),
          config.balancerVault
        );
    
        const weth = await ethers.getContractAt("IWETH",  config.weth);        
        const cbETH = await ethers.getContractAt("IERC20",  config.cbETH);
    
        await serviceRegistry.registerService(
          ethers.keccak256(Buffer.from("cbETH")),
          config.cbETH
        );
     
        await serviceRegistry.registerService(
          ethers.keccak256(Buffer.from("WETH")),
          config.weth
        );

        const fl = await deployBalancerFL(serviceRegistry);
        const borrower = await deployFlashBorrowerMock(serviceRegistry);
    
        // Add the ETH/CBV
        return { owner, otherAccount, weth, cbETH, config, fl, borrower};        
      }
      

      it("Borrow from Balancer Vault", async function () {
        const { weth, owner, cbETH, fl, config, borrower } = await loadFixture(deployFunction);        
        await borrower.flashme(          
            config.weth,
            ethers.parseUnits("10", 18),
        );     
        expect(await borrower.borrowed(config.weth)).to.equal(
            10000000000000000000n
        );
      })
})