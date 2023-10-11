import hre from "hardhat";
import {
  deployServiceRegistry,
  deployVault,
  deployAAVEv3StrategyWstETH,
  deployAAVEv3StrategyAny,
  deploySettings,
  deployUniSwapper,
  deploCbETHToETHOracle,
  deployBalancerFL,
} from "./common";

import BaseConfig from "./config";

/**
 * Deploy the Basic System for testing
 */
async function main() {
  console.log(
    "---------------------------------------------------------------------------"
  );
  console.log("💥 BakerFi Deploying ....");

  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId;
  console.log("Network name = ", networkName);
  console.log("Network chain id =", chainId);
  const config = BaseConfig[networkName];

  const [deployer] = await hre.ethers.getSigners();
  const serviceRegistry = await deployServiceRegistry(deployer.address);

  // 1. Deployed Service Registry
  console.log("Service Registry =", await serviceRegistry.getAddress());

  // 3. Register WETH
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("WETH")),
    config.weth
  );
  console.log(`WETH =`, config.weth);

  // 4. Deploy Settings
  const settings = await deploySettings(deployer.address, serviceRegistry);
  console.log("Settings =", await settings.getAddress());

  // 5. Register UniswapV3 Universal Router
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("Uniswap Router")),
    config.uniswapRouter
  );
  console.log("Uniswap V3 Router =", config.uniswapRouter);

  // 6. Deploy the Landromat Uniswap Router Adapter
  const swapper = await deployUniSwapper(
    deployer.address,
    serviceRegistry
  );
  console.log("Uniswap V3 Adapter = ", await swapper.getAddress());

  // 7. Register AAVE V3 Pool
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("AAVE_V3")),
    config.AAVEPool,
  );
  console.log("AAVE V3 Pool  =", config.AAVEPool);

  // Flash Lender Adapter
  await deployFlashLendInfra(serviceRegistry, config);

  if ( config.cbETH ) {
    // Register CbETH ERC20 Address
    await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("cbETH")),
    config.cbETH,
    );
    console.log("CbETH =", config.cbETH);
  }
  await deployCollateralOracle(config, serviceRegistry);

  const strategy = await deployStrategy(
    config, 
    deployer, 
    serviceRegistry
  );

  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("Strategy")),
    await strategy.getAddress() ,
  );

  // 10. Deploy the Vault attached to Leverage Lib
  const vault = await deployVault(
        deployer.address, 
      await serviceRegistry.getAddress(),
      await strategy.getAddress() 
  );
  await strategy.transferOwnership(await vault.getAddress());
  console.log("Vault =", await vault.getAddress());
  console.log("---------------------------------------------------------------------------");
  console.log(`💥 BakerFi Deployment Done on  ${networkName} 👏`);
}

async function deployFlashLendInfra(serviceRegistry, config: any) {
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("Balancer Vault")),
    config.balancerVault
  );
  const flashLender = await deployBalancerFL(
    serviceRegistry
  );
  console.log(`Balancer Flash Lender Adapter =`, await flashLender.getAddress());
}

async function deployStrategy(config: any, deployer, serviceRegistry) {
  let strategy;
  switch (config.strategy) {
    case "base":
        strategy = await deployAAVEv3StrategyAny(
        deployer.address,
        await serviceRegistry.getAddress(),
        hre.ethers.keccak256(Buffer.from("cbETH")),
        hre.ethers.keccak256(Buffer.from("cbETH/ETH Oracle")),
        config.swapFeeTier,
        config.AAVEEModeCategory
      );     
      break;
    default:
      break;
  }
  console.log("AAVEv3Strategy =", await strategy.getAddress());
  return strategy;
}

/**
 * 
 * @param config 
 * @param serviceRegistry 
 * @returns 
 */
async function deployCollateralOracle(config: any, serviceRegistry) {
  let oracle;
  switch (config.oracle.type) {
    case "cbETH":
      oracle = await deploCbETHToETHOracle(
        serviceRegistry,
        config.oracle.chainLink
      );
      break;
    default:
      break;
  }
  console.log("Oracle =", await oracle.getAddress());
  return oracle;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});