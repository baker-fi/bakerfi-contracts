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
    deploCbETHToETHOracle,
    deploySettings,
  } from "../../scripts/common";
import BaseConfig from "../../scripts/config";
import { describeif } from "../common";

describeif(network.name === "base_devnet")("VaultBase", function () {

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
        await deploySettings(deployer.address, serviceRegistry);

        // 5. Register UniswapV3 Universal Router
        await serviceRegistry.registerService(
            ethers.keccak256(Buffer.from("Uniswap Router")),
            config.uniswapRouter
        );

         // 6. Deploy the Landromat Uniswap Router Adapter
        const swapper = await deployUniSwapper(
            deployer.address,
            serviceRegistry
        );
        
        await swapper.addFeeTier(config.weth,  config.cbETH, 500);

        // 7. Register AAVE V3 Service
        await serviceRegistry.registerService(
            ethers.keccak256(Buffer.from("AAVE_V3")),
            config.AAVEPool,
        );

        // 8. Register CbETH 
        await serviceRegistry.registerService(
            ethers.keccak256(Buffer.from("cbETH")),
            config.cbETH,
        );
        // 9. Deploy the Oracle
        const oracle = await deploCbETHToETHOracle(
            serviceRegistry,
            config.oracle.chainLink
        );

        await serviceRegistry.registerService(
            ethers.keccak256(Buffer.from("Uniswap Quoter")),
            config.uniswapQuoter,
        );

        // 10. Balancer Vault
        await serviceRegistry.registerService(
            ethers.keccak256(Buffer.from("Balancer Vault")),
            config.balancerVault
          );
          
        // 11. Flash Lender Adapter
        await deployBalancerFL(
            serviceRegistry
        );

       await deployETHOracle(serviceRegistry, config.ethOracle);

        // 12. Deploy the Strategy
        const strategy = await deployAAVEv3StrategyAny(
            deployer.address,
            await serviceRegistry.getAddress(),
            "cbETH",
            "cbETH/ETH Oracle"
        );     

        await strategy.setTargetLTV(ethers.parseUnits("500", 6));

        // 13. Deploy the Vault
        const vault = await deployVault(
            deployer.address, 
          await serviceRegistry.getAddress(),
          await strategy.getAddress() 
        );

        const weth = await ethers.getContractAt("IWETH",  config.weth);
        const cbETH = await ethers.getContractAt("IERC20",  config.cbETH);
        await strategy.transferOwnership(await vault.getAddress());
        return {serviceRegistry, weth, cbETH, vault, deployer, otherAccount, strategy};
    }

    it("Test Initialized Vault", async function () {
        const { deployer, vault } = await loadFixture(deployFunction);
        expect(await vault.symbol()).to.equal("matETH");
        expect(await vault.balanceOf(deployer.address)).to.equal(0);
        expect(await vault.totalSupply()).to.equal(0);
        expect(await vault.totalCollateral()).to.equal(0);
        expect(await vault.totalDebt()).to.equal(0);
        expect(await vault.loanToValue()).to.equal(0);
        expect(await vault.tokenPerETh()).to.equal(0);
        expect(await vault.loanToValue()).to.equal(0);
      });

    it("Deposit 1 TH", async function () {
        const { vault, deployer } = await loadFixture(deployFunction);
        const depositAmount = ethers.parseUnits("1", 18);
        await vault.deposit(deployer.address, {
          value: depositAmount,
        });
        expect(await vault.balanceOf(deployer.address)).to
            .greaterThan(ethers.parseUnits("9", 17))
            .lessThanOrEqual(ethers.parseUnits("10", 17));
        expect(await vault.totalCollateral()).to
            .greaterThan(ethers.parseUnits("19", 17))
            .lessThanOrEqual(ethers.parseUnits("20", 17));
        expect(await vault.totalDebt()).to
            .greaterThan(ethers.parseUnits("9", 17))
            .lessThanOrEqual(ethers.parseUnits("10", 17));
        expect(await vault.totalPosition()).to
            .greaterThan(ethers.parseUnits("9", 17))
            .lessThanOrEqual(ethers.parseUnits("10", 17));
        expect(await vault.loanToValue()).to
            .greaterThan(500000000n)
            .lessThanOrEqual(510000000n);
        expect(await vault.totalSupply()).to
            .greaterThan(ethers.parseUnits("9", 17))
            .lessThanOrEqual(ethers.parseUnits("10", 17));
        expect(await vault.tokenPerETh()).to
            .greaterThan(ethers.parseUnits("1", 18))
            .lessThanOrEqual(ethers.parseUnits("11", 17));
    });

    it("Deposit + Withdraw", async function () {
        const { vault, deployer } = await loadFixture(deployFunction);
        const depositAmount = ethers.parseUnits("10", 18);
        await vault.deposit(deployer.address, {
          value: depositAmount,
        });

        const provider = ethers.provider;
        const balanceBefore = await provider.getBalance(deployer.address)
        await vault.withdraw(ethers.parseUnits("5", 18), deployer.address);
        expect(await vault.balanceOf(deployer.address)).to
            .greaterThan(ethers.parseUnits("4", 18))
            .lessThanOrEqual(ethers.parseUnits("5", 18));
        expect(await vault.totalCollateral()).to
            .greaterThan(ethers.parseUnits("9", 18))
            .lessThanOrEqual(ethers.parseUnits("10", 18));
        expect(await vault.totalDebt()).to
            .greaterThan(ethers.parseUnits("4", 18))
            .lessThanOrEqual(ethers.parseUnits("5", 18));
        expect(await vault.totalPosition()).to
            .greaterThan(ethers.parseUnits("4", 18))
            .lessThanOrEqual(ethers.parseUnits("5", 18));
        expect(await vault.loanToValue()).to
            .greaterThan(400000000n)
            .lessThanOrEqual(600000000n);
        expect(await vault.totalSupply()).to
            .greaterThan(ethers.parseUnits("4", 18))
            .lessThanOrEqual(ethers.parseUnits("5", 18));
        expect(await vault.tokenPerETh()).to
            .greaterThan(ethers.parseUnits("9", 17))
            .lessThanOrEqual(ethers.parseUnits("10", 17));
        const balanceAfter = await provider.getBalance(deployer.address)
        expect(balanceAfter - balanceBefore)
            .greaterThan(ethers.parseUnits("5", 18))
            .lessThanOrEqual(ethers.parseUnits("10", 18));        
    })

    it("Liquidation Protection - Adjust Debt", async function () {
        const { vault, deployer } = await loadFixture(deployFunction);
        const depositAmount = ethers.parseUnits("10", 18);
        await vault.deposit(deployer.address, {
          value: depositAmount,
        });  
        await vault.setTargetLTV(ethers.parseUnits("400", 6));
        await vault.rebalance();
        expect(await vault.loanToValue()).to
            .greaterThan(300000000n)
            .lessThanOrEqual(400000000n);
    });

})
