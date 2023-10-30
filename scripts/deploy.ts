import "dotenv/config";
import hre from "hardhat";
import {
  deployServiceRegistry,
  deployVault,
  deployAAVEv3StrategyAny,
  deploySettings,
  deployETHOracle,
  deploCbETHToETHOracle,
  deploWSTETHToETHOracle,
  deployBalancerFL,
} from "./common";

import BaseConfig from "./config";
import ora from 'ora';

/**
 * Deploy the Basic System for testing
 */
async function main() {
  console.log("  🧑‍🍳 BakerFi Cooking .... ");
  const networkName = hre.network.name;
  const chainId = hre.network.config.chainId;
  const result: any[] = [];
  const spinner = ora('Cooking ....').start();

  result.push(["Network Name", networkName])
  result.push(["Network Id", chainId])
  const config = BaseConfig[networkName];

  spinner.text = "Getting Signers";
  const [deployer] = await hre.ethers.getSigners();
  /********************************************
   *  Registry Service
   ********************************************/
  spinner.text = "Deploying Registry";
  const serviceRegistry = await deployServiceRegistry(deployer.address);
  result.push(["Service Registry", await serviceRegistry.getAddress()])  
  /********************************************
   *  Settings
   ********************************************/
  spinner.text = "Registiring WETH";
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("WETH")),
    config.weth
  );
  result.push(["WETH", config.weth]);
  /********************************************
   *  Settings
   ********************************************/
  spinner.text = "Deploying BakerFi Settings";
  const settings = await deploySettings(deployer.address, serviceRegistry); 
  result.push(["Settings", await settings.getAddress()]);  
  /********************************************
   *  Uniswap Router
   ********************************************/
  spinner.text = "Registiring Uniswap Router Contract";
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("Uniswap Router")),
    config.uniswapRouter
  );
  result.push(["Uniswap V3 Router", config.uniswapRouter]);
  /********************************************
   *  Uniswap Quoter
   ********************************************/
  spinner.text = "Registiring Uniswap Quoter Contract";  
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("Uniswap Quoter")),
    config.uniswapQuoter
  );
  result.push(["Uniswap V3 Quoter",  config.uniswapQuoter]);
  /********************************************
   *  AAVEv3 Vault
   ********************************************/
  spinner.text = "Registiring AAVE v3 Contract";  
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("AAVE_V3")),
    config.AAVEPool,
  );
  result.push(["AAVE V3 Pool",  config.AAVEPool]);
  /********************************************
   * Flash Lender Adapter
   ********************************************/
  spinner.text = "Deploying Flash Lender Adapter";  
  const flashLenderAdapter = await deployFlashLendInfra(serviceRegistry, config);
  result.push(["Flash Lender", await flashLenderAdapter.getAddress()]);
  /********************************************
   * cbETH Registiring , only for Base Chain 
   ********************************************/
  if ( config.cbETH ) {    
    spinner.text = "Registiring cbETH Contract";    
    await serviceRegistry.registerService(
      hre.ethers.keccak256(Buffer.from("cbETH")),
      config.cbETH,
    );
    result.push(["cbETH",  config.cbETH]);
  }
  /********************************************
   * wstETH Registiring
   ********************************************/
  if (config.wstETH) {
    // Register CbETH ERC20 Address
    spinner.text = "Registiring wstETH Contract";        
    await serviceRegistry.registerService(
      hre.ethers.keccak256(Buffer.from("wstETH")),
      config.wstETH,
    );
    result.push(["wstETH",  config.wstETH]);
  }
  /********************************************
   * <Collateral>/USD Deploy
   ********************************************/
  spinner.text = "Deploying Collateral/ETH Oracle";       
  const colETHOracle = await deployCollateralOracle(config, serviceRegistry);
  result.push(["Collateral/ETH Oracle",  await colETHOracle.getAddress()]);
  /********************************************
   * ETH/USD Deploy
   ********************************************/
  spinner.text = "Deploying ETH/USD Oracle";   
  const ethUSDOracle = await deployETHOracle(serviceRegistry, config.ethOracle);
  result.push(["ETH/USD Oracle",  await ethUSDOracle.getAddress()]);  
  /********************************************
   * STRATEGY Deploy
   ********************************************/
  spinner.text = "Deploying Strategy";  
  const strategy = await deployStrategy(
    config, 
    deployer, 
    serviceRegistry
  );
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("Strategy")),
    await strategy.getAddress() ,
  );
  result.push(["Strategy",  await strategy.getAddress()]);
  /********************************************
   * BakerFi Vault 
   ********************************************/
  spinner.text = "Deploying BakerFi Vault 👩‍🍳";    
  const vault = await deployVault(
        deployer.address, 
      await serviceRegistry.getAddress(),
      await strategy.getAddress() 
  );
  /********************************************
   * Update the Default Settings
   ********************************************/
  await strategy.transferOwnership(await vault.getAddress());
  await settings.setLoanToValue(hre.ethers.parseUnits("800", 6));
  result.push(["BakerFi Vault 📟",  await vault.getAddress()]);
  spinner.succeed("🧑‍🍳 BakerFi Served 🍰 ");
  console.table(result);
  process.exit(0);
}

async function deployFlashLendInfra(serviceRegistry, config: any) {
  await serviceRegistry.registerService(
    hre.ethers.keccak256(Buffer.from("Balancer Vault")),
    config.balancerVault
  );
  const flashLender = await deployBalancerFL(
    serviceRegistry
  );  
  return flashLender;
}

async function deployStrategy(config: any, deployer, serviceRegistry) {
  let strategy;
  switch (config.strategy.type) {
    case "base":
        strategy = await deployAAVEv3StrategyAny(
        deployer.address,
        await serviceRegistry.getAddress(),
        config.strategy.collateral,
        config.strategy.oracle,
        config.swapFeeTier,
        config.AAVEEModeCategory
      );     
      break;
    default:
      break;
  }
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

    case "wstETH": 
      oracle = await deploWSTETHToETHOracle(
        serviceRegistry,
        config.oracle.chainLink
      );
    break;
    default:
      break;
  }
  return oracle;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});