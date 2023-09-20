import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployServiceRegistry,
  deployVault,
  deployCbETH,
  deploySwapper,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deployLeverageLibrary,
  deployAAVEv3StrategyAny,
} from "../../scripts/common";

describe("AAVEv3StrategyAny", function () {
  async function deployFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const CBETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
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
    // 2. Deploy cbEBT
    const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);
    // 3. Deploy WETH -> cbETH Swapper
    const swapper = await deploySwapper(   
      weth,    
      cbETH,
      serviceRegistry,
      CBETH_MAX_SUPPLY
    );

    await swapper.setRatio(1130*(1e6));
    // 4. Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(
      cbETH,    
      weth,    
      serviceRegistry,
      AAVE_DEPOSIT
    );
    // 5. Deploy cbETH/ETH Oracle
    const oracle  = await deployOracleMock(serviceRegistry, "cbETH/ETH Oracle");
    const levarage = await deployLeverageLibrary();

    const strategy = await deployAAVEv3StrategyAny(
      owner.address,
      serviceRegistryAddress,
      await levarage.getAddress(),
      "cbETH",
      "cbETH/ETH Oracle"
    );

    return {
      cbETH,
      weth,
      owner,
      otherAccount,
      serviceRegistry,
      swapper,
      aave3Pool,
      flashLender,
      strategy,
      oracle
    };
  }

  it("Test Deploy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    // Deploy 10 ETH
    expect(await strategy.deploy({
        value: ethers.parseUnits("10", 18)
    })).to.changeEtherBalances(
        [owner.address], [ ethers.parseUnits("10", 18)]
    );;
    expect(await strategy.getPosition()).to.deep.equal([ 
        45705032703999999999n, 
        35740737736704000000n
    ]);
    expect(await strategy.totalAssets()).to.equal(
        9964294967295999999n
    );  
  });


  it("Test Undeploy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);   
    const receiver  = "0x3762eFfD0BDDDb76688eb90F5fD0301AeeC90120";
     // Deploy 10TH ETH
     await strategy.deploy({
        value: ethers.parseUnits("10", 18)
    });
    expect(await strategy.getPosition()).to.deep.equal([ 
        45705032703999999999n, 
        35740737736704000000n
    ]);
    expect(await strategy.totalAssets()).to.equal(
        9964294967295999999n
    );  
    // Receive ~=5 ETH
    await strategy.undeploy(
        ethers.parseUnits("5", 18), 
        "0x3762eFfD0BDDDb76688eb90F5fD0301AeeC90120"
    );

    const provider = ethers.provider;
    expect(await provider.getBalance(receiver)).to.equal(4999999992797565943n);
  })


});
