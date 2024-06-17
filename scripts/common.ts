import "@nomicfoundation/hardhat-ethers";
import { ethers } from "hardhat";
import { feeds } from "./config";

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

export async function deployBKR(owner, serviceRegistry) {
  const BKR = await ethers.getContractFactory("BKR");
  const bkr = await BKR.deploy(owner);
  await bkr.waitForDeployment();

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("BKR")),
    await bkr.getAddress()
  );
  return bkr;
}

export async function deployServiceRegistry(owner: string) {
  const ServiceRegistry = await ethers.getContractFactory("ServiceRegistry");
  const serviceRegistry = await ServiceRegistry.deploy(owner);
  await serviceRegistry.waitForDeployment();
  return serviceRegistry;
}

export async function deployVault(
  owner: string,
  tokenName: string,
  tokenSymbol: string,
  serviceRegistry: string,
  strategy: string,
  proxyAdmin?: any
) {
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();

  const BakerFiProxy = await ethers.getContractFactory("BakerFiProxy");
  const proxy = await BakerFiProxy.deploy(
    await vault.getAddress(),
    await proxyAdmin.getAddress(),
    Vault.interface.encodeFunctionData("initialize", [
      owner,
      tokenName,
      tokenSymbol,
      serviceRegistry,
      strategy,
    ])
  );
  await proxy.waitForDeployment();
  return { proxy, vault };
}

export async function deployStrategyAAVEv3WstETH(
  owner: string,
  governor: string,
  serviceRegistry: string,
  swapFreeTier: number,
  emodeCategory: number,
  proxyAdmin?: any
) {
  const StrategyAAVEv3 = await ethers.getContractFactory(
    "StrategyAAVEv3WstETH"
  );
  const strategy = await StrategyAAVEv3.deploy();
  await strategy.waitForDeployment();
  const BakerFiProxy = await ethers.getContractFactory("BakerFiProxy");
  const proxy = await BakerFiProxy.deploy(
    await strategy.getAddress(),
    await proxyAdmin.getAddress(),
    StrategyAAVEv3.interface.encodeFunctionData("initializeWstETH", [
      owner,
      governor,
      serviceRegistry,
      swapFreeTier,
      emodeCategory,
    ])
  );
  await proxy.waitForDeployment();
  return { strategy, proxy };
}

export async function deployAAVEv3StrategyAny(
  owner: string,
  governor: string,
  serviceRegistry: string,
  collateral: string,
  oracle: string,
  swapFreeTier: number,
  emodeCategory: number,
  proxyAdmin?: any
) {
  const StrategyAAVEv3 = await ethers.getContractFactory("StrategyAAVEv3");
  const strategy = await StrategyAAVEv3.deploy();
  await strategy.waitForDeployment();
  const BakerFiProxy = await ethers.getContractFactory("BakerFiProxy");
  const proxy = await BakerFiProxy.deploy(
    await strategy.getAddress(),
    await proxyAdmin.getAddress(),
    StrategyAAVEv3.interface.encodeFunctionData("initialize", [
      owner,
      governor,
      serviceRegistry,
      ethers.keccak256(Buffer.from(collateral)),
      ethers.keccak256(Buffer.from(oracle)),
      swapFreeTier,
      emodeCategory,
    ])
  );
  await proxy.waitForDeployment();
  return { strategy, proxy };
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

export async function deployPythMock(serviceRegistry) {
  const PythMock = await ethers.getContractFactory("PythMock");
  const pyth = await PythMock.deploy();
  await pyth.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Pyth")),
    await pyth.getAddress()
  );
  return pyth;
}

export async function deployETHOracle(serviceRegistry, pyth) {
  const oracleContract = await ethers.getContractFactory("PythOracle");
  const oracle = await oracleContract.deploy(feeds.ETHUSDFeedId, pyth);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("ETH/USD Oracle")),
    await oracle.getAddress()
  );
  return oracle;
}

export async function deployCbETHToUSDOracle(serviceRegistry, pyth) {
  const oracleContract = await ethers.getContractFactory("PythOracle");
  const oracle = await oracleContract.deploy(feeds.CBETHUSDFeedId, pyth);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("cbETH/USD Oracle")),
    await oracle.getAddress()
  );

  return oracle;
}

export async function deployWSTETHToUSDOracle(serviceRegistry, pyth) {
  const WSETHToETH = await ethers.getContractFactory("PythOracle");
  const oracle = await WSETHToETH.deploy(feeds.WSETHUSDFeedId, pyth);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("wstETH/USD Oracle")),
    await oracle.getAddress()
  );
  return oracle;
}

export async function deploySettings(
  owner: string,
  serviceRegistry,
  proxyAdmin?: any
) {
  const Settings = await ethers.getContractFactory("Settings");
  const settings = await Settings.deploy();
  await settings.waitForDeployment();
  const BakerFiProxy = await ethers.getContractFactory("BakerFiProxy");
  const proxy = await BakerFiProxy.deploy(
    await settings.getAddress(),
    await proxyAdmin.getAddress(),
    Settings.interface.encodeFunctionData("initialize", [owner])
  );
  await proxy.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Settings")),
    await proxy.getAddress()
  );
  return { settings, proxy };
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


  const MathLibrary = await ethers.getContractFactory("MathLibrary");
  const ml = await MathLibrary.deploy();
  await ml.waitForDeployment();
  const FlashLender = await ethers.getContractFactory("BalancerFlashLender", {
    libraries: {
      MathLibrary: await ml.getAddress(),
    }

  });
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
  const borrower = await Borrower.deploy();
  await borrower.initialize(await serviceRegistry.getAddress());
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
