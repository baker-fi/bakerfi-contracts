import hre from "hardhat";
import {
  deployLeverageLibrary,
  deployServiceRegistry,
  deployVault,
  deployWstAAVEv3Strategy,
  deploySettings,
  deployUniSwapper,
  deploCbETHToETHOracle,
} from "./common";

import BaseConfig from "./config";

/**
 * Deploy the Basic System for testing
 */
async function main() {
  // Max Staked ETH available
  console.log(
    "---------------------------------------------------------------------------"
  );
  console.log("💥 Laundromat Deploying ....");

  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId;
  console.log("Network name=", networkName);
  console.log("Network chain id=", chainId);
  const config = BaseConfig[networkName];

  const [deployer] = await hre.ethers.getSigners();
  const serviceRegistry = await deployServiceRegistry(deployer.address);

  // 1. Deployed Service Registry
  console.log("Service Registry =", await serviceRegistry.getAddress());

  // 2. Deploy the Leverage Library
  const leverageLib = await deployLeverageLibrary();

  // 3. Register WETH
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("WETH")),
    config.weth
  );
  console.log(`WETH =`, config.weth);

  // 4. Deploy Settings
  const settings = await deploySettings(deployer.address, serviceRegistry);
  console.log("Settings  =", await settings.getAddress());

  // 5. Register UniswapV3 Universal Router
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("Uniswap Router")),
    config.uniswapRouter
  );
  console.log("Uniswap V3 Router  =", config.uniswapRouter);

  // 6. Deploy the Landromat Uniswap Router Adapter
  const swapper = await deployUniSwapper(
    deployer.address,
    await serviceRegistry.getAddress()
  );
  console.log("Uniswap V3 Adapter =", await swapper.getAddress());

  // 7. Register AAVE V3 Pool
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("AAVE_V3")),
    config.AAVEPool,
  );
  console.log("AAVE V3 Pool  =", config.AAVEPool);

   // 7. Register CbETH Address
   await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("cbETH")),
    config.cbETH,
  );
  
  console.log("CbETH =", config.cbETH);

  // 7. cbETH/ETH Oracle 
  const oracle = await deploCbETHToETHOracle(   
    serviceRegistry,
    config.OracleCbETHToETH
  );
  console.log("cbETH/ETH Oracle =", await oracle.getAddress());

  const strategy = await deployWstAAVEv3Strategy( 
    deployer.address,
    await serviceRegistry.getAddress(), 
    await leverageLib.getAddress() 
  );

  console.log("AAVEv3Strategy =", await strategy.getAddress());
  // 10. Deploy the Vault attached to Leverage Lib
  const vault = await deployVault(
        deployer.address, 
      await serviceRegistry.getAddress(),
      await strategy.getAddress() 
  );
  console.log("Vault =", await vault.getAddress());
  console.log("---------------------------------------------------------------------------");
  console.log("💥 Laundromat Deployment Done 👏");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
