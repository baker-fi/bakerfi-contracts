import { ethers } from "hardhat";
import {
  deployAaveV3,
  deployFlashLender,
  deployLeverageLibrary,
  deployServiceRegistry,
  deployStEth,
  deploySwapper,
  deployVault,
  deployWETH,
  deployWSETHToETHOracle,
  deployWStEth,
  deployAAVEv3Strategy,
} from "./common";

/**
 * Deploy the Basic System for testing 
 */
async function main() {
  // Max Staked ETH available
  console.log("---------------------------------------------------------------------------");
  console.log("💥 Laundromat Deploying ....");
  const STETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
  const FLASH_LENDER_DEPOSIT = ethers.parseUnits("100", 18);
  const AAVE_DEPOSIT = ethers.parseUnits("1000", 18);

  const [owner] = await ethers.getSigners();
  // 1. Deploy the Service Registry
  const serviceRegistry = await deployServiceRegistry(owner.address);
  console.log("Service Registry =", await serviceRegistry.getAddress());
  // 2. Deploy the Leverage Library
  const leverageLib = await deployLeverageLibrary();
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
  // 7. Deploy wETH/stETH Swapper
  const swapper  = await deploySwapper(weth, stETH, serviceRegistry, STETH_MAX_SUPPLY);
  console.log("Swap Router Mock =", await swapper.getAddress());
  // 8. Deploy AAVE Mock Service
  const aaveV3PoolMock = await deployAaveV3(wstETH, weth, serviceRegistry, AAVE_DEPOSIT); 
  console.log("AAVE v3 Mock =", await aaveV3PoolMock.getAddress());
  // 9. Deploy wstETH/ETH Oracle 
  const oracle = await deployWSETHToETHOracle(serviceRegistry);
  const AAVEv3Strategy = await deployAAVEv3Strategy( 
    await serviceRegistry.getAddress(), await leverageLib.getAddress() );
  // 10. Deploy the Vault attached to Leverage Lib
    const vault = await deployVault(
      owner.address, 
      await serviceRegistry.getAddress(),
      await leverageLib.getAddress() 
    );
  console.log("Laundromat Vault =", await vault.getAddress(), await AAVEv3Strategy.getAddress() );  

  console.log("WSETH/ETH Oracle =", await oracle.getAddress());
  console.log("---------------------------------------------------------------------------");
  console.log("💥 Laundromat Deployment Done 👏");
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
