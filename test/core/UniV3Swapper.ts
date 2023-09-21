import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  deployMockERC20, 
  deployUniV3RouterMock, 
  deployServiceRegistry,
  deployUniSwapper
} from "../../scripts/common";

describe("Laundromat Swapper", function () {
  
  async function deployFunction() {
    // ETH Token
    const [owner, otherAccount] = await ethers.getSigners();
    const WETH_SYMBOL = "WETH";
    const WETH_NAME = "Wrapped ETH";
    const WETH_MAX_SUPPLY = ethers.parseUnits("330000000", 18);
    const weth = await deployMockERC20(
      WETH_NAME,
      WETH_SYMBOL,
      WETH_MAX_SUPPLY,
      owner.address
    );
    // USDC Token
    const USDC_SYMBOL = "USDC";
    const UDSC_NAME = "Circle USD";
    const USDC_MAX_SUPPLY = ethers.parseUnits("1000000000000", 18);
    const usdc = await deployMockERC20(
      UDSC_NAME,
      USDC_SYMBOL,
      USDC_MAX_SUPPLY,
      owner.address
    );

    const serviceRegistry = await deployServiceRegistry(owner.address);
    // Deploy Uniswap Router with ETH and USDC Balance
    const univ3Router = await deployUniV3RouterMock(
      weth,
      ethers.parseUnits("33000", 18),
      usdc,
      ethers.parseUnits("1000000000", 18),
      serviceRegistry,
    );

    await univ3Router.setPrice(ethers.parseUnits("2000", 9));

    // Deploy Swapper Adapter
    const swapper = await deployUniSwapper(
      await owner.getAddress(),
      serviceRegistry,
    );

    await weth.transfer(otherAccount.address, ethers.parseUnits("1000", 18))
    await swapper.addFeeTier(
      weth.getAddress(),
      usdc.getAddress(),
      1000      
    );    
    return { owner, otherAccount, weth, usdc, univ3Router, swapper};    

  }

  it("Sucess ✅ Swaped with Fixed Input and Variable output", async function () {
      const { weth, usdc, otherAccount, swapper, univ3Router} = await loadFixture(deployFunction);      

      const inputAmount = ethers.parseUnits("10", 18);      

      await weth.connect(otherAccount).approve(await swapper.getAddress(), inputAmount);
      await swapper.connect(otherAccount).executeSwap(
        {
          underlyingIn: await weth.getAddress(),
          underlyingOut: await usdc.getAddress(),
          mode: 0,                 
          amountIn: ethers.parseUnits("10", 18),             
          amountOut: 0,                    
          payload: "0x"
        }
      );

      await expect(await weth.balanceOf(otherAccount.address)).to.equal( ethers.parseUnits("990", 18));
      await expect(await usdc.balanceOf(otherAccount.address)).to.equal(ethers.parseUnits("20000", 18));

      await expect(await weth.balanceOf(await univ3Router.getAddress())).to.equal(ethers.parseUnits("33010", 18),);
      await expect(await usdc.balanceOf(await univ3Router.getAddress())).to.equal(ethers.parseUnits("999980000", 18));
      
  });

  it("Swaped ✅ with Fixed Output and Variable input", async function () {
    const { weth, usdc, otherAccount, swapper, univ3Router} = await loadFixture(deployFunction);   
    
    const maxInputAmount = ethers.parseUnits("11", 18);       
    const expectedOutput = ethers.parseUnits("20000", 18);       
    await weth.connect(otherAccount).approve(await swapper.getAddress(), maxInputAmount);
    await swapper.connect(otherAccount).executeSwap(
      {
        underlyingIn: await weth.getAddress(),
        underlyingOut: await usdc.getAddress(),
        mode: 1,                 
        amountIn: maxInputAmount,             
        amountOut: expectedOutput,                    
        payload: "0x"
      }
    );

    await expect(await weth.balanceOf(otherAccount.address)).to.equal(ethers.parseUnits("990", 18));
    await expect(await usdc.balanceOf(otherAccount.address)).to.equal(ethers.parseUnits("20000", 18));

    await expect(await weth.balanceOf(await univ3Router.getAddress())).to.equal(ethers.parseUnits("33010", 18),);
    await expect(await usdc.balanceOf(await univ3Router.getAddress())).to.equal(ethers.parseUnits("999980000", 18));
  });

  it("Failed ❌ Swapped, not approved to spend input funds", async function () {
    const { weth, usdc, otherAccount, swapper } = await loadFixture(deployFunction);      
    const inputAmount = ethers.parseUnits("10", 18);      
    await expect(
      swapper.connect(otherAccount).executeSwap(
        {
          underlyingIn: await weth.getAddress(),
          underlyingOut: await usdc.getAddress(),
          mode: 0,                 
          amountIn: inputAmount,             
          amountOut: 0,                    
          payload: "0x"
        }
      )).to.be.revertedWith("ERC20: insufficient allowance");
    
  });

  it("Failed ❌ Swapped, not enough balance for the output", async function () {
    const { weth, usdc, otherAccount, swapper } = await loadFixture(deployFunction);      
    const inputAmount = ethers.parseUnits("100000000", 18);      
    await weth.connect(otherAccount).approve(await swapper.getAddress(), inputAmount);
    await expect(
      swapper.connect(otherAccount).executeSwap(
        {
          underlyingIn: await weth.getAddress(),
          underlyingOut: await usdc.getAddress(),
          mode: 0,                 
          amountIn: inputAmount,             
          amountOut: 0,                    
          payload: "0x"
        }
      )).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });

  it("Failed ❌ Swapped, pair not found", async function () {
    const { weth, usdc, otherAccount, swapper } = await loadFixture(deployFunction);    
    const inputAmount = ethers.parseUnits("10", 18);   
    
    await swapper.removeFeeTier(
      weth.getAddress(),
      usdc.getAddress()
    );    
    await weth.connect(otherAccount).approve(await swapper.getAddress(), inputAmount);
    await expect(
      swapper.connect(otherAccount).executeSwap(
        {
          underlyingIn: await weth.getAddress(),
          underlyingOut: await usdc.getAddress(),
          mode: 0,                 
          amountIn: ethers.parseUnits("10", 18),             
          amountOut: 0,                    
          payload: "0x"
        }
    )).to.be.revertedWith("Invalid Fee Tier to Swap");
  });

});
