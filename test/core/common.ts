import "@nomicfoundation/hardhat-ethers";
import { ethers, network } from "hardhat";
import {
  deployServiceRegistry,
  deployVault,
  deployBalancerFL,
  deployAAVEv3StrategyAny,
  deployETHOracle,
  deployUniSwapper,
  deployCbETHToUSDOracle,
  deployWSTETHToUSDOracle,
  deployStrategyAAVEv3WstETH,
  deploySettings,
} from "../../scripts/common";

import BaseConfig from "../../scripts/config";
import ora from "ora";

export async function deployBase() {
  const [deployer, otherAccount] = await ethers.getSigners();
  const networkName = network.name;
  const config = BaseConfig[networkName];

  const BakerFiProxyAdmin = await ethers.getContractFactory(
    "BakerFiProxyAdmin"
  );
  const proxyAdmin = await BakerFiProxyAdmin.deploy(deployer.address);
  await proxyAdmin.waitForDeployment();

  // 1. Deploy Service Registry
  const serviceRegistry = await deployServiceRegistry(deployer.address);

  // 3. Set the WETH Address
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("WETH")),
    config.weth
  );
  // 4. Deploy Settings
  const { proxy: settingsProxyDeploy } = await deploySettings(
    deployer.address,
    serviceRegistry,
    proxyAdmin
  );

  // 5. Register UniswapV3 Universal Router
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Uniswap Router")),
    config.uniswapRouter
  );

  // 6. Deploy the BakerFi Uniswap Router Adapter
  const swapper = await deployUniSwapper(deployer.address, serviceRegistry);
  await swapper.addFeeTier(config.weth, config.cbETH, 500);

  // 7. Register AAVE V3 Service
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("AAVE_V3")),
    config.AAVEPool
  );

  // 8. Register CbETH
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("cbETH")),
    config.cbETH
  );
  // 9. Deploy the Oracle
  const oracle = await deployCbETHToUSDOracle(serviceRegistry, config.pyth);

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Uniswap Quoter")),
    config.uniswapQuoter
  );

  // 10. Balancer Vault
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Balancer Vault")),
    config.balancerVault
  );

  // 11. Flash Lender Adapter
  await deployBalancerFL(serviceRegistry);
  await deployETHOracle(serviceRegistry, config.pyth);

  // 12. Deploy the Strategy
  const { proxy: strategyProxyDeploy } = await deployAAVEv3StrategyAny(
    deployer.address,
    deployer.address,
    await serviceRegistry.getAddress(),
    "cbETH",
    "cbETH/USD Oracle",
    config.swapFeeTier,
    config.AAVEEModeCategory,
    proxyAdmin
  );

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Strategy")),
    await strategyProxyDeploy.getAddress()
  );

  // 13. Deploy the Vault
  const { proxy: vaultProxyDeploy } = await deployVault(
    deployer.address,
    "Bread ETH",
    "brETH",
    await serviceRegistry.getAddress(),
    await strategyProxyDeploy.getAddress(),
    proxyAdmin
  );

  const weth = await ethers.getContractAt("IWETH", config.weth);
  const cbETH = await ethers.getContractAt("IERC20", config.cbETH);

  const settingsProxy = await ethers.getContractAt(
    "Settings",
    await settingsProxyDeploy.getAddress()
  );
  const strategyProxy = await ethers.getContractAt(
    "StrategyAAVEv3",
    await strategyProxyDeploy.getAddress()
  );
  const vaultProxy = await ethers.getContractAt(
    "Vault",
    await vaultProxyDeploy.getAddress()
  );

  await settingsProxy.setTargetLTV(ethers.parseUnits("500", 6));
  await strategyProxy.transferOwnership(await vaultProxyDeploy.getAddress());

  return {
    serviceRegistry,
    weth,
    config,
    cbETH,
    vault: vaultProxy,
    deployer,
    otherAccount,
    strategy: strategyProxy,
    settings: settingsProxy,
  };
}

