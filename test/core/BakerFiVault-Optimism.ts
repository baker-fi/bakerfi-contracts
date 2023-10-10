import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import {
  deployServiceRegistry,
  deployVault,
  deployBalancerFL,
  deployAAVEv3StrategyAny,
  deployETHOracle,
  deployUniSwapper,
  deploWSTETHToETHOracle,
  deploySettings,
} from "../../scripts/common";
import BaseConfig from "../../scripts/config";
import { describeif } from "../common";

describeif(network.name === "optimism_devnet")("VaultOptimism", function () {
  
  async function deployFunction() {
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
    // 6. Deploy the Landromat Uniswap Router Adapter
    const swapper = await deployUniSwapper(deployer.address, serviceRegistry);

    await swapper.addFeeTier(config.weth, config.wstETH, 100);
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
      config.wstETH
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
      config.AAVEEModeCategory
    );

    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Strategy")),
      await strategy.getAddress() ,
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

  it("Test Initialized Vault", async function () {
    const { deployer, vault } = await loadFixture(deployFunction);
    expect(await vault.symbol()).to.equal("brETH");
    expect(await vault.balanceOf(deployer.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect(await vault.totalCollateral()).to.equal(0);
    expect(await vault.totalDebt()).to.equal(0);
    expect(await vault.loanToValue()).to.equal(0);
    expect(await vault.tokenPerETh()).to.equal(0);
    expect(await vault.loanToValue()).to.equal(0);
  });

  it("Deposit 1 ETH", async function () {
    const { vault, deployer } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits("1", 18);
    await vault.deposit(deployer.address, {
      value: depositAmount,
    });
    expect(await vault.balanceOf(deployer.address))
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
    expect(await vault.totalCollateral())
      .to.greaterThan(ethers.parseUnits("40", 17))
      .lessThanOrEqual(ethers.parseUnits("46", 17));
    expect(await vault.totalDebt())
      .to.greaterThan(ethers.parseUnits("33", 17))
      .lessThanOrEqual(ethers.parseUnits("37", 17));
    expect(await vault.totalPosition())
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
    expect(await vault.loanToValue())
      .to.greaterThan(700000000n)
      .lessThanOrEqual(810000000n);
    expect(await vault.totalSupply())
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
    expect(await vault.tokenPerETh())
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
  });

  it("Deposit + Withdraw", async function () {
    const { vault, settings, deployer } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits("10", 18);

    await settings.setLoanToValue(ethers.parseUnits("500", 6));

    await vault.deposit(deployer.address, {
      value: depositAmount,
    });

    const provider = ethers.provider;
    const balanceBefore = await provider.getBalance(deployer.address);
    await vault.withdraw(ethers.parseUnits("5", 18), deployer.address);
    expect(await vault.balanceOf(deployer.address))
      .to.greaterThan(ethers.parseUnits("4", 18))
      .lessThanOrEqual(ethers.parseUnits("6", 18));
    expect(await vault.totalCollateral())
      .to.greaterThan(ethers.parseUnits("9", 18))
      .lessThanOrEqual(ethers.parseUnits("11", 18));
    expect(await vault.totalDebt())
      .to.greaterThan(ethers.parseUnits("4", 18))
      .lessThanOrEqual(ethers.parseUnits("6", 18));
    expect(await vault.totalPosition())
      .to.greaterThan(ethers.parseUnits("4", 18))
      .lessThanOrEqual(ethers.parseUnits("6", 18));
    expect(await vault.loanToValue())
      .to.greaterThan(400000000n)
      .lessThanOrEqual(600000000n);
    expect(await vault.totalSupply())
      .to.greaterThan(ethers.parseUnits("4", 18))
      .lessThanOrEqual(ethers.parseUnits("6", 18));
    expect(await vault.tokenPerETh())
      .to.greaterThan(ethers.parseUnits("9", 17))
      .lessThanOrEqual(ethers.parseUnits("11", 17));
    const balanceAfter = await provider.getBalance(deployer.address);
    expect(balanceAfter - balanceBefore)
      .greaterThan(ethers.parseUnits("5", 18))
      .lessThanOrEqual(ethers.parseUnits("11", 18));
  });

  it("Liquidation Protection - Adjust Debt", async function () {
    const { vault, strategy, settings, aave3Pool, weth, deployer, wstETH } =
      await loadFixture(deployFunction);
    
    await settings.setLoanToValue(ethers.parseUnits("500", 6));    
    await settings.setMaxLoanToValue(ethers.parseUnits("510", 6));
    
    const depositAmount = ethers.parseUnits("1", 18);
    
    await expect( vault.deposit(deployer.address, {
      value: depositAmount,
    })).to.emit(
        strategy, "StrategyAmountUpdate"). withArgs(
        await strategy.getAddress(),
        (value)=> {
            return value>= 971432545612539374n;
        } );


    await settings.setLoanToValue(ethers.parseUnits("400", 6));
    await settings.setMaxLoanToValue(ethers.parseUnits("400", 6));

    await expect(vault.rebalance())
      .to.emit(
        strategy, "StrategyAmountUpdate").withArgs(
        await strategy.getAddress(),
        (value)=> {           
            return value>= 902114986650737323n;
        }
       )   ;
    expect(await vault.loanToValue())
      .to.greaterThan(300000000n)
      .lessThanOrEqual(410000000n);
  });
});
