import { ethers } from "hardhat";
import {
  deployAaveV3,
  deployFlashLender,
  deployServiceRegistry,
  deployStEth,
  deploySwapper,
  deployQuoterV2Mock,
  deployVault,
  deployWETH,
  deployOracleMock,
  deployWStEth,
  deployAAVEv3StrategyWstETH,
  deploySettings,
} from "./common";

/**
 * Deploy the Basic System for testing 
 */
async function main() {
  // Max Staked ETH available
  console.log("---------------------------------------------------------------------------");
  console.log("💥 BakerFi Deploying ....");
  const STETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
  const FLASH_LENDER_DEPOSIT = ethers.parseUnits("10000", 18);
  const AAVE_DEPOSIT = ethers.parseUnits("10000", 18);

  const [owner] = await ethers.getSigners();
  // 1. Deploy the Service Registry
  const serviceRegistry = await deployServiceRegistry(owner.address);
  console.log("Service Registry =", await serviceRegistry.getAddress());
  // 3. Deploy the WETH 
  const weth = await deployWETH(serviceRegistry);
  console.log("WETH =", await weth.getAddress());
  // 4. Deploy the Vault attached to Leverage Lib
  const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
  console.log("FlashLender Mock =", await flashLender.getAddress());
  // 5. Deploy stETH ERC-20
  const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
  console.log("stETH =", await stETH.getAddress());
  // 6. Deploy wstETH ERC-20
  const wstETH  = await deployWStEth(serviceRegistry, await stETH.getAddress());
  console.log("wstETH =", await wstETH.getAddress());
  const settings  = await deploySettings(owner.address, serviceRegistry);
  console.log("feeSettings =", await settings.getAddress());
  // 7. Deploy wETH/stETH Swapper
  const swapper = await deploySwapper(weth, stETH, serviceRegistry, STETH_MAX_SUPPLY);
  // 7. Addd Pair
  await swapper.addPair(
    await weth.getAddress(),
    await wstETH.getAddress()
  );

  console.log("Swap Router Mock =", await swapper.getAddress());
  // 8. Deploy AAVE Mock Service
  const aaveV3PoolMock = await deployAaveV3(wstETH, weth, serviceRegistry, AAVE_DEPOSIT); 
  console.log("AAVE v3 Mock =", await aaveV3PoolMock.getAddress());
  // 9. Deploy wstETH/ETH Oracle 
  const uniQuoter = await deployQuoterV2Mock(serviceRegistry);
  console.log("Uniswap Quoter =", await uniQuoter.getAddress() );  
  const oracle = await deployOracleMock(serviceRegistry, "wstETH/ETH Oracle");
  console.log("wstETH/ETH Oracle =", await oracle.getAddress() );  
  const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");    
  console.log("ETH/USD Oracle =", await ethOracle.getAddress() );  
  await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));
  const strategy = await deployAAVEv3StrategyWstETH( 
    owner.address,
    await serviceRegistry.getAddress(), 
    1,
  );
  // 10. Deploy the Vault attached to Leverage Lib
    const vault = await deployVault(
      owner.address, 
      await serviceRegistry.getAddress(),
      await strategy.getAddress() 
    );
  console.log("BakerFi Vault =", await vault.getAddress() );  
  console.log("BakerFi Vault AAVEv3 Strategy =", await strategy.getAddress());
  await strategy.transferOwnership(await vault.getAddress());

  console.log("WSETH/ETH Oracle =", await oracle.getAddress());
  console.log("---------------------------------------------------------------------------");
  console.log("💥 BakerFi Deployment Done 👏");
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