export async function deployOptimism() {
  const [deployer, otherAccount] = await ethers.getSigners();
  const networkName = network.name;
  const config = BaseConfig[networkName];

  const BakerFiProxyAdmin = await ethers.getContractFactory(
    "BakerFiProxyAdmin"
  );
  const proxyAdmin = await BakerFiProxyAdmin.deploy(deployer.address);
  await proxyAdmin.waitForDeployment();

  // 1. Deploy Service Registry
  const serviceRegistry = await deployServiceRegistry(deployer.address);
  // 3. Set the WETH Address
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("WETH")),
    config.weth
  );
  // 4. Deploy Settings
  const { proxy: settingsProxyDeploy } = await deploySettings(
    deployer.address,
    serviceRegistry,
    proxyAdmin
  );

  const settings = await ethers.getContractAt(
    "Settings",
    await settingsProxyDeploy.getAddress()
  );
  await settings.setPriceMaxAge(0);
  await settings.setRebalancePriceMaxAge(0);


  // 5. Register UniswapV3 Universal Router
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Uniswap Router")),
    config.uniswapRouter
  );

  // 7. Register AAVE V3 Service
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("AAVE_V3")),
    config.AAVEPool
  );

  // 8. Register wstETH
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("wstETH")),
    config.wstETH
  );
  // 9. Deploy the Oracle
  await deployWSTETHToUSDOracle(serviceRegistry, config.pyth);

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Uniswap Quoter")),
    config.uniswapQuoter
  );

  // 10. Balancer Vault
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Balancer Vault")),
    config.balancerVault
  );

  // 11. Flash Lender Adapter
  await deployBalancerFL(serviceRegistry);

  await deployETHOracle(serviceRegistry, config.pyth);

  // 12. Deploy the Strategy
  const { proxy: strategyProxyDeploy } = await deployAAVEv3StrategyAny(
    deployer.address,
    deployer.address,
    await serviceRegistry.getAddress(),
    "wstETH",
    "wstETH/USD Oracle",
    config.swapFeeTier,
    config.AAVEEModeCategory,
    proxyAdmin
  );

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Strategy")),
    await strategyProxyDeploy.getAddress()
  );

  // 13. Deploy the Vault
  const { proxy: vaultProxyDeploy } = await deployVault(
    deployer.address,
    "Bread ETH",
    "brETH",
    await serviceRegistry.getAddress(),
    await strategyProxyDeploy.getAddress(),
    proxyAdmin
  );

  const weth = await ethers.getContractAt("IWETH", config.weth);
  const aave3Pool = await ethers.getContractAt("IPoolV3", config.AAVEPool);
  const wstETH = await ethers.getContractAt("IERC20", config.wstETH);

  const settingsProxy = await ethers.getContractAt(
    "Settings",
    await settingsProxyDeploy.getAddress()
  );
  const strategyProxy = await ethers.getContractAt(
    "StrategyAAVEv3",
    await strategyProxyDeploy.getAddress()
  );
  const vaultProxy = await ethers.getContractAt(
    "Vault",
    await vaultProxyDeploy.getAddress()
  );

  await strategyProxy.setLoanToValue(ethers.parseUnits("800", 6));
  await strategyProxy.transferOwnership(await vaultProxy.getAddress());
  return {
    serviceRegistry,
    weth,
    wstETH,
    vault: vaultProxy,
    deployer,
    otherAccount,
    strategy: strategyProxy,
    settings: settingsProxy,
    aave3Pool,
    config,
  };
}

