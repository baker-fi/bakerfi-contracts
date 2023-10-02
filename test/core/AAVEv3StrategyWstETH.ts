import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network} from "hardhat";
import {
  deployServiceRegistry,
  deployVault,
  deployStEth,
  deployWStEth,
  deploySwapper,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deployLeverageLibrary,
  deployAAVEv3StrategyWstETH,
  deployQuoterV2Mock,
} from "../../scripts/common";
import { describeif } from "../common";


describeif(network.name === "hardhat")("AAVEv3StrategyWstETH", function () {
  async function deployFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const STETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
    const DEPOSIT_ST_ETH_SUPPLY = ethers.parseUnits("10000000", 18);
    const WRAP_ST_ETH_DEPOSIT = ethers.parseUnits("10000000", 18);
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
      DEPOSIT_ST_ETH_SUPPLY
    );
    
    await stETH.approve(await wstETH.getAddress(), WRAP_ST_ETH_DEPOSIT);
    await wstETH.wrap(WRAP_ST_ETH_DEPOSIT);
    const balance = await wstETH.balanceOf(owner.address);    
    await weth.deposit?.call("", { value:  ethers.parseUnits("100", 18) });
    await weth.transfer(await swapper.getAddress(), ethers.parseUnits("100", 18) );
    
    await swapper.addPair(
      await weth.getAddress(),
      await wstETH.getAddress()
    );

    // 5. Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(
      wstETH,
      weth,
      serviceRegistry,
      AAVE_DEPOSIT
    );

    await deployQuoterV2Mock(serviceRegistry);
    // 6. Deploy wstETH/ETH Oracle
    const oracle  = await deployOracleMock(serviceRegistry, "wstETH/ETH Oracle");
    const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");    
    await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));

    const levarage = await deployLeverageLibrary();
    const strategy = await deployAAVEv3StrategyWstETH(
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
      strategy,
      oracle
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
        45655671260000000000n, 
        35740737730000000000n
    ]);
    expect(await strategy.totalAssets()).to.equal(
        9914933530000000000n
    );
  
  });


  it("Test Profit", async function () {
    const { owner, strategy, aave3Pool } = await loadFixture(deployFunction);
    // Deploy 10 ETH
    await strategy.deploy({
        value: ethers.parseUnits("10", 18)
    })
    // Increment the Collateral value by 10%
    await aave3Pool.setCollateralPerEth(
        1130*(1e6)*1.1
    );

    expect(strategy.harvest()).to
    .emit(strategy, "StrategyProfit")
    .withArgs(
        4969613303000000000n,   
    ); 
    expect(await strategy.getPosition()).to.deep.equal([ 
        50221238390000000000n, 
        35740737730000000000n
    ]);
    expect(await strategy.totalAssets()).to.equal(
        14480500660000000000n
    );
  })


  it("Test Loss", async function () {
    const { owner, oracle, strategy, aave3Pool } = await loadFixture(deployFunction);   
     // Deploy 10 ETH
     await strategy.deploy({
        value: ethers.parseUnits("10", 18)
    })
     // Increment the Collateral value by 10%
    await aave3Pool.setCollateralPerEth(
        1130*(1e6)*0.9
    );

    await oracle.setLatestPrice(
      1130*(1e6)*0.9
    );
    await strategy.harvest();

    expect(await strategy.getPosition()).to.deep.equal([ 
      26488409310000000000n, 
      21153630020000000000n
    ]);
    expect(await strategy.totalAssets()).to.equal(
      5334779290000000000n
    );
  })


});
