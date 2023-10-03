import { ethers } from "hardhat";

export async function deployFlashLender(
  serviceRegistry,
  weth,
  depositedAmount
) {
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

export async function deployWETH(serviceRegistry) {
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
  const serviceRegistry = await ServiceRegistry.deploy(owner);
  await serviceRegistry.waitForDeployment();
  return serviceRegistry;
}

export async function deployVault(
  owner: string,
  serviceRegistry: string,
  strategy: string
) {
  const Vault = await ethers.getContractFactory("BakerFiVault");
  const vault = await Vault.deploy(owner, serviceRegistry, strategy);
  await vault.waitForDeployment();
  return vault;
}

export async function deployAAVEv3StrategyWstETH(
  owner: string,
  serviceRegistry: string
) {
  const AAVEv3Strategy = await ethers.getContractFactory(
    "AAVEv3StrategyWstETH"
  );
  const strategy = await AAVEv3Strategy.deploy(owner, serviceRegistry);
  await strategy.waitForDeployment();
  return strategy;
}

export async function deployAAVEv3StrategyAny(
  owner: string,
  serviceRegistry: string,
  collateral: string,
  oracle: string
) {
  const AAVEv3Strategy = await ethers.getContractFactory("AAVEv3StrategyAny");
  const strategy = await AAVEv3Strategy.deploy(
    owner,
    serviceRegistry,
    ethers.keccak256(Buffer.from(collateral)),
    ethers.keccak256(Buffer.from(oracle))
  );
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

export async function deployCbETH(serviceRegistry, owner, maxSupply) {
  const CBETHMock = await ethers.getContractFactory("ERC20Mock");

  const CBETH_TOKEN_NAME = "Coinbase ETH";
  const CBETH_TOKEN_SYMBOL = "cbETH";

  const cbETH = await CBETHMock.deploy(
    CBETH_TOKEN_SYMBOL,
    CBETH_TOKEN_NAME,
    maxSupply,
    owner
  );
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("cbETH")),
    await cbETH.getAddress()
  );
  await cbETH.waitForDeployment();
  return cbETH;
}

export async function deployWStEth(serviceRegistry, stETHAddress) {
  const WSTETHMock = await ethers.getContractFactory("WstETHMock");
  const wstETH = await WSTETHMock.deploy(stETHAddress);
  await wstETH.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("wstETH")),
    await wstETH.getAddress()
  );
  return wstETH;
}

export async function deploySwapper(
  weth,
  ierc20,
  serviceRegistry,
  maxSupply: bigint
) {
  const SwapHandlerMock = await ethers.getContractFactory("SwapHandlerMock");
  const swapper = await SwapHandlerMock.deploy(
    await weth.getAddress(),
    await ierc20.getAddress()
  );
  await swapper.waitForDeployment();
  const swapperAddress = await swapper.getAddress();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Swapper Handler")),
    swapperAddress
  );
  await ierc20.transfer(swapperAddress, maxSupply);
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

export async function deployOracleMock(serviceRegistry, name) {
  const WSETHToETH = await ethers.getContractFactory("OracleMock");
  const oracle = await WSETHToETH.deploy();
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from(name)),
    await oracle.getAddress()
  );
  return oracle;
}

export async function deployETHOracle(serviceRegistry, chainLinkAddress) {
  const oracleContract = await ethers.getContractFactory("ETHOracle");
  const oracle = await oracleContract.deploy(chainLinkAddress);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("ETH/USD Oracle")),
    await oracle.getAddress()
  );
  return oracle;
}

export async function deploCbETHToETHOracle(serviceRegistry, chainLinkAddress) {
  const oracleContract = await ethers.getContractFactory("cbETHToETHOracle");
  const oracle = await oracleContract.deploy(chainLinkAddress);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("cbETH/ETH Oracle")),
    await oracle.getAddress()
  );
  return oracle;
}

export async function deploWSTETHToETHOracle(
  serviceRegistry,
  chainLinkAddress,
  wstETHAddress
) {
  const WSETHToETH = await ethers.getContractFactory("WstETHToETHOracle");
  const oracle = await WSETHToETH.deploy(chainLinkAddress, wstETHAddress);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("wstETH/ETH Oracle")),
    await oracle.getAddress()
  );
  return oracle;
}

export async function deploySettings(owner: string, serviceRegistry) {
  const Settings = await ethers.getContractFactory("Settings");
  const settings = await Settings.deploy(owner);
  await settings.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Settings")),
    await settings.getAddress()
  );
  return settings;
}

export async function deployMockERC20(
  name: string,
  symbol: string,
  cap: bigint,
  owner: string
) {
  const ERC20 = await ethers.getContractFactory("ERC20Mock");
  const erc20 = await ERC20.deploy(name, symbol, cap, owner);
  await erc20.waitForDeployment();
  return erc20;
}

export async function deployUniV3RouterMock(
  tokenAContract,
  supplyA,
  tokenBContract,
  supplyB,
  serviceRegistry: any
) {
  const UniRouter = await ethers.getContractFactory("UniV3RouterMock");
  const uniRouter = await UniRouter.deploy(
    await tokenAContract.getAddress(),
    await tokenBContract.getAddress()
  );
  await uniRouter.waitForDeployment();
  const uniRouterAddress = await uniRouter.getAddress();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Uniswap Router")),
    uniRouterAddress
  );
  await tokenAContract.transfer(uniRouterAddress, supplyA);
  await tokenBContract.transfer(uniRouterAddress, supplyB);
  return uniRouter;
}

export async function deployUniSwapper(owner: string, serviceRegistry: any) {
  const UniV3Swapper = await ethers.getContractFactory("UniV3Swapper");
  const swapper = await UniV3Swapper.deploy(
    await serviceRegistry.getAddress(),
    owner
  );
  await swapper.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Swapper Handler")),
    await swapper.getAddress()
  );
  return swapper;
}

export async function deployBalancerFL(serviceRegistry: any) {
  const FlashLender = await ethers.getContractFactory("BalancerFlashLender");
  const fl = await FlashLender.deploy(await serviceRegistry.getAddress());
  await fl.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("FlashLender")),
    await fl.getAddress()
  );
  return fl;
}

export async function deployFlashBorrowerMock(serviceRegistry) {
  const Borrower = await ethers.getContractFactory("FlashBorrowerMock");
  const borrower = await Borrower.deploy(await serviceRegistry.getAddress());
  await borrower.waitForDeployment();
  return borrower;
}

export async function deployQuoterV2Mock(serviceRegistry: any) {
  const QuoterMock = await ethers.getContractFactory("QuoterV2Mock");
  const quoter = await QuoterMock.deploy();
  await quoter.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Uniswap Quoter")),
    await quoter.getAddress()
  );
  return quoter;
}

export async function deployLeverage() {
  const Leverage = await ethers.getContractFactory("UseLeverage");
  const levarage = await Leverage.deploy();
  await levarage.waitForDeployment();
  return levarage;
}
