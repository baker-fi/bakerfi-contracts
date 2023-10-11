import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";
import {
  deployServiceRegistry,
  deployVault,
  deploySwapper,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployUniV3RouterMock,
  deployWETH,
  deployCbETH,
  deploySettings,
  deployQuoterV2Mock,
  deployAAVEv3StrategyAny,
} from "../../scripts/common";
import BaseConfig from "../../scripts/config";

describeif(network.name === "hardhat")("BakerFi Any Vault", function () {
  async function deployFunction() {
    const [owner, otherAccount, anotherAccount] = await ethers.getSigners();
    const networkName = network.name;
    const config = BaseConfig[networkName];
    const CBETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
    const FLASH_LENDER_DEPOSIT = ethers.parseUnits("10000", 18);
    const AAVE_DEPOSIT = ethers.parseUnits("10000", 18);
    const serviceRegistry = await deployServiceRegistry(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
    const weth = await deployWETH(serviceRegistry);

    // Deploy Flash Lender
    const flashLender = await deployFlashLender(
      serviceRegistry,
      weth,
      FLASH_LENDER_DEPOSIT
    );

    // Deploy cbETH
    const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

    // Deploy cbETH -> ETH Uniswap Router
    const UniRouter = await ethers.getContractFactory("UniV3RouterMock");
    const uniRouter = await UniRouter.deploy(
      await weth.getAddress(),
      await cbETH.getAddress()
    );

    // Register Uniswap Router
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Uniswap Router")),
      await uniRouter.getAddress()
    );

    await uniRouter.setPrice(885 * 1e6);

    // Deposit ETH on Uniswap Mock Router
    await weth.deposit?.call("", { value: ethers.parseUnits("10000", 18) });
    await weth.transfer(
      await uniRouter.getAddress(),
      ethers.parseUnits("10000", 18)
    );


    // Deposit cbETH on Uniswap Mock Router
    await cbETH.transfer(
      await uniRouter.getAddress(),
      ethers.parseUnits("10000", 18)
    );

    const settings = await deploySettings(owner.address, serviceRegistry);

    // 5. Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(
      cbETH,
      weth,
      serviceRegistry,
      AAVE_DEPOSIT
    );

    // 6. Deploy wstETH/ETH Oracle
    const oracle = await deployOracleMock(serviceRegistry, "cbETH/ETH Oracle");
    const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");
    await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));
    await deployQuoterV2Mock(serviceRegistry);
    const strategy = await deployAAVEv3StrategyAny(
      owner.address,
      serviceRegistryAddress,
      "cbETH",
      "cbETH/ETH Oracle",
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
      cbETH,
      weth,
      owner,
      otherAccount,
      anotherAccount,
      serviceRegistry,
      vault,
      aave3Pool,
      flashLender,
      uniRouter,
      oracle,
      strategy,
      settings,
    };
  }

  it("Deposit with no Flash Loan Fees", async function () {
    const { owner, vault, weth, aave3Pool, strategy, cbETH, flashLender } =
      await loadFixture(deployFunction);
    await flashLender.setFlashLoanFee(0);
    await expect(
      await vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    )
      .to.changeEtherBalances([owner.address], [ethers.parseUnits("-10", 18)])
      .to.emit(aave3Pool, "Supply")
      .withArgs(
        await cbETH.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        40448953943040000000n,
        0
      )
      .to.emit(aave3Pool, "Borrow")
      .withArgs(
        await weth.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        35705032704000000000n,
        0,
        0,
        0
      );
  });

  it("Deposit with 1% Flash Loan Fees", async function () {
    const { owner, vault, weth, aave3Pool, strategy, cbETH, flashLender } =
      await loadFixture(deployFunction);
    await flashLender.setFlashLoanFee(10e6); // 1%
    await expect(
      await vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    )
      .to.emit(aave3Pool, "Borrow")
      .withArgs(
        await weth.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        36062083031040000000n,
        0,
        0,
        0
      );
  });

  it("Multiple Deposits", async function () {
    const { owner, vault, uniRouter, strategy } = await loadFixture(
      deployFunction
    );

    await expect(
      vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    )
      .to.emit(strategy, "StrategyAmountUpdate")
      .withArgs(await strategy.getAddress(), 9966580218931200000n);

    await expect(
      vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    )
      .to.emit(strategy, "StrategyAmountUpdate")
      .withArgs(await strategy.getAddress(), 19933160437862400000n);
    await expect(
      vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    )
      .to.emit(strategy, "StrategyAmountUpdate")
      .withArgs(await strategy.getAddress(), 29899740656793600000n);
  });

  it("convertToShares - 1ETH", async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    expect(await vault.convertToShares(ethers.parseUnits("1", 18))).to.equal(
      999999999892761611n
    );
  });

  it("convertToAssets - 1e18 brETH", async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });
    expect(await vault.convertToAssets(ethers.parseUnits("1", 18))).to.equal(
      1000000000107238388n
    );
  });

  it("convertToShares - 1ETH no balance", async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);

    expect(await vault.convertToAssets(ethers.parseUnits("1", 18))).to.equal(
      ethers.parseUnits("1", 18)
    );
  });

  it("convertToAssets - 1e18 brETH  no balance", async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    expect(await vault.convertToAssets(ethers.parseUnits("1", 18))).to.equal(
      ethers.parseUnits("1", 18)
    );
  });

  it("tokenPerETh - No Balance", async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    expect(await vault.tokenPerETh()).to.equal(ethers.parseUnits("1", 18));
  });
});
