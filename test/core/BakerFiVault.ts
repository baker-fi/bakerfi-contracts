import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";
import {
  deployServiceRegistry,
  deployVault,
  deployStEth,
  deployWStEth,
  deploySwapper,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deployAAVEv3StrategyWstETH,
  deploySettings,
  deployQuoterV2Mock,
} from "../../scripts/common";

describeif(network.name === "hardhat")("BakerFi Vault", function () {
  async function deployFunction() {
    const [owner, otherAccount, anotherAccount] = await ethers.getSigners();
    const STETH_MAX_SUPPLY = ethers.parseUnits("1000010000", 18);
    const STETH_TO_WRAPPER = ethers.parseUnits("10000", 18);
    const FLASH_LENDER_DEPOSIT = ethers.parseUnits("10000", 18);
    const AAVE_DEPOSIT = ethers.parseUnits("10000", 18);
    const serviceRegistry = await deployServiceRegistry(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
    const weth = await deployWETH(serviceRegistry);
    // 1. Deploy Flash Lender
    const flashLender = await deployFlashLender(
      serviceRegistry,
      weth,
      FLASH_LENDER_DEPOSIT
    );
    // 2. Deploy stETH
    const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
    // 3. Deploy wstETH
    const wstETH = await deployWStEth(
      serviceRegistry,
      await stETH.getAddress()
    );
    await stETH.transfer(await wstETH.getAddress(), STETH_TO_WRAPPER);
    // 4. Deploy WETH -> stETH Swapper
    const swapper = await deploySwapper(
      weth,
      stETH,
      serviceRegistry,
      ethers.parseUnits("1000000000", 18)
    );

    const settings = await deploySettings(   
      owner.address,
      serviceRegistry,
    );
   // await stETH.transfer(await wstETH.getAddress(), STETH_TO_WRAPPER);
    
   // Deposit some WETH on Swapper
    await weth.deposit?.call("", { value: ethers.parseUnits("10000", 18) });
    await weth.transfer( await swapper.getAddress(), ethers.parseUnits("10000", 18));
    // 5. Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(
      wstETH,
      weth,
      serviceRegistry,
      AAVE_DEPOSIT
    );
    // 6. Deploy wstETH/ETH Oracle
    await deployOracleMock(serviceRegistry, "wstETH/ETH Oracle");
    await deployQuoterV2Mock(serviceRegistry);

    const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");    
    await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));

    const strategy = await deployAAVEv3StrategyWstETH(
      owner.address,
      serviceRegistryAddress
    );
    const vault = await deployVault(
      owner.address,
      serviceRegistryAddress,
      await strategy.getAddress()
    );
    
    await strategy.transferOwnership(await vault.getAddress());
    return {
      stETH,
      weth,
      owner,
      otherAccount,
      anotherAccount,
      serviceRegistry,
      vault,
      swapper,
      aave3Pool,
      flashLender,
      wstETH,
      settings,
    };
  }

  it("Test Initialized Vault", async function () {
    const { owner, vault } = await loadFixture(deployFunction);
    expect(await vault.symbol()).to.equal("brETH");
    expect(await vault.balanceOf(owner.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect(await vault.totalCollateral()).to.equal(0);
    expect(await vault.totalDebt()).to.equal(0);
    expect(await vault.loanToValue()).to.equal(0);
    expect(await vault.tokenPerETh()).to.equal(0);
    expect(await vault.loanToValue()).to.equal(0);
  });

  it("Test Deposit Event", async function () {
    const { owner, vault } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits("10", 18);
    await expect(vault.deposit(owner.address, { value: depositAmount,}))
                .to.emit(vault, "Deposit")
                .withArgs(
                  owner.address,
                  owner.address, 
                  ethers.parseUnits("10", 18), 
                  9986343597383680000n
                ).to.changeEtherBalances(
                  [owner.address], [ -ethers.parseUnits("10", 18)]
                );
  });

  it("Test Deposit", async function () {
    const { owner, vault } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits("10", 18);
    await vault.deposit(owner.address, {
      value: depositAmount,
    });

    expect(await vault.symbol()).to.equal("brETH");
    expect(await vault.name()).to.equal("Bread ETH");
    expect(await vault.balanceOf(owner.address)).to.equal(9986343597383680000n);
    expect(await vault.totalCollateral()).to.equal(45655671260000000000n);
    expect(await vault.totalDebt()).to.equal(35740737730000000000n);
    expect(await vault.totalPosition()).to.equal(9914933530000000000n);
    expect(await vault.loanToValue()).to.equal(782832378);
    expect(await vault.totalSupply()).to.equal(9986343597383680000n);
    expect(await vault.tokenPerETh()).to.equal(1007202273940376078n);
  });

  it("Test Withdraw", async function () {
    const { owner, vault } = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits("10", 18);

    await vault.deposit(owner.address, {
      value: depositAmount,
    });

    await vault.withdraw(ethers.parseUnits("1", 18), owner.address);
    expect(await vault.balanceOf(owner.address)).to.equal(8986343597383680000n);
    expect(await vault.totalCollateral()).to.equal(41083860720000000000n);
    expect(await vault.totalDebt()).to.equal(32161776410000000000n);
    expect(await vault.totalPosition()).to.equal(8922084310000000000n);
    expect(await vault.loanToValue()).to.equal(782832378n);
    expect(await vault.totalSupply()).to.equal(8986343597383680000n);
    expect(await vault.tokenPerETh()).to.equal(1007202273050889831n);
  });


  it("Test Withdraw Event", async function () {    
    
    const { owner, vault } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits("10", 18);

    await vault.deposit(owner.address, {
      value: depositAmount,
    });

    await expect(vault.withdraw(ethers.parseUnits("5", 18), owner.address))
      .to.emit(vault, "Withdraw")
      .withArgs(
        owner.address, 
        4969613303000000000n, 
        ethers.parseUnits("5", 18),         
    ).to.changeEtherBalances(
      [owner.address], [ 4971065791653254210n]
    );;
  })


  it("Test Zero Deposit", async function () {    
    const { owner, vault } = await loadFixture(deployFunction);
    
    await expect(vault.deposit(owner.address, {
      value: ethers.parseUnits("0", 18),
    }))
    .to.be.revertedWith("Invalid Amount to be deposit");
  });


  it("Withdraw overbalance", async function () {    
    const { owner, vault } = await loadFixture(deployFunction);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });
    
    await expect(
      vault.withdraw(ethers.parseUnits("20", 18),owner.address)
    ).to.be.revertedWith("No Enough balance to withdraw");
  });

  it("Transfer Shares ", async function () { 
    const { owner, vault, otherAccount } = await loadFixture(deployFunction);
    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });
    
    expect(vault.transfer(1000, otherAccount.address)).
      to.changeTokenBalances(vault, [owner.address, otherAccount.address], [-1000, 1000]);;
  });


  it("Verify profit on Rebalance", async function () { 

    const { owner, vault, otherAccount, aave3Pool, settings} = await loadFixture(deployFunction);
    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    expect(await vault.totalPosition()).to.equal(9914933530000000000n);
    expect(await vault.totalCollateral()).to.equal(45655671260000000000n);
    expect(await vault.totalDebt()).to.equal(35740737730000000000n);
    // =~1% Increase in Value 
    await aave3Pool.setCollateralPerEth(
      (1142)*(1e6)
    );

    expect(await vault.totalPosition()).to.equal(10399772520000000000n);
    expect(await vault.totalCollateral()).to.equal(46140510250000000000n);
    expect(await vault.totalDebt()).to.equal(35740737730000000000n);
    await settings.setFeeReceiver(otherAccount.address);
    await expect(vault.rebalance())
        .to.emit(vault, "Transfer")
        .withArgs(
          "0x0000000000000000000000000000000000000000",
          otherAccount.address, 
          3969931088329518n
        );
    expect(await vault.balanceOf(otherAccount.address))
      .to.equal(3969931088329518n);
  });


  it("Test Withdraw With Fees", async function () {
    const { owner, vault, settings, otherAccount, anotherAccount} = await loadFixture(deployFunction);
    
    const provider = ethers.provider;
    const depositAmount = ethers.parseUnits("10", 18);
    
    await settings.setFeeReceiver(otherAccount.address);    
    expect(await settings.getFeeReceiver()).to.equal(otherAccount.address);
    await vault
      .deposit(owner.address, {
        value: depositAmount,
      });

    await vault
      .withdraw(ethers.parseUnits("1", 18), owner.address);
  
    expect(await provider.getBalance(otherAccount.address)).to.equal(1000000009942131517965379n);

  });


  it("Test Max Withdraw", async function (){
    const { owner, vault, settings, otherAccount, anotherAccount} = await loadFixture(deployFunction);
    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });
    
    const provider = ethers.provider;
    const balanceOf = await vault.balanceOf(owner.address);
    const balanceBefore = await provider.getBalance(otherAccount.address);
    await vault.withdraw(balanceOf, otherAccount.address);
    const balanceAfter = await provider.getBalance(otherAccount.address);
    
    expect(await vault.balanceOf(owner.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect(await vault.totalCollateral()).to.equal(0);
    expect(await vault.totalDebt()).to.equal(0);
    expect(balanceAfter - balanceBefore).to.equal(9928554227270000000n);
    expect(await vault.loanToValue()).to.equal(0);
    expect(await vault.tokenPerETh()).to.equal(0);
  });



});
