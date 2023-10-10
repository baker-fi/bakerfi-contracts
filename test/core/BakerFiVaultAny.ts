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
    const chainId = network.config.chainId;
    const config = BaseConfig[networkName];
    const CBETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
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
    // 2. Deploy cbETH
    const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

    // 4. Deploy cbETH -> ETH
    const swapper = await deploySwapper(
      weth,
      cbETH,
      serviceRegistry,
      CBETH_MAX_SUPPLY
    );

    const settings = await deploySettings(owner.address, serviceRegistry);
    // await stETH.transfer(await wstETH.getAddress(), STETH_TO_WRAPPER);

    // Deposit some WETH on Swapper
    await weth.deposit?.call("", { value: ethers.parseUnits("10000", 18) });
    await weth.transfer(
      await swapper.getAddress(),
      ethers.parseUnits("10000", 18)
    );

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
    await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));

    const strategy = await deployAAVEv3StrategyAny(
      owner.address,
      serviceRegistryAddress,
      "cbETH",
      "cbETH/ETH Oracle",
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
      swapper,
      aave3Pool,
      flashLender,
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
      .to.changeEtherBalances([owner.address], [
        ethers.parseUnits("-10", 18)
    ])
      .to.emit(aave3Pool, "Supply")
      .withArgs(
        await cbETH.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        45705032704000000000n,
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
      );;
  });


  it("Deposit with 1% Flash Loan Fees", async function () {
    const { owner, vault, weth, aave3Pool, strategy, cbETH, flashLender } =
    await loadFixture(deployFunction);
    await flashLender.setFlashLoanFee(10e6); // 1%
    await expect(
      await vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    ).to.emit(aave3Pool, "Borrow")
      .withArgs(
        await weth.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        36062083031040000000n,
        0,
        0,
        0
      );;
  });
});
