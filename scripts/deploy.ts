import "dotenv/config";
import hre from "hardhat";
import {
  deployServiceRegistry,
  deployVault,
  deployAAVEv3StrategyAny,
  deploySettings,
  deployETHOracle,
  deployCbETHToUSDOracle,
  deployWSTETHToUSDOracle,
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

  // Deploy Proxy Admin
  spinner.text = "Deploying Proxy Admin";  
  const BakerFiProxyAdmin = await hre.ethers.getContractFactory("BakerFiProxyAdmin");
  const proxyAdmin = await BakerFiProxyAdmin.deploy(deployer.address);
  await proxyAdmin.waitForDeployment();
  result.push(["Proxy Admin", await proxyAdmin.getAddress()])  

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
  const { settings, proxy: settinsProxyDeploy }= await deploySettings(
    deployer.address, 
    serviceRegistry, 
    true, 
    proxyAdmin
  ); 
    
  result.push(["Settings", await settings.getAddress()])  
  result.push(["Settings (Proxy)", await settinsProxyDeploy.getAddress()])  
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
  spinner.text = "Deploying Collateral/USD Oracle";       
  const colETHOracle = await deployCollateralOracle(
    config, 
    serviceRegistry,
    config.pyth,
  );
  result.push(["Collateral/USDC Oracle",  await colETHOracle.getAddress()]);
  /********************************************
   * ETH/USD Deploy
   ********************************************/
  spinner.text = "Deploying ETH/USD Oracle";   
  const ethUSDOracle = await deployETHOracle(
    serviceRegistry, 
    config.pyth
  );
  result.push(["ETH/USD Oracle",  await ethUSDOracle.getAddress()]);  
  /********************************************
   * STRATEGY Deploy
   ********************************************/
  spinner.text = "Deploying Strategy";  
  const { strategy, proxy: strategyProxy } = await deployStrategy(
    config, 
    deployer, 
    serviceRegistry,
    true, 
    proxyAdmin
  );
  result.push(["Strategy",  await strategy.getAddress()]);
  result.push(["Strategy (Proxy)",  await (strategyProxy as any).getAddress()]);
  /********************************************
   * BakerFi Vault 
   ********************************************/
  spinner.text = "Deploying BakerFi Vault 👩‍🍳";    
  const { vault, proxy: vaultProxy }= await deployVault(
        deployer.address, 
        await serviceRegistry.getAddress(),
        await (strategyProxy as any).getAddress(),
        true, 
        proxyAdmin
  );
  result.push(["BakerFi Vault 📟",  await vault.getAddress()]);
  result.push(["BakerFi Vault (Proxy)",  await (vaultProxy as any).getAddress()]);  
  /********************************************
   * Update the Default Settings
   ********************************************/
  await changeSettings(
    spinner, 
    await settinsProxyDeploy.getAddress(),
    await (strategyProxy as any).getAddress(),
    await (vaultProxy as any).getAddress()
  ); 
  spinner.succeed("🧑‍🍳 BakerFi Served 🍰 ");
  console.table(result);
  process.exit(0);
}

async function changeSettings(
  spinner: any,
  settingsAddress: string,
  strategyAddress: string,
  vaultAddress: string,
) {
  const settings = await hre.ethers.getContractAt("Settings", settingsAddress);
  const vault = await hre.ethers.getContractAt("BakerFiVault", vaultAddress);
  const strategy = await hre.ethers.getContractAt("AAVEv3StrategyAny", strategyAddress);

  spinner.text = "Transferring Ownership ...";    
  await strategy.transferOwnership(await vault.getAddress());

  spinner.text = "Changing Settigns ...";      
  await settings.setLoanToValue(hre.ethers.parseUnits("800", 6));
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

async function deployStrategy(config: any, deployer, serviceRegistry, proxied: boolean, proxyAdmin): Promise<{
  strategy?: any,
  proxy?: any
}> {
  switch (config.strategy.type) {
    case "base":
        const res = await deployAAVEv3StrategyAny(
        deployer.address,
        await serviceRegistry.getAddress(),
        config.strategy.collateral,
        config.strategy.oracle,
        config.swapFeeTier,
        config.AAVEEModeCategory,
        proxied,
        proxyAdmin
      );     
      return res;
      break;
    default:
      break;
  }
  return {

  };
}

/**
 * 
 * @param config 
 * @param serviceRegistry 
 * @returns 
 */
async function deployCollateralOracle(config: any, serviceRegistry, pyth) {
  let oracle;
  switch (config.oracle.type) {
    case "cbETH":
      oracle = await deployCbETHToUSDOracle(
        serviceRegistry,
        pyth,
      );
      break;

    case "wstETH": 
      oracle = await deployWSTETHToUSDOracle(
        serviceRegistry,
        pyth
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