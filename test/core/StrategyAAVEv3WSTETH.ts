import "@nomicfoundation/hardhat-ethers";
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
  deployStrategyAAVEv3WstETH,
  deployQuoterV2Mock,
} from "../../scripts/common";
import { describeif } from "../common";
import BaseConfig from "../../scripts/config";

/**
 *  Strategy Mainnet wstETH/ETH Unit Tests
 */
describeif(network.name === "hardhat")(
  "Strategy Mainnet wstETH/ETH",
  function () {
    it("Test Initialized Strategy", async function () {
      const { owner, strategy } = await loadFixture(deployFunction);
      expect(await strategy.getPosition(0)).to.deep.equal([0n, 0n, 0n]);
      expect(await strategy.deployed(0)).to.equal(0);
    });

    it("Test Deploy", async function () {
      const { owner, strategy } = await loadFixture(deployFunction);
      // Deploy 10 ETH
      expect(
        await strategy.deploy({
          value: ethers.parseUnits("10", 18),
        })
      ).to.changeEtherBalances([owner.address], [ethers.parseUnits("10", 18)]);

      expect(await strategy.getPosition(0)).to.deep.equal([
        45702851552764668112n,
        35740737736704000000n,
        782024239n,
      ]);
      expect(await strategy.deployed(0)).to.equal(9962113816060668112n);
    });

    it("Harvest Profit - No Debt Adjust", async function () {
      const { owner, strategy, aave3Pool, oracle } = await loadFixture(
        deployFunction
      );
      // Deploy 10 ETH
      await strategy.deploy({
        value: ethers.parseUnits("10", 18),
      });
      // Increment the Collateral value by 10%
      await oracle.setLatestPrice(ethers.parseUnits("2926", 18));
      await aave3Pool.setCollateralPerEth(1154 * 1e6 * 1.1);

      expect(strategy.harvest())
        .to.emit(strategy, "StrategyProfit")
        .withArgs(4969613303000000000n);
      expect(await strategy.getPosition(0)).to.deep.equal([
        50273136708041134924n,
        35740737736704000000n,
        710931126n,
      ]);
      expect(await strategy.deployed(0)).to.equal(14532398971337134924n);
    });

    it("Harvest Loss - No Debt Adjust", async function () {
      const { owner, oracle, strategy, aave3Pool } = await loadFixture(
        deployFunction
      );
      // Deploy 10 ETH
      await strategy.deploy({
        value: ethers.parseUnits("10", 18),
      });

      expect(await strategy.getPosition(0)).to.deep.equal([
        45702851552764668112n,
        35740737736704000000n,
        782024239n,
      ]);

      expect(await strategy.deployed(0)).to.equal(9962113816060668112n);

      // Increment the Collateral value by 10%
      await oracle.setLatestPrice(ethers.parseUnits("2606", 18));

      await expect(strategy.harvest())
        .to.emit(strategy, "StrategyLoss")
        .withArgs(927802249567403037n);

      expect(await strategy.getPosition(0)).to.deep.equal([
        44775049303197265075n,
        35740737736704000000n,
        798228886n,
      ]);

      expect(await strategy.deployed(0)).to.equal(9034311566493265075n);
    });

    it("Harvest - Debt Adjust", async function () {
      const { owner, settings, oracle, strategy, aave3Pool } =
        await loadFixture(deployFunction);
      await strategy.deploy({
        value: ethers.parseUnits("10", 18),
      });
      // Descrease the Collateral value by 10%
      await oracle.setLatestPrice(ethers.parseUnits("2394", 18));
      await strategy.setMaxLoanToValue(800 * 1e6);

      expect(await strategy.getPosition(0)).to.deep.equal([
        41132566397488201301n,
        35740737736704000000n,
        868915821n,
      ]);

      await expect(strategy.harvest())
        .to.emit(strategy, "StrategyAmountUpdate")
        .withArgs(5391828660784201301n);

      expect(await strategy.getPosition(0)).to.deep.equal([
        28364338891302690959n, 
        21567314643136805200n, 
        760367259n
      ]);

      expect(await strategy.deployed(0)).to.equal(6797024248165885759n);
    });

    it("Harvest Loss - Collateral Value is lower than debt", async function () {
      const { owner, settings, oracle, strategy, aave3Pool } =
        await loadFixture(deployFunction);
      await strategy.deploy({
        value: ethers.parseUnits("10", 18),
      });
      // Increment the Collateral value by 10%
      await aave3Pool.setCollateralPerEth(1154 * 1e6 * 0.5);

      await oracle.setLatestPrice(1154 * 1e6 * 0.5);

      await expect(strategy.harvest()).to.be.revertedWithCustomError(
        strategy, "CollateralLowerThanDebt"
      );
    });
  }
);

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
  const BakerFiProxyAdmin = await ethers.getContractFactory(
    "BakerFiProxyAdmin"
  );
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

  // 1. Deploy Flash Lender
  const flashLender = await deployFlashLender(
    serviceRegistry,
    weth,
    FLASH_LENDER_DEPOSIT
  );
  const { proxy: settingsProxy } = await deploySettings(
    owner.address,
    serviceRegistry,
    proxyAdmin
  );
  const pSettings = await ethers.getContractAt(
    "Settings",
    await settingsProxy.getAddress()
  );
  // 2. Deploy stETH
  const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
  // 3. Deploy wstETH
  const wstETH = await deployWStEth(serviceRegistry, await stETH.getAddress());

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

  await uniRouter.setPrice(8665 * 1e5);

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
  const oracle = await deployOracleMock(serviceRegistry, "wstETH/USD Oracle");
  const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");

  await oracle.setLatestPrice(ethers.parseUnits("2660", 18));
  await ethOracle.setLatestPrice(ethers.parseUnits("2305", 18));

  const { proxy: proxyStrategy } = await deployStrategyAAVEv3WstETH(
    owner.address,
    owner.address,
    serviceRegistryAddress,
    config.swapFeeTier,
    config.AAVEEModeCategory,
    proxyAdmin
  );

  const pStrategy = await ethers.getContractAt(
    "StrategyAAVEv3WstETH",
    await proxyStrategy.getAddress()
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
    strategy: pStrategy,
    oracle,
    settings: pSettings,
  };
}