export async function deployEthereum() {
  const [deployer, otherAccount] = await ethers.getSigners();
  const networkName = network.name;
  const config = BaseConfig[networkName];

  const BakerFiProxyAdmin = await ethers.getContractFactory(
    "BakerFiProxyAdmin"
  );
  const proxyAdmin = await BakerFiProxyAdmin.deploy(deployer.address);
  await proxyAdmin.waitForDeployment();

  // Deploy Service Registry
  const serviceRegistry = await deployServiceRegistry(deployer.address);

  // Register the WETH Contract on Service Registry
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("WETH")),
    config.weth
  );
  // Deploy Bakerfi Settings Contract
  const { proxy: settingsProxyDeploy } = await deploySettings(
    deployer.address,
    serviceRegistry,
    proxyAdmin
  );

  // Register UniswapV3 Universal Router on Service Register
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Uniswap Router")),
    config.uniswapRouter
  );

  // Register AAVE V3 Service on Service Register
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("AAVE_V3")),
    config.AAVEPool
  );

  // Register wstETH Lido Smart Contract
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("wstETH")),
    config.wstETH
  );
  // Register the stETH Lido Smart Contract
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("stETH")),
    config.stETH
  );

  // 9. Deploy our wstETH/ETH Oracle based on Chainlink and wst Contract
  await deployWstETHToETHOracle(config, serviceRegistry);

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Uniswap Quoter")),
    config.uniswapQuoter
  );

  // 10. Balancer Vault
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Balancer Vault")),
    config.balancerVault
  );

  // 11. Flash Lender Adapter
  await deployBalancerFL(serviceRegistry);

  await deployETHOracle(serviceRegistry, config.pyth);

  // 12. Deploy the Strategy
  const { proxy: strategyProxyDeploy } = await deployStrategyAAVEv3WstETH(
    deployer.address,
    deployer.address,
    await serviceRegistry.getAddress(),
    config.swapFeeTier,
    config.AAVEEModeCategory,
    proxyAdmin
  );

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Strategy")),
    await strategyProxyDeploy.getAddress()
  );

  // 13. Deploy the Vault
  const { proxy: vaultProxyDeploy } = await deployVault(
    deployer.address,
    "Bread ETH",
    "brETH",
    await serviceRegistry.getAddress(),
    await strategyProxyDeploy.getAddress(),
    proxyAdmin
  );

  const weth = await ethers.getContractAt("IWETH", config.weth);
  const aave3Pool = await ethers.getContractAt("IPoolV3", config.AAVEPool);
  const wstETH = await ethers.getContractAt("IERC20", config.wstETH);

  const settingsProxy = await ethers.getContractAt(
    "Settings",
    await settingsProxyDeploy.getAddress()
  );
  const strategyProxy = await ethers.getContractAt(
    "StrategyAAVEv3WstETH",
    await strategyProxyDeploy.getAddress()
  );
  const vaultProxy = await ethers.getContractAt(
    "Vault",
    await vaultProxyDeploy.getAddress()
  );

  await settingsProxy.setLoanToValue(ethers.parseUnits("800", 6));
  await strategyProxy.transferOwnership(await vaultProxy.getAddress());

  return {
    serviceRegistry,
    weth,
    wstETH,
    vault: vaultProxy,
    deployer,
    otherAccount,
    strategy: strategyProxy,
    settings: settingsProxy,
    aave3Pool,
    config,
  };
}

async function deployWstETHToETHOracle(config: any, serviceRegistry: any) {
  const WSETHToETH = await ethers.getContractFactory("ChainLinkOracle");
  const oracle = await WSETHToETH.deploy(
    config.oracle.chainLink,
    config.wstETH
  );
  await oracle.waitForDeployment();
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("wstETH/ETH Oracle")),
    await oracle.getAddress()
  );
}

export function getDeployFunc() {
  let deployFunc = deployEthereum;
  switch (network.name) {
    case "ethereum_devnet":
      deployFunc = deployEthereum;
      break;
    case "optimism_devnet":
      deployFunc = deployOptimism;
      break;
    case "base_devnet":
      // @ts-expect-error
      deployFunc = deployBase;
      break;
    case "arbitrum_devnet":
      deployFunc = deployOptimism;
      break;
    default:
      deployFunc = deployEthereum;
      break;
  }
  return deployFunc;
}
