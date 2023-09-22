import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network} from "hardhat";
import { 
  deployMockERC20, 
  deployUniV3RouterMock, 
  deployServiceRegistry,
  deployUniSwapper
} from "../../scripts/common";

import BaseConfig from "../../scripts/config";
import { ISwapHandler } from '../../src/typechain/contracts/interfaces/core/ISwapHandler';
import { describeif } from "../common";

describeif(network.name === "hardhat")("Laundromat Swapper", function () {
  
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



describeif(network.name === "base_devnet")("UniSwapper with Real Router", () => {
  
  async function deployFunction() {
    // ETH Token
    const [owner, otherAccount] = await ethers.getSigners();    
    const serviceRegistry = await deployServiceRegistry(owner.address);
    const networkName = network.name;
    const config = BaseConfig[networkName];

    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Uniswap Router")),
      config.uniswapRouter
    );

    // Deploy Swapper Adapter
    const swapper = await deployUniSwapper(
        await owner.getAddress(),
        serviceRegistry,
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

    // Add the ETH/CBV
    await swapper.addFeeTier(config.weth,  config.cbETH, 500);
    return { owner, otherAccount, weth, cbETH, swapper, config};    

  }
  
  it("Swap ETH for cbETH", async function () {
    const { weth, owner, cbETH, swapper, config } = await loadFixture(deployFunction);    
    const swapAmount = ethers.parseUnits("10", 18); 
        
    await weth.deposit({
      value: swapAmount
    });

    const balance = await weth.balanceOf(owner.address);        
    // Approve the Swapper Handler to move funds on my behalf 
    await weth.approve(await swapper.getAddress(), ethers.parseUnits("100", 18));
    await cbETH.approve(await swapper.getAddress(), ethers.parseUnits("100", 18));

    const params: ISwapHandler.SwapParamsStruct = {
      underlyingIn: config.weth,
      underlyingOut: config.cbETH,
      mode: 0,         
      amountIn: ethers.parseUnits("10", 18),  
      amountOut: 0,
      payload: "0x"
    };
    const balanceBefore = await cbETH.balanceOf(owner.address);
    // Execute the Swap 
    await swapper.executeSwap(params);    
    expect(balance).to.equal(swapAmount);    
    expect(await cbETH.balanceOf(owner.address)).to.greaterThan(balanceBefore);

  });


  it("Swap cbETH -> WETH", async function () {
    const { weth, owner, cbETH, swapper, config } = await loadFixture(deployFunction);    
    const swapAmount = ethers.parseUnits("10", 18); 
        
    await weth.deposit({
      value: swapAmount
    });

    const balance = await weth.balanceOf(owner.address);        
    // Approve the Swapper Handler to move funds on my behalf 
    await weth.approve(await swapper.getAddress(), ethers.parseUnits("100", 18));
    await cbETH.approve(await swapper.getAddress(), ethers.parseUnits("100", 18));

    const params: ISwapHandler.SwapParamsStruct = {
      underlyingIn: config.weth,
      underlyingOut: config.cbETH,
      mode: 0,         
      amountIn: ethers.parseUnits("10", 18),  
      amountOut: 0,
      payload: "0x"
    };

    // Execute the Swap 
    await swapper.executeSwap(params);    
    const cbETHBalance = await cbETH.balanceOf(owner.address);
    const params2: ISwapHandler.SwapParamsStruct = {
      underlyingIn: config.cbETH,
      underlyingOut: config.weth,
      mode: 0,         
      amountIn: cbETHBalance,  
      amountOut: 0,
      payload: "0x"
    };
    const balanceBefore = await weth.balanceOf(owner.address);        
    await swapper.executeSwap(params2);    
    expect(await weth.balanceOf(owner.address)).to.greaterThan(balanceBefore);

  });

})
