import { ethers, network } from "hardhat";
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

import BaseConfig from "./config";
import ora from 'ora';

/**
 * Deploy the Basic System for testing 
 */
async function main() {

  const networkName = network.name;
  const chainId = network.config.chainId;
  
  const config = BaseConfig[networkName];
  console.log("  🧑‍🍳 BakerFi Cooking .... ");
  const result: any[] = [];
  const spinner = ora('Cooking ....').start();
  // Max Staked ETH available
  result.push(["Network Name", networkName])
  result.push(["Network Id", chainId])
  
  const STETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
  const FLASH_LENDER_DEPOSIT = ethers.parseUnits("10000", 18);
  const AAVE_DEPOSIT = ethers.parseUnits("10000", 18);

  spinner.text = "Getting Signers";
  const [owner, otherAccount] = await ethers.getSigners();
  // 1. Deploy the Service Registry
  const serviceRegistry = await deployServiceRegistry(owner.address);
  spinner.text = "Deploying Registry";
  //console.log(" Service Registry =", await serviceRegistry.getAddress());
  result.push(["Service Registry", await serviceRegistry.getAddress()])  
  
  // 3. Deploy the WETH 
  spinner.text = "Deploying WETH";
  const weth = await deployWETH(serviceRegistry);
  result.push(["WETH", await weth.getAddress()])  

  // 4. Deploy the Vault attached to Leverage Lib
  spinner.text = "Deploying Flash Lender";  
  const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
  result.push(["Flash Lender", await flashLender.getAddress()])  
  result.push(["Flash Lender wETH", ethers.formatEther(await weth.balanceOf(await flashLender.getAddress()))])  

  
  // 5. Deploy stETH ERC-20
  spinner.text = "Deploying StETH";  
  const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
  result.push(["StETH", await stETH.getAddress()])  

  // 6. Deploy wstETH ERC-20
  spinner.text = "Deploying WstETH";  
  const wstETH  = await deployWStEth(serviceRegistry, await stETH.getAddress());
  result.push(["WstETH", await wstETH.getAddress()])  

  spinner.text = "Deploying Settings";  
  const settings  = await deploySettings(owner.address, serviceRegistry);
  result.push(["Settings", await settings.getAddress()])  


  spinner.text = "Deploying Uniswap Router Mock";  
  // Deploy cbETH -> ETH Uniswap Router
  const UniRouter = await ethers.getContractFactory("UniV3RouterMock");
  const uniRouter = await UniRouter.deploy(
      await weth.getAddress(),
      await wstETH.getAddress()
  );
  spinner.text = "Deploying Uniswap Router Mock";  

  await stETH.approve(await wstETH.getAddress(), ethers.parseUnits("20000", 18));
  spinner.text = "Topping Up Uniswap Swapper";  

  // Deposit WETH on UniRouter
  await weth.connect(otherAccount).deposit?.call("", { value: ethers.parseUnits("10000", 18) });
  await weth.connect(otherAccount).transfer(
    await uniRouter.getAddress(),
    ethers.parseUnits("10000", 18)
  );
  await wstETH.wrap( ethers.parseUnits("20000", 18));
  const wstBalance = await wstETH.balanceOf(owner.address);
  await wstETH.transfer(await uniRouter.getAddress(), wstBalance);
  await stETH.transfer(await uniRouter.getAddress(), ethers.parseUnits("10000", 18));

  result.push(["Uniswap stETH", ethers.formatEther(await stETH.balanceOf(await uniRouter.getAddress()))])  
  result.push(["Uniswap wstETH", ethers.formatEther(await wstETH.balanceOf(await uniRouter.getAddress()))])  
  result.push(["Uniswap wETH", ethers.formatEther(await weth.balanceOf(await uniRouter.getAddress()))])  

  // Register Uniswap Router
  await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Uniswap Router")),
      await uniRouter.getAddress()
  );
  await uniRouter.setPrice(884 * 1e6);   
  result.push(["Uniswap Router Mock", await uniRouter.getAddress()])  

  // 8. Deploy AAVE Mock Service
  spinner.text = "Deploying AAVVE v3 Mock";  
  const aaveV3PoolMock = await deployAaveV3(wstETH, weth, serviceRegistry, AAVE_DEPOSIT); 
  result.push(["AAVE v3 Mock", await aaveV3PoolMock.getAddress()])  

  // 9. Deploy wstETH/ETH Oracle 
  spinner.text = "Deploying Uniswap Quoter";  
  const uniQuoter = await deployQuoterV2Mock(serviceRegistry);
  result.push(["Uniswap Quoter", await uniQuoter.getAddress()])  

  spinner.text = "Deploying wstETH/ETH Oracle";  
  const oracle = await deployOracleMock(serviceRegistry, "wstETH/ETH Oracle");
  result.push(["wstETH/ETH Oracle", await oracle.getAddress()])  

  spinner.text = "Deploying ETH/USD Oracle ";  
  const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");    
  await ethOracle.setLatestPrice(ethers.parseUnits("1", 18)); 
  result.push(["ETH/USD Oracle", await ethOracle.getAddress()])  

  spinner.text = "Deploying AAVEv3StrategyWstETH";  
  const strategy = await deployAAVEv3StrategyWstETH( 
    owner.address,
    await serviceRegistry.getAddress(), 
    config.swapFeeTier,
    config.AAVEEModeCategory,
  );
  result.push(["AAVEv3 Strategy WstETH", await strategy.getAddress()])  
  
  spinner.text = "Deploying Vault";  
  // 10. Deploy the Vault attached to Leverage Lib
  const vault = await deployVault(
      owner.address, 
      await serviceRegistry.getAddress(),
      await strategy.getAddress() 
  );
  result.push(["BakerFi Vault 🕋", await vault.getAddress()])

  spinner.text = "Transferring Vault Ownership";  
  await strategy.transferOwnership(await vault.getAddress());
  spinner.succeed("🧑‍🍳 BakerFi Served 🍰 ");
  console.table(result);
  process.exit(0);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
