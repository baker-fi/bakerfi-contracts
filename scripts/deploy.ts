import { ethers } from "hardhat";

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
  // 3. Deploy the Vault attached to Leverage Lib
  const vault = await deployVault(
    owner.address, 
    await serviceRegistry.getAddress(),
    await leverageLib.getAddress() 
  );
  console.log("Laundromat Vault =", await vault.getAddress());
  // 4. Deploy the WETH 
  const weth = await deployWETH();
  console.log("WETH =", await weth.getAddress());
  // 5. Deploy the Vault attached to Leverage Lib
  const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
  console.log("FlashLender Mock =", await flashLender.getAddress());
  // 6. Deploy stETH ERC-20
  const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
  console.log("stETH =", await stETH.getAddress());
  // 7. Deploy wstETH ERC-20
  const wstETH  = await deployWStEth(serviceRegistry, await stETH.getAddress());
  console.log("wstETH =", await wstETH.getAddress());
  // 8. Deploy wETH/stETH Swapper
  const swapper  = await deploySwapper(weth, stETH, serviceRegistry, STETH_MAX_SUPPLY);
  console.log("Swap Router Mock =", await swapper.getAddress());
  // 9. Deploy AAVE Mock Service
  const aaveV3PoolMock = await deployAaveV3(wstETH, weth, serviceRegistry, AAVE_DEPOSIT); 
  console.log("AAVE v3 Mock =", await aaveV3PoolMock.getAddress());
  // 10. Deploy wstETH/ETH Oracle 
  const oracle = await deployWSETHToETHOracle(serviceRegistry);
  console.log("WSETH/ETH Oracle =", await oracle.getAddress());
  console.log("---------------------------------------------------------------------------");
  console.log("💥 Laundromat Deployment Done 👏");
}

async function deployFlashLender(serviceRegistry, weth, depositedAmount) {
  const MockFlashLender = await ethers.getContractFactory("MockFlashLender");
  const flashLender = await MockFlashLender.deploy(await weth.getAddress());
  await flashLender.waitForDeployment();
  const flashLenderAddress = await flashLender.getAddress();  
  await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("FlashLender")),
      flashLenderAddress
  );  
  await weth.deposit?.call("", { value: depositedAmount });  
  await weth.transfer(flashLender, depositedAmount);
  return flashLender;
}

export async function deployWETH(){
  const WETH = await ethers.getContractFactory("WETH");     
  const weth = await WETH.deploy();       
  await weth.waitForDeployment();
  return weth; 
}

export async function deployServiceRegistry(owner: string) {
  const ServiceRegistry = await ethers.getContractFactory("ServiceRegistry");
  const serviceRegistry = await ServiceRegistry.deploy(
      owner
  );        
  await serviceRegistry.waitForDeployment();
  return serviceRegistry;
}

export async function deployLeverageLibrary() {
  const Leverage = await ethers.getContractFactory("Leverage");
  const levarage = await Leverage.deploy();
  await levarage.waitForDeployment();
  return levarage;
}

export async function deployVault(owner: string, serviceRegistry: string, levarage: string) {
  const Vault = await ethers.getContractFactory("LaundromatVault", {
      libraries: {
          Leverage: levarage,
      }
  });
  const vault = await Vault.deploy(owner, serviceRegistry);        
  await vault.waitForDeployment();
  return vault;
}


async function deployStEth(serviceRegistry, owner, maxSupply) {
  const STETHMock = await ethers.getContractFactory("ERC20Mock");

  const STETH_TOKEN_NAME = "Lido Staked ETH";
  const STETH_TOKEN_SYMBOL = "stETH";

  const stETH = await STETHMock.deploy(
      STETH_TOKEN_NAME,
      STETH_TOKEN_SYMBOL,
      maxSupply,
      owner
  );
  await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("stETH")),
      await stETH.getAddress()
  );
  await stETH.waitForDeployment();
  return stETH;
}


async function deployWStEth(serviceRegistry, stETHAddress) {
  const WSTETHMock = await ethers.getContractFactory("WstETHMock");
  const wstETH = await WSTETHMock.deploy(
      stETHAddress,
  );
  await wstETH.waitForDeployment();
  await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("wstETH")),
      await wstETH.getAddress()
  );
  return wstETH;
}

async function deploySwapper(weth, stETH, serviceRegistry, STETH_MAX_SUPPLY: bigint) {
  const SwapHandlerMock = await ethers.getContractFactory("SwapHandlerMock");
  const swapper = await SwapHandlerMock.deploy(
      await weth.getAddress(),
      await stETH.getAddress()
  );
  await swapper.waitForDeployment();
  const swapperAddress = await swapper.getAddress();
  await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("SwapHandler")),
      swapperAddress
  );
  await stETH.transfer(swapperAddress, STETH_MAX_SUPPLY);
  return swapper;
}

async function deployAaveV3(stETH, weth, serviceRegistry, amount) {
  const AaveV3PoolMock = await ethers.getContractFactory("AaveV3PoolMock");
  const aaveV3PoolMock = await AaveV3PoolMock.deploy(
      await stETH.getAddress(),
      await weth.getAddress()
  );
  await aaveV3PoolMock.waitForDeployment();
  const aaveV3PoolAddress = await aaveV3PoolMock.getAddress();
  await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("AAVE_V3")),
      aaveV3PoolAddress
  );
  await weth.deposit?.call("", { value: amount });
  await weth.transfer(aaveV3PoolAddress, amount);
  return aaveV3PoolMock;
}


async function deployWSETHToETHOracle(serviceRegistry) {
  const WSETHToETH = await ethers.getContractFactory("WstETHToETHOracleMock");
  const oracle = await WSETHToETH.deploy();
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("wstETH/ETH Oracle")),
      await oracle.getAddress()
  );
  return oracle;
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
