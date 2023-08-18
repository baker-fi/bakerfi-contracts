import { ethers } from "hardhat";

export async function deployFlashLender(serviceRegistry, weth, depositedAmount) {
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
  
  export async function deployWETH(serviceRegistry){
    const WETH = await ethers.getContractFactory("WETH");     
    const weth = await WETH.deploy();       
    await weth.waitForDeployment();

    await serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("WETH")),
        await weth.getAddress()
    );
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
  
  export async function deployVault(owner: string, serviceRegistry: string, strategy: string) {
    const Vault = await ethers.getContractFactory("LaundromatVault");
    const vault = await Vault.deploy(owner, serviceRegistry, strategy);        
    await vault.waitForDeployment();
    return vault;
  }

  export async function deployAAVEv3Strategy(owner: string, serviceRegistry: string, levarage: string) {
    const AAVEv3Strategy = await ethers.getContractFactory("AAVEv3Strategy", {
        libraries: {
            Leverage: levarage,
        }
    });
    const strategy = await AAVEv3Strategy.deploy(owner, serviceRegistry);        
    await strategy.waitForDeployment();
    return strategy;
  }
  
  
  export async function deployStEth(serviceRegistry, owner, maxSupply) {
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
  
  
  export async function deployWStEth(serviceRegistry, stETHAddress) {
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
  
  export async function deploySwapper(weth, stETH, serviceRegistry, STETH_MAX_SUPPLY: bigint) {
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
  
  export async function deployAaveV3(stETH, weth, serviceRegistry, amount) {
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
  
  
  export  async function deployWSETHToETHOracle(serviceRegistry) {
    const WSETHToETH = await ethers.getContractFactory("WstETHToETHOracleMock");
    const oracle = await WSETHToETH.deploy();
    await oracle.waitForDeployment();
    await serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("wstETH/ETH Oracle")),
        await oracle.getAddress()
    );
    return oracle;
  }