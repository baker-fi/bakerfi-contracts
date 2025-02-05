import '@nomicfoundation/hardhat-ethers';
import { ethers } from 'hardhat';
import { NetworkConfig, pythFeeds } from '../constants/types';
import ContractTree from '../src/contract-blob.json';
import { ContractClient } from './lib/contract-client';
import ora from 'ora';
export type ProxyContracts = keyof typeof ContractTree;

export async function deployFlashLender(serviceRegistry, weth, depositedAmount) {
  const MockFlashLender = await ethers.getContractFactory('MockFlashLender');
  const flashLender = await MockFlashLender.deploy(await weth.getAddress());
  await flashLender.waitForDeployment();
  const flashLenderAddress = await flashLender.getAddress();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('FlashLender')),
    flashLenderAddress,
  );
  await weth.deposit?.call('', { value: depositedAmount });
  await weth.transfer(flashLender, depositedAmount);
  return flashLender;
}

export async function deployWETH(serviceRegistry) {
  const WETH = await ethers.getContractFactory('WETH');
  const weth = await WETH.deploy();
  await weth.waitForDeployment();

  if (serviceRegistry) {
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from('WETH')),
      await weth.getAddress(),
    );
  }
  return weth;
}

export async function deployBKR(owner, serviceRegistry) {
  const BKR = await ethers.getContractFactory('BKR');
  const bkr = await BKR.deploy(owner);
  await bkr.waitForDeployment();

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('BKR')),
    await bkr.getAddress(),
  );
  return bkr;
}

export async function deployVaultRegistry(owner: string) {
  const VaultRegistry = await ethers.getContractFactory('VaultRegistry');
  const serviceRegistry = await VaultRegistry.deploy(owner);
  await serviceRegistry.waitForDeployment();
  return serviceRegistry;
}

export async function deployVault(
  owner: string,
  tokenName: string,
  tokenSymbol: string,
  strategy: string,
  weth: string,
  proxyAdmin?: any,
) {
  const Vault = await ethers.getContractFactory('Vault');
  const vault = await Vault.deploy();
  await vault.waitForDeployment();

  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const proxy = await BakerFiProxy.deploy(
    await vault.getAddress(),
    await proxyAdmin.getAddress(),
    Vault.interface.encodeFunctionData('initialize', [
      owner,
      tokenName,
      tokenSymbol,
      weth,
      strategy,
      weth,
    ]),
  );
  await proxy.waitForDeployment();
  return { proxy, vault };
}

export async function deployAAVEv3Strategy(
  owner: string,
  governor: string,
  collateralToken: string,
  debtToken: string,
  oracle: string,
  flashLender: string,
  aaveV3Pool: string,
  emodeCategory: number,
  proxyAdmin?: any,
) {
  const StrategyLeverageAAVEv3 = await ethers.getContractFactory('StrategyLeverageAAVEv3');
  const strategy = await StrategyLeverageAAVEv3.deploy();
  await strategy.waitForDeployment();
  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const proxy = await BakerFiProxy.deploy(
    await strategy.getAddress(),
    await proxyAdmin.getAddress(),
    StrategyLeverageAAVEv3.interface.encodeFunctionData('initialize', [
      owner,
      governor,
      collateralToken,
      debtToken,
      oracle,
      flashLender,
      aaveV3Pool,
      emodeCategory,
    ]),
  );
  await proxy.waitForDeployment();
  return { strategy, proxy };
}

export async function deployStrategyLeverageMorphoBlue(
  owner: string,
  governor: string,
  collateralToken: string,
  debtToken: string,
  oracle: string,
  flashLender: string,
  morphoBlue: string,
  morphoOracle: string,
  irm: string,
  lltv: bigint,
  proxyAdmin?: any,
) {
  const Strategy = await ethers.getContractFactory('StrategyLeverageMorphoBlue');
  const strategy = await Strategy.deploy();
  await strategy.waitForDeployment();
  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const proxy = await BakerFiProxy.deploy(
    await strategy.getAddress(),
    await proxyAdmin.getAddress(),
    Strategy.interface.encodeFunctionData('initialize', [
      owner,
      governor,
      [collateralToken, debtToken, oracle, flashLender, morphoBlue, morphoOracle, irm, lltv],
    ]),
  );
  await proxy.waitForDeployment();
  return { strategy, proxy };
}

export async function deployStEth(serviceRegistry, owner, maxSupply) {
  const STETHMock = await ethers.getContractFactory('ERC20Mock');

  const STETH_TOKEN_NAME = 'Lido Staked ETH';
  const STETH_TOKEN_SYMBOL = 'stETH';

  const stETH = await STETHMock.deploy(STETH_TOKEN_NAME, STETH_TOKEN_SYMBOL, maxSupply, owner);
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('stETH')),
    await stETH.getAddress(),
  );
  await stETH.waitForDeployment();
  return stETH;
}

export async function deployCbETH(serviceRegistry, owner, maxSupply) {
  const CBETHMock = await ethers.getContractFactory('ERC20Mock');

  const CBETH_TOKEN_NAME = 'Coinbase ETH';
  const CBETH_TOKEN_SYMBOL = 'cbETH';

  const cbETH = await CBETHMock.deploy(CBETH_TOKEN_SYMBOL, CBETH_TOKEN_NAME, maxSupply, owner);
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('cbETH')),
    await cbETH.getAddress(),
  );
  await cbETH.waitForDeployment();
  return cbETH;
}

export async function deployWStEth(serviceRegistry, stETHAddress) {
  const WSTETHMock = await ethers.getContractFactory('WstETHMock');
  const wstETH = await WSTETHMock.deploy(stETHAddress);
  await wstETH.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('wstETH')),
    await wstETH.getAddress(),
  );
  return wstETH;
}

export async function deploySwapper(weth, ierc20, serviceRegistry, maxSupply: bigint) {
  const SwapHandlerMock = await ethers.getContractFactory('SwapHandlerMock');
  const swapper = await SwapHandlerMock.deploy(await weth.getAddress(), await ierc20.getAddress());
  await swapper.waitForDeployment();
  const swapperAddress = await swapper.getAddress();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Swapper Handler')),
    swapperAddress,
  );
  await ierc20.transfer(swapperAddress, maxSupply);
  return swapper;
}

export async function deployAaveV3(stETH, weth, serviceRegistry, amount) {
  const AaveV3PoolMock = await ethers.getContractFactory('AaveV3PoolMock');
  const aaveV3PoolMock = await AaveV3PoolMock.deploy(
    await stETH.getAddress(),
    await weth.getAddress(),
  );
  await aaveV3PoolMock.waitForDeployment();
  const aaveV3PoolAddress = await aaveV3PoolMock.getAddress();
  await serviceRegistry.registerService(ethers.keccak256(Buffer.from('AAVEv3')), aaveV3PoolAddress);
  await weth.deposit?.call('', { value: amount });
  await weth.transfer(aaveV3PoolAddress, amount);
  return aaveV3PoolMock;
}

export async function deployOracleMock() {
  const OracleMock = await ethers.getContractFactory('OracleMock');
  const oracle = await OracleMock.deploy();
  await oracle.waitForDeployment();
  return oracle;
}

export async function deployPythMock(serviceRegistry) {
  const PythMock = await ethers.getContractFactory('PythMock');
  const pyth = await PythMock.deploy();
  await pyth.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Pyth')),
    await pyth.getAddress(),
  );
  return pyth;
}

export async function deployParkStrategy(owner: string, weth: string) {
  const StrategyPark = await ethers.getContractFactory('StrategyPark');
  const strategyPark = await StrategyPark.deploy(owner, weth);
  await strategyPark.waitForDeployment();
  return strategyPark;
}

export async function deployETHOracle(serviceRegistry, pyth) {
  const oracleContract = await ethers.getContractFactory('PythOracle');
  const oracle = await oracleContract.deploy(pythFeeds.ETHUSDFeedId, pyth);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('ETH/USD Oracle')),
    await oracle.getAddress(),
  );
  return oracle;
}

export async function deployWSTETH_ETH_OracleL2(chainlinkPriceFeed) {
  const ChainLinkOracle = await ethers.getContractFactory('ChainLinkOracle');
  const oracle = await ChainLinkOracle.deploy(chainlinkPriceFeed, 0, 0);
  await oracle.waitForDeployment();
  return oracle;
}

export async function deployWSTETH_ETH_Oracle(wstETH) {
  const ChainLinkOracle = await ethers.getContractFactory('RatioOracle');
  const oracle = await ChainLinkOracle.deploy([wstETH, '0x035faf82'], 18);
  await oracle.waitForDeployment();
  return oracle;
}

export async function deployCbETHToETHOracle(serviceRegistry, pyth) {
  const oracleContract = await ethers.getContractFactory('PythOracle');
  const oracle = await oracleContract.deploy(pythFeeds.CBETHUSDFeedId, pyth);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('cbETH/USD Oracle')),
    await oracle.getAddress(),
  );

  return oracle;
}

export async function deployWSTETHToETHPythOracle(serviceRegistry, pyth) {
  const WSETHToETH = await ethers.getContractFactory('PythOracle');
  const oracle = await WSETHToETH.deploy(pythFeeds.WSETHUSDFeedId, pyth);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('wstETH/ETH Oracle')),
    await oracle.getAddress(),
  );

  return oracle;
}

export async function deployWSTETHToETHCustomOracle(serviceRegistry, baseOracle, wsETH) {
  const WSETHToETH = await ethers.getContractFactory('CustomExRateOracle');
  const oracle = await WSETHToETH.deploy(baseOracle, [wsETH, '0x035faf82'], 18);
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('wstETH/USD Oracle')),
    await oracle.getAddress(),
  );
  return oracle;
}

export async function deployMockERC20(name: string, symbol: string, cap: bigint, owner: string) {
  const ERC20 = await ethers.getContractFactory('ERC20Mock');
  const erc20 = await ERC20.deploy(name, symbol, cap, owner);
  await erc20.waitForDeployment();
  return erc20;
}

export async function deployUniV3RouterMock(
  tokenAContract,
  supplyA,
  tokenBContract,
  supplyB,
  serviceRegistry?: any,
) {
  const UniRouter = await ethers.getContractFactory('UniV3RouterMock');
  const uniRouter = await UniRouter.deploy(
    await tokenAContract.getAddress(),
    await tokenBContract.getAddress(),
  );
  await uniRouter.waitForDeployment();
  const uniRouterAddress = await uniRouter.getAddress();
  if (serviceRegistry) {
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from('Uniswap Router')),
      uniRouterAddress,
    );
  }
  await tokenAContract.transfer(uniRouterAddress, supplyA);
  await tokenBContract.transfer(uniRouterAddress, supplyB);
  return uniRouter;
}

export async function deployUniSwapper(owner: string, serviceRegistry: any) {
  const UniV3Swapper = await ethers.getContractFactory('UniV3Swapper');
  const swapper = await UniV3Swapper.deploy(await serviceRegistry.getAddress(), owner);
  await swapper.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from('Swapper Handler')),
    await swapper.getAddress(),
  );
  return swapper;
}

export async function deployBalancerFL(balancerVault: string) {
  const FlashLender = await ethers.getContractFactory('BalancerFlashLender');
  const fl = await FlashLender.deploy(balancerVault);
  await fl.waitForDeployment();
  return fl;
}
export async function deployFlashBorrowerMock(flashLender: string) {
  const Borrower = await ethers.getContractFactory('FlashBorrowerMock');
  const borrower = await Borrower.deploy();
  await borrower.initialize(flashLender);
  await borrower.waitForDeployment();
  return borrower;
}

export async function deployLeverage() {
  const Leverage = await ethers.getContractFactory('UseLeverage');
  const levarage = await Leverage.deploy();
  await levarage.waitForDeployment();
  return levarage;
}

export async function deployTestLeverage() {
  const Leverage = await ethers.getContractFactory('LeverageTest');
  const levarage = await Leverage.deploy();
  await levarage.waitForDeployment();
  return levarage;
}

export async function deployQuoterV2Mock() {
  const QuoterMock = await ethers.getContractFactory('QuoterV2Mock');
  const quoter = await QuoterMock.deploy();
  await quoter.waitForDeployment();
  return quoter;
}

export async function deployVaultZap(
  owner: string,
  uniRouter: string,
  quoter: string,
  proxyAdmin?: any,
) {
  const VaultZap = await ethers.getContractFactory('VaultZap');
  //owner, uniRouter, quoter, proxyAdmin
  const vaultZap = await VaultZap.deploy();
  await vaultZap.waitForDeployment();
  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const proxy = await BakerFiProxy.deploy(
    await vaultZap.getAddress(),
    await proxyAdmin.getAddress(),
    VaultZap.interface.encodeFunctionData('initialize', [owner, uniRouter, quoter]),
  );
  await proxy.waitForDeployment();
  return { vaultZap, proxy };
}

export async function deployVaultRouter(owner: string, weth: string, proxyAdmin?: any) {
  const VaultRouter = await ethers.getContractFactory('VaultRouter');
  //owner, uniRouter, quoter, proxyAdmin
  const vaultRouter = await VaultRouter.deploy();
  await vaultRouter.waitForDeployment();
  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const proxy = await BakerFiProxy.deploy(
    await vaultRouter.getAddress(),
    await proxyAdmin.getAddress(),
    VaultRouter.interface.encodeFunctionData('initialize', [owner, weth]),
  );
  await proxy.waitForDeployment();
  return { vaultRouter, proxy };
}

export const RegistryNames = [
  'FlashLender',
  'Pyth',
  'DeploymentRegistry',
  'Uniswap Router',
  'WETH',
  'stETH',
  'wstETH',
  'AAVEv3',
  'Balancer Vault',
  'wstETH',
  'wstETH/USD Oracle',
  'cbETH/USD Oracle',
  'ETH/USD Oracle',
  'ChainLinkExRateOracle',
  'CustomExRateOracle',
  'BakerFiProxyAdmin',
  'Pyth',
  'Registry',
  'Strategy',
  'Vault',
  'VaultRouter',
  'VaultZap',
  'BakerFiProxy',
  'BakerFiProxyAdmin',
  'FlashLender',
  'Pyth',
  'Uniswap Router',
];

type RegistryName = (typeof RegistryNames)[number];

/**
 *
 * @param spinner
 * @param ethApp
 * @param ledgerPath
 * @param proxyAdminAddress
 * @param owner
 * @param result
 * @returns
 */
export async function deployProxyContract(
  chainId: bigint,
  client: ContractClient<typeof ContractTree>,
  config: NetworkConfig,
  instanceName: ProxyContracts,
  registerName: RegistryName,
  proxyAdminAddress: string | null | undefined,
  registryContractAddress: string | null | undefined,
  args: any[],
  spinner: ora.Ora,
  result: any[],
) {
  spinner.text = `Deploying ${instanceName}`;
  const instanceReceipt = await client.deploy(
    instanceName,
    [],
    // Tx Options
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );
  const contractFactory = await ethers.getContractFactory(instanceName);
  spinner.text = `Deploying ${instanceName} Proxy`;
  const proxyReceipt = await client.deploy(
    'BakerFiProxy',
    [
      instanceReceipt?.contractAddress,
      proxyAdminAddress,
      contractFactory.interface.encodeFunctionData('initialize', args),
    ],
    {
      chainId,
      minTxConfirmations: config.minTxConfirmations,
    },
  );

  if (registryContractAddress) {
    spinner.text = `Registering ${instanceName} Proxy Address`;
    await client.send(
      'VaultRegistry',
      registryContractAddress ?? '',
      'registerService',
      [ethers.keccak256(Buffer.from(registerName)), proxyReceipt?.contractAddress],
      {
        chainId,
        minTxConfirmations: config.minTxConfirmations,
      },
    );
  }
  result.push([instanceName, instanceReceipt?.contractAddress, instanceReceipt?.hash]);
  result.push([`${instanceName} Proxy`, proxyReceipt?.contractAddress, proxyReceipt?.hash]);

  return proxyReceipt?.contractAddress;
}
