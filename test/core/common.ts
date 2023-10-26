import { ethers, network } from "hardhat";
import {
    deployServiceRegistry,
    deployVault,
    deployBalancerFL,
    deployAAVEv3StrategyAny,
    deployETHOracle,
    deployUniSwapper,
    deploCbETHToETHOracle,
    deploWSTETHToETHOracle,
    deployAAVEv3StrategyWstETH,
    deploySettings,
  } from "../../scripts/common";

import BaseConfig from "../../scripts/config";


export async function deployBase() {
    const [deployer, otherAccount] = await ethers.getSigners();
    const networkName = network.name;
    const config = BaseConfig[networkName];

    // 1. Deploy Service Registry
    const serviceRegistry = await deployServiceRegistry(deployer.address);

    // 3. Set the WETH Address
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("WETH")),
      config.weth
    );
    // 4. Deploy Settings
    await deploySettings(deployer.address, serviceRegistry);

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
    const oracle = await deploCbETHToETHOracle(
      serviceRegistry,
      config.oracle.chainLink
    );

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

    await deployETHOracle(serviceRegistry, config.ethOracle);

    // 12. Deploy the Strategy
    const strategy = await deployAAVEv3StrategyAny(
      deployer.address,
      await serviceRegistry.getAddress(),
      "cbETH",
      "cbETH/ETH Oracle",
      config.swapFeeTier,
      config.AAVEEModeCategory
    );

    await strategy.setTargetLTV(ethers.parseUnits("500", 6));

    // 13. Deploy the Vault
    const vault = await deployVault(
      deployer.address,
      await serviceRegistry.getAddress(),
      await strategy.getAddress()
    );

    const weth = await ethers.getContractAt("IWETH", config.weth);
    const cbETH = await ethers.getContractAt("IERC20", config.cbETH);
    await strategy.transferOwnership(await vault.getAddress());
    return {
      serviceRegistry,
      weth,
      config,
      cbETH,
      vault,
      deployer,
      otherAccount,
      strategy,
    };
  }


  export async function deployOptimism() {
    const [deployer, otherAccount] = await ethers.getSigners();
    const networkName = network.name;
    const config = BaseConfig[networkName];

    // 1. Deploy Service Registry
    const serviceRegistry = await deployServiceRegistry(deployer.address);
    // 3. Set the WETH Address
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("WETH")),
      config.weth
    );
    // 4. Deploy Settings
    const settings = await deploySettings(deployer.address, serviceRegistry);

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
    const oracle = await deploWSTETHToETHOracle(
      serviceRegistry,
      config.oracle.chainLink,
    );

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

    await deployETHOracle(serviceRegistry, config.ethOracle);

    // 12. Deploy the Strategy
    const strategy = await deployAAVEv3StrategyAny(
      deployer.address,
      await serviceRegistry.getAddress(),
      "wstETH",
      "wstETH/ETH Oracle",
      config.swapFeeTier,
      config.AAVEEModeCategory
    );

    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Strategy")),
      await strategy.getAddress()
    );

    await settings.setLoanToValue(ethers.parseUnits("800", 6));

    // 13. Deploy the Vault
    const vault = await deployVault(
      deployer.address,
      await serviceRegistry.getAddress(),
      await strategy.getAddress()
    );

    const weth = await ethers.getContractAt("IWETH", config.weth);
    const aave3Pool = await ethers.getContractAt("IPoolV3", config.AAVEPool);
    const wstETH = await ethers.getContractAt("IERC20", config.wstETH);
    await strategy.transferOwnership(await vault.getAddress());
    return {
      serviceRegistry,
      weth,
      wstETH,
      vault,
      deployer,
      otherAccount,
      strategy,
      settings,
      aave3Pool,
      config,
    };
  }


export async function deployEthereum() {
    const [deployer, otherAccount] = await ethers.getSigners();
    const networkName = network.name;
    const config = BaseConfig[networkName];

    // Deploy Service Registry
    const serviceRegistry = await deployServiceRegistry(deployer.address);
    
    // Register the WETH Contract on Service Registry
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("WETH")),
      config.weth
    );
    // Deploy Bakerfi Settings Contract
    const settings = await deploySettings(deployer.address, serviceRegistry);

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

    await deployETHOracle(serviceRegistry, config.ethOracle);

    // 12. Deploy the Strategy
    const strategy = await deployAAVEv3StrategyWstETH(
      deployer.address,
      await serviceRegistry.getAddress(),
      config.swapFeeTier,
      config.AAVEEModeCategory
    );

    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Strategy")),
      await strategy.getAddress()
    );

    await settings.setLoanToValue(ethers.parseUnits("800", 6));

    // 13. Deploy the Vault
    const vault = await deployVault(
      deployer.address,
      await serviceRegistry.getAddress(),
      await strategy.getAddress()
    );

    const weth = await ethers.getContractAt("IWETH", config.weth);
    const aave3Pool = await ethers.getContractAt("IPoolV3", config.AAVEPool);
    const wstETH = await ethers.getContractAt("IERC20", config.wstETH);
    await strategy.transferOwnership(await vault.getAddress());
    return {
      serviceRegistry,
      weth,
      wstETH,
      vault,
      deployer,
      otherAccount,
      strategy,
      settings,
      aave3Pool,
      config,
    };
  }


  async function deployWstETHToETHOracle(config: any, serviceRegistry: any) {
    const WSETHToETH = await ethers.getContractFactory("WstETHToETHOracleETH");
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
    switch( network.name) {
      case "ethereum_devnet":
        deployFunc = deployEthereum;
        break;
      case "optimism_devnet":
        deployFunc = deployOptimism;
        break;
      case "base_devnet":
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