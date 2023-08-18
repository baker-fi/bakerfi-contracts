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
  deployAAVEv3Strategy,
} from "../../scripts/common";

describe.only("AAVEv3Strategy", function () {
  async function deployFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const STETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
    const FLASH_LENDER_DEPOSIT = ethers.parseUnits("10000", 18);
    const AAVE_DEPOSIT = ethers.parseUnits("10000", 18);
    const serviceRegistry = await deployServiceRegistry(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
    const weth = await deployWETH(serviceRegistry);
    // 1. Deploy Flash Lender
    const flashLender = await deployFlashLender(
      serviceRegistry,
      weth,
      FLASH_LENDER_DEPOSIT
    );
    // 2. Deploy stETH
    const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
    // 3. Deploy wstETH
    const wstETH = await deployWStEth(
      serviceRegistry,
      await stETH.getAddress()
    );
    // 4. Deploy WETH -> stETH Swapper
    const swapper = await deploySwapper(
      weth,
      stETH,
      serviceRegistry,
      STETH_MAX_SUPPLY
    );
    // 5. Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(
      wstETH,
      weth,
      serviceRegistry,
      AAVE_DEPOSIT
    );
    // 6. Deploy wstETH/ETH Oracle
    await deployWSETHToETHOracle(serviceRegistry);
    const levarage = await deployLeverageLibrary();
    const strategy = await deployAAVEv3Strategy(
      owner.address,
      serviceRegistryAddress,
      await levarage.getAddress()
    );

    return {
      stETH,
      weth,
      owner,
      otherAccount,
      serviceRegistry,
      swapper,
      aave3Pool,
      flashLender,
      wstETH,
      strategy
    };
  }

  it("Test Initialized Strategy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    expect(await strategy.getPosition()).to.deep.equal([ 0n, 0n]);
    expect(await strategy.totalAssets()).to.equal(0);
  });

  it("Test Deploy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    // Deploy 10 ETH
    expect(await strategy.deploy({
        value: ethers.parseUnits("10", 18)
    })).to.changeEtherBalances(
        [owner.address], [ ethers.parseUnits("10", 18)]
    );;
    expect(await strategy.getPosition()).to.deep.equal([ 
        45655671268679680000n, 
        35740737736704000000n
    ]);
    expect(await strategy.totalAssets()).to.equal(
        9914933531975680000n
    );
  
  });

 


});
