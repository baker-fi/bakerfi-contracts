import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";
import {
  deployServiceRegistry,
  deployVault,
  deployStEth,
  deployWStEth,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deployAAVEv3StrategyWstETH,
  deploySettings,
  deployQuoterV2Mock,
} from "../../scripts/common";
import BaseConfig from "../../scripts/config";

describeif(network.name === "hardhat")("BakerFi Vault", function () {
  
  async function deployFunction() {
    const networkName = network.name;
    const chainId = network.config.chainId;
    const config = BaseConfig[networkName];
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
    const UniRouter = await ethers.getContractFactory("UniV3RouterMock");
    const uniRouter = await UniRouter.deploy(
      await weth.getAddress(),
      await wstETH.getAddress()
    );

    // Register Uniswap Router
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Uniswap Router")),
      await uniRouter.getAddress()
    );

    await uniRouter.setPrice(884 * 1e6);

    const settings = await deploySettings(owner.address, serviceRegistry);

    // Deposit some WETH on Swapper
    await weth.deposit?.call("", { value: ethers.parseUnits("10000", 18) });
    await weth.transfer(
      await uniRouter.getAddress(),
      ethers.parseUnits("10000", 18)
    );
    // 5. Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(
      wstETH,
      weth,
      serviceRegistry,
      AAVE_DEPOSIT
    );
    // 6. Deploy wstETH/ETH Oracle
    const oracle = await deployOracleMock(serviceRegistry, "wstETH/ETH Oracle");
    await deployQuoterV2Mock(serviceRegistry);

    const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");
    await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));

    const strategy = await deployAAVEv3StrategyWstETH(
      owner.address,
      serviceRegistryAddress,
      config.swapFeeTier,
      config.AAVEEModeCategory
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
      uniRouter,
      aave3Pool,
      flashLender,
      wstETH,
      oracle,
      strategy,
      settings,
      config,
    };
  }

  it("Vault Initilization", async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    expect(await vault.symbol()).to.equal("brETH");
    expect(await vault.balanceOf(owner.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect((await strategy.getPosition())[0]).to.equal(0);
    expect((await strategy.getPosition())[1]).to.equal(0);
    expect((await strategy.getPosition())[2]).to.equal(0);
    expect(await vault.tokenPerETh()).to.equal(ethers.parseUnits("1", 18));
  });

  it("Deposit 10TH", async function () {
    const { owner, vault, strategy} = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits("10", 18);
    await expect(vault.deposit(owner.address, { value: depositAmount }))
      .to.emit(vault, "Deposit")
      .withArgs(
        owner.address,
        owner.address,
        ethers.parseUnits("10", 18),
        9986343597383680000n
      )
      .to.changeEtherBalances([owner.address], [-ethers.parseUnits("10", 18)]);

    expect(await vault.symbol()).to.equal("brETH");
    expect(await vault.name()).to.equal("Bread ETH");
    expect(await vault.balanceOf(owner.address)).to.equal(9914933531975680000n);
    expect((await strategy.getPosition())[0]).to.equal(45655671260000000000n);
    expect((await strategy.getPosition())[1]).to.equal(35740737730000000000n);
    expect(await vault.totalAssets()).to.equal(9914933530000000000n);
    expect((await strategy.getPosition())[2]).to.equal(782832378);
    expect(await vault.totalSupply()).to.equal(9914933531975680000n);
    expect(await vault.tokenPerETh()).to.equal(1000000000199263060n);
  });

  it("Withdraw - 1 brETH", async function () {
    const { owner, vault, strategy} = await loadFixture(deployFunction);

    const depositAmount = ethers.parseUnits("10", 18);

    await vault.deposit(owner.address, {
      value: depositAmount,
    });

    await expect(vault.withdraw(ethers.parseUnits("1", 18)))
      .to.emit(vault, "Withdraw")
      .withArgs(owner.address, 4969613303000000000n, ethers.parseUnits("1", 18))
      .to.changeEtherBalances([owner.address], [1001373754928851603n]);
    expect(await vault.balanceOf(owner.address)).to.equal(8914933531975680000n);
    expect((await strategy.getPosition())[0]).to.equal(41050933260000000000n);
    expect((await strategy.getPosition())[1]).to.equal(32135999730000000000n);
    expect(await vault.totalAssets()).to.equal(8914933530000000000n);
    expect((await strategy.getPosition())[2]).to.equal(782832378n);
    expect(await vault.totalSupply()).to.equal(8914933531975680000n);
    expect(await vault.tokenPerETh()).to.equal(1000000000221614664n);
  });

  it("Deposit - 0 ETH", async function () {
    const { owner, vault } = await loadFixture(deployFunction);

    await expect(
      vault.deposit(owner.address, {
        value: ethers.parseUnits("0", 18),
      })
    ).to.be.revertedWith("Invalid Amount to be deposit");
  });

  it("Withdraw failed not enough brETH", async function () {
    const { owner, vault } = await loadFixture(deployFunction);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    await expect(
      vault.withdraw(ethers.parseUnits("20", 18))
    ).to.be.revertedWith("No Enough balance to withdraw");
  });

  it("Transfer 10 brETH", async function () {
    const { owner, vault, otherAccount } = await loadFixture(deployFunction);
    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    expect(vault.transfer(1000, otherAccount.address)).to.changeTokenBalances(
      vault,
      [owner.address, otherAccount.address],
      [-1000, 1000]
    );
  });

  it("Harvest Profit on Rebalance", async function () {
    const { owner, vault, otherAccount, aave3Pool, strategy, settings } =
      await loadFixture(deployFunction);
    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    expect(await vault.totalAssets()).to.equal(9914933530000000000n);
    expect((await strategy.getPosition())[0]).to.equal(45655671260000000000n);
    expect((await strategy.getPosition())[1]).to.equal(35740737730000000000n);
    // =~1% Increase in Value
    await aave3Pool.setCollateralPerEth(1142 * 1e6);
    expect(await vault.totalAssets()).to.equal(10399772520000000000n);
    expect((await strategy.getPosition())[0]).to.equal(46140510250000000000n);
    expect((await strategy.getPosition())[1]).to.equal(35740737730000000000n);
    await settings.setFeeReceiver(otherAccount.address);
    await expect(vault.rebalance())
      .to.emit(vault, "Transfer")
      .withArgs(
        "0x0000000000000000000000000000000000000000",
        otherAccount.address,
        4622351927540593n
      );
    expect(await vault.balanceOf(otherAccount.address)).to.equal(
      4622351927540593n
    );
  });

  it("Withdraw With Service Fees", async function () {
    const { owner, vault, settings, otherAccount, anotherAccount } =
      await loadFixture(deployFunction);

    const provider = ethers.provider;
    const depositAmount = ethers.parseUnits("10", 18);

    await settings.setFeeReceiver(otherAccount.address);
    expect(await settings.getFeeReceiver()).to.equal(otherAccount.address);
    await vault.deposit(owner.address, {
      value: depositAmount,
    });

    await vault.withdraw(ethers.parseUnits("1", 18));

    expect(await provider.getBalance(otherAccount.address)).to.equal(
      1000000010013737549288516n
    );
  });

  it("Withdraw - Burn all brETH", async function () {
    const { owner, vault, strategy, settings, otherAccount, anotherAccount } =
      await loadFixture(deployFunction);
    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    const provider = ethers.provider;
    const balanceOf = await vault.balanceOf(owner.address);
    const balanceBefore = await provider.getBalance(owner.address);
    await vault.withdraw(balanceOf);
    const balanceAfter = await provider.getBalance(owner.address);

    expect(await vault.balanceOf(owner.address)).to.equal(0);
    expect(await vault.totalSupply()).to.equal(0);
    expect((await strategy.getPosition())[0]).to.equal(0);
    expect((await strategy.getPosition())[1]).to.equal(0);
    expect(balanceAfter - balanceBefore).to.equal(9928228588247807112n);
    expect((await strategy.getPosition()))[2].to.equal(0);
    expect(await vault.tokenPerETh()).to.equal(ethers.parseUnits("1", 18));
  });

  it("Deposit with No Flash Loan Fees", async () => {
    const { owner, vault, strategy , otherAccount, flashLender, anotherAccount } =
      await loadFixture(deployFunction);

    await flashLender.setFlashLoanFee(0);
    const depositAmount = ethers.parseUnits("10", 18);

    await vault.deposit(owner.address, {
      value: depositAmount,
    });

    expect(await vault.balanceOf(owner.address)).to.equal(9950638564679680000n);
    expect((await strategy.getPosition())[0]).to.equal(45655671260000000000n);
    expect((await strategy.getPosition())[1]).to.equal(35705032700000000000n);
    expect(await vault.totalAssets()).to.equal(9950638560000000000n);
    expect((await strategy.getPosition())[2]).to.equal(782050328);
    expect(await vault.totalSupply()).to.equal(9950638564679680000n);
    expect(await vault.tokenPerETh()).to.equal(1000000000470289416n);
  });

  it("Withdraw with No Flash Loan Fees", async () => {
    const { owner, vault, flashLender } = await loadFixture(deployFunction);

    await flashLender.setFlashLoanFee(0);
    const depositAmount = ethers.parseUnits("10", 18);

    await vault.deposit(owner.address, {
      value: depositAmount,
    });

    await expect(vault.withdraw(ethers.parseUnits("5", 18)))
      .to.emit(vault, "Withdraw")
      .withArgs("0x0000000000000000000000000000000000000000", 0n, 0n)
      .to.changeEtherBalances([owner.address], [5024803137643837552n]);
  });

  it("Adjust Debt with No Flash Loan Fees", async () => {
    const {
      owner,
      vault,
      wstETH,
      weth,
      settings,
      strategy,
      oracle,
      aave3Pool,
    } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits("10", 18);

    await vault.deposit(owner.address, {
      value: depositAmount,
    });

    await aave3Pool.setCollateralPerEth(1130 * 1e6 * 0.9);

    await oracle.setLatestPrice(1130 * 1e6 * 0.9);

    await settings.setMaxLoanToValue(800 * 1e6);

    await expect(vault.rebalance())
      .to.emit(aave3Pool, "Repay")
      .withArgs(
        await weth.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        14343272090000000000n,
        false
      )
      .to.emit(aave3Pool, "Withdraw")
      .withArgs(
        await wstETH.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        14357615362090000000n
      );

    expect(await vault.totalAssets()).to.equal(5090943670000000000n);
  });

  it.skip("Withdraw - Invalid Receiver", async () => {
    const { owner, vault } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits("10", 18);
    await vault.deposit(owner.address, {
      value: depositAmount,
    });

    await expect(
      vault.withdraw(
        ethers.parseUnits("1", 18),
        "0x0000000000000000000000000000000000000000"
      )
    ).to.be.revertedWith("Invalid Receiver");
  });

  it("Rebalance - no balance", async () => {
    const { owner, vault } = await loadFixture(deployFunction);
    await vault.rebalance();
    expect(true).to.equal(true);
  });


  it("Withdraw - Invalid Receiver", async () => {

    const { owner, vault } = await loadFixture(deployFunction);

    for(let i = 0; i < 10; i++) {
      await vault.deposit(owner.address, {
        value: ethers.parseUnits("1", 18),
      });
      const balance = await vault.balanceOf(owner.address);
      await vault.withdraw(balance * BigInt(Math.floor(Math.random() * 199  +1 ))/200n );
    }
    expect(true).to.equal(true);
  })



});
