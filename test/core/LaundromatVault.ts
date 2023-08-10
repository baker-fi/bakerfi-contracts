import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployServiceRegistry,
  deployVault,
  deployStEth,
  deployWStEth,
  deploySwapper,
  deployAaveV3,
  deployFlashLender,
  deployWSETHToETHOracle,
  deployWETH,
  deployLeverageLibrary,
} from "../../scripts/common";

describe.only("Vault", function () {

    async function deployFunction() {
        const [owner, otherAccount] = await ethers.getSigners();
        const STETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
        const FLASH_LENDER_DEPOSIT = ethers.parseUnits("10000", 18);
        const AAVE_DEPOSIT = ethers.parseUnits("10000", 18);
        const serviceRegistry = await deployServiceRegistry(owner.address);
        const serviceRegistryAddress = await serviceRegistry.getAddress();
        const weth = await deployWETH(serviceRegistry);
        const levarage = await deployLeverageLibrary();
        const vault = await deployVault(owner.address, serviceRegistryAddress, await levarage.getAddress() );
        // 1. Deploy Flash Lender 
        const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
        // 2. Deploy stETH 
        const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
        // 3. Deploy wstETH
        const wstETH  = await deployWStEth(serviceRegistry, await stETH.getAddress());
        // 4. Deploy WETH -> stETH Swapper
        const swapper = await deploySwapper(weth, stETH, serviceRegistry, STETH_MAX_SUPPLY);
        // 5. Deploy AAVEv3 Mock Pool
        const aave3Pool = await deployAaveV3(wstETH, weth, serviceRegistry, AAVE_DEPOSIT);
        // 6. Deploy wstETH/ETH Oracle 
        await deployWSETHToETHOracle(serviceRegistry);

        return {
          stETH,
          weth,
          owner,
          otherAccount,
          serviceRegistry,
          vault,
          swapper,
          aave3Pool, 
          flashLender,
          wstETH,
        };
      }
    
      it("Test Deposit", async function (){ 
        
        const {
            owner,
            vault,
        } = await loadFixture(deployFunction);
        
        const depositAmount =  ethers.parseUnits("10", 18);

        await vault.deposit(owner.address, {
            value: depositAmount,
        });

        expect(await vault.symbol()).to.equal("mateETH");
        expect(await vault.name()).to.equal("laundromat ETH");        
        expect(await vault.totalAssets()).to.equal(9124061032737616160n);
        expect(await vault.balanceOf(owner.address)).to.equal(9124061032737616160n);
        expect(await vault.totalSupply()).to.equal(9124061032737616160n);
        expect(await vault.tokenPerETh()).to.equal(ethers.parseUnits("1", 18));
      });

    it("Test Withdraw", async function (){ 
        
        const {
            owner,
            vault,
        } = await loadFixture(deployFunction);

        const depositAmount =  ethers.parseUnits("10", 18);

        await vault.deposit(owner.address, {
            value: depositAmount,
        });

        await vault.withdraw( ethers.parseUnits("1", 18), owner.address);
        expect(await vault.balanceOf(owner.address)).to.equal(9124061032737616160n);
        expect(await vault.totalSupply()).to.equal(9124061032737616160n);
        expect(await vault.totalAssets()).to.equal(9124061032737616160n);
    })

})
