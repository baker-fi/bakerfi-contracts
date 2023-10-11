import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import {
  deployServiceRegistry,
  deployStEth,
  deployWStEth,
  deployAaveV3,
  deploySettings,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deployAAVEv3StrategyWstETH,
  deployQuoterV2Mock,
} from "../../scripts/common";
import { describeif } from "../common";
import BaseConfig from "../../scripts/config";

describeif(network.name === "hardhat")("AAVEv3StrategyWstETH", function () {
  async function deployFunction() {
    const networkName = network.name;
    const chainId = network.config.chainId;
    const config = BaseConfig[networkName];
    const [owner, otherAccount] = await ethers.getSigners();
    const STETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
    const DEPOSIT_ST_ETH_SUPPLY = ethers.parseUnits("10000000", 18);
    const WRAP_ST_ETH_DEPOSIT = ethers.parseUnits("10000000", 18);
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
    const settings = await deploySettings(owner.address, serviceRegistry);
    // 2. Deploy stETH
    const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
    // 3. Deploy wstETH
    const wstETH = await deployWStEth(
      serviceRegistry,
      await stETH.getAddress()
    );

    // Deploy the Swapper Mocker
    const UniRouter = await ethers.getContractFactory("UniV3RouterMock");
    const uniRouter = await UniRouter.deploy(
      await weth.getAddress(),
      await wstETH.getAddress()
    );
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Uniswap Router")),
      await uniRouter.getAddress()
    );
    await uniRouter.setPrice(885 * 1e6);

    await stETH.approve(await wstETH.getAddress(), WRAP_ST_ETH_DEPOSIT);
    await wstETH.wrap(WRAP_ST_ETH_DEPOSIT);
    const balance = await wstETH.balanceOf(owner.address);
    // Deposit wstETH and ETH on Uniswap Router
    await wstETH.transfer(await uniRouter.getAddress(), balance);
    await weth.deposit?.call("", { value: ethers.parseUnits("100", 18) });
    await weth.transfer(
      await uniRouter.getAddress(),
      ethers.parseUnits("100", 18)
    );

    // 5. Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(
      wstETH,
      weth,
      serviceRegistry,
      AAVE_DEPOSIT
    );

    await deployQuoterV2Mock(serviceRegistry);
    // 6. Deploy wstETH/ETH Oracle
    const oracle = await deployOracleMock(serviceRegistry, "wstETH/ETH Oracle");
    const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");
    await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));
    const strategy = await deployAAVEv3StrategyWstETH(
      owner.address,
      serviceRegistryAddress,
      config.swapFeeTier,
      config.AAVEEModeCategory
    );

    return {
      stETH,
      weth,
      owner,
      otherAccount,
      serviceRegistry,
      uniRouter,
      aave3Pool,
      config,
      flashLender,
      wstETH,
      strategy,
      oracle,
      settings,
    };
  }

  it("Test Initialized Strategy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    expect(await strategy.getPosition()).to.deep.equal([0n, 0n, 0n]);
    expect(await strategy.totalAssets()).to.equal(0);
  });

  it("Test Deploy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    // Deploy 10 ETH
    expect(
      await strategy.deploy({
        value: ethers.parseUnits("10", 18),
      })
    ).to.changeEtherBalances([owner.address], [ethers.parseUnits("10", 18)]);
    expect(await strategy.getPosition()).to.deep.equal([
      45655671260000000000n,
      35740737730000000000n,
      782832378n,
    ]);
    expect(await strategy.totalAssets()).to.equal(9914933530000000000n);
  });

  it("Harvest Profit - No Debt Adjust", async function () {
    const { owner, strategy, aave3Pool } = await loadFixture(deployFunction);
    // Deploy 10 ETH
    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });
    // Increment the Collateral value by 10%
    await aave3Pool.setCollateralPerEth(1130 * 1e6 * 1.1);

    expect(strategy.harvest())
      .to.emit(strategy, "StrategyProfit")
      .withArgs(4969613303000000000n);
    expect(await strategy.getPosition()).to.deep.equal([
      50221238390000000000n,
      35740737730000000000n,
      711665798n,
    ]);
    expect(await strategy.totalAssets()).to.equal(14480500660000000000n);
  });

  it("Harvest Loss - No Debt Adjust", async function () {
    const { owner, oracle, strategy, aave3Pool } = await loadFixture(
      deployFunction
    );
    // Deploy 10 ETH
    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });

    expect(await strategy.getPosition()).to.deep.equal([
      45655671260000000000n,
      35740737730000000000n,
      782832378n,
    ]);

    expect(await strategy.totalAssets()).to.equal(9914933530000000000n);

    // Increment the Collateral value by 10%
    await aave3Pool.setCollateralPerEth(1130 * 1e6 * 0.98);
    await oracle.setLatestPrice(1130 * 1e6 * 0.98);

    await expect(strategy.harvest())
      .to.emit(strategy, "StrategyLoss")
      .withArgs(913113421975680000n, 9001820110000000000n);

    expect(await strategy.getPosition()).to.deep.equal([
      44742557840000000000n,
      35740737730000000000n,
      798808549n,
    ]);

    expect(await strategy.totalAssets()).to.equal(9001820110000000000n);
  });

  it("Harvest - Debt Adjust", async function () {
    const { owner, settings, oracle, strategy, aave3Pool } = await loadFixture(
      deployFunction
    );
    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });
    // Descrease the Collateral value by 10%

    await aave3Pool.setCollateralPerEth(1130 * 1e6 * 0.9);
    await oracle.setLatestPrice(1130 * 1e6 * 0.9);

    await settings.setMaxLoanToValue(800 * 1e6);

    expect(await strategy.getPosition()).to.deep.equal([
      41090104140000000000n,
      35740737730000000000n,
      869813753n,
    ]);

    await expect(strategy.harvest())
      .to.emit(strategy, "StrategyAmountUpdate")
      .withArgs(await strategy.getAddress(), 5349366410000000000n);

    expect(await strategy.getPosition()).to.deep.equal([
      26488409310000000000n,
      21397465640000000000n,
      807804854n,
    ]);

    expect(await strategy.totalAssets()).to.equal(5090943670000000000n);
  });

  it("Harvest Loss - Collateral Value is lower than debt", async function () {
    const { owner, settings, oracle, strategy, aave3Pool } = await loadFixture(
      deployFunction
    );
    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });
    // Increment the Collateral value by 10%
    await aave3Pool.setCollateralPerEth(1130 * 1e6 * 0.5);

    await oracle.setLatestPrice(1130 * 1e6 * 0.5);

    await expect(strategy.harvest()).to.be.revertedWith(
      "Collateral is lower that debt"
    );
  });
});
