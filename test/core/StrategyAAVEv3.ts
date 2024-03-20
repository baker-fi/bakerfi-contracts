import "@nomicfoundation/hardhat-ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  deployServiceRegistry,
  deployCbETH,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deploySettings,
  deployAAVEv3StrategyAny,
  deployQuoterV2Mock,
} from "../../scripts/common";

import { describeif } from "../common";
import BaseConfig from "../../scripts/config";

/**
 * StrategyAAVEv3 Unit Tests
 */
describeif(network.name === "hardhat")("Strategy AAVE v3 L2", function () {
  it("Test Deploy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    // Deploy 10 ETH
    expect(
      await strategy.deploy({
        value: ethers.parseUnits("10", 18),
      })
    ).to.changeEtherBalances([owner.address], [ethers.parseUnits("10", 18)]);
    expect(await strategy.getPosition()).to.deep.equal([
      45702851552764668112n,
      35740737736704000000n,
      782024239n,
    ]);
    expect(await strategy.deployed()).to.equal(9962113816060668112n);
  });

  it("Test Undeploy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    const receiver = owner.address;
    // Deploy 10TH ETH
    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });
    expect(await strategy.getPosition()).to.deep.equal([
      45702851552764668112n,
      35740737736704000000n,
      782024239n,
    ]);
    expect(await strategy.deployed()).to.equal(9962113816060668112n);
    // Receive ~=5 ETH
    await expect(
      strategy.undeploy(ethers.parseUnits("5", 18))
    ).to.changeEtherBalances([owner.address], [4983156389718359984n]);
  });

  it("Deploy Fail - Zero Value", async () => {
    const { owner, otherAccount, strategy } = await loadFixture(deployFunction);

    await expect(
      strategy.deploy({
        value: 0,
      })
    ).to.be.revertedWith("No Zero deposit Allowed");
  });

  it("Deploy Fail - No Permissions", async () => {
    const { owner, otherAccount, strategy } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      strategy.connect(otherAccount).deploy({
        value: ethers.parseUnits("10", 18),
      })
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Undeploy Fail - No Permissions", async () => {
    const { owner, otherAccount, strategy } = await loadFixture(deployFunction);

    strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });
    await expect(
      // @ts-expect-error
      strategy.connect(otherAccount).undeploy(ethers.parseUnits("5", 18))
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Harvest Fail - No Permissions", async () => {
    const { owner, otherAccount, strategy } = await loadFixture(deployFunction);
    // @ts-expect-error
    await expect(strategy.connect(otherAccount).harvest()).to.be.revertedWith(
      "Ownable: caller is not the owner"
    );
  });

  it("Undeploy Fail - Uncollateralized", async () => {
    const { oracle, otherAccount, aave3Pool, strategy } = await loadFixture(
      deployFunction
    );

    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });
    await aave3Pool.setCollateralPerEth(1130 * 1e6 * 0.1);
    await oracle.setLatestPrice(1130 * 1e6 * 0.1);
    await expect(
      strategy.undeploy(ethers.parseUnits("10", 18))
    ).to.be.revertedWith("No Collateral margin to scale");
  });

  it("onFlashLoan - Invalid Flash Loan Sender", async () => {
    const { oracle, otherAccount, aave3Pool, strategy } = await loadFixture(
      deployFunction
    );
    await expect(
      strategy.onFlashLoan(
        otherAccount.address,
        otherAccount.address,
        ethers.parseUnits("10", 18),
        0,
        "0x"
      )
    ).to.be.revertedWith("Invalid Flash loan sender");
  });

  it("onFlashLoan - Invalid Flash Loan Asset", async () => {
    const { owner, serviceRegistry, otherAccount, aave3Pool, config } =
      await loadFixture(deployFunction);
    const BakerFiProxyAdmin = await ethers.getContractFactory(
      "BakerFiProxyAdmin"
    );
    const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
    await proxyAdmin.waitForDeployment();
    await serviceRegistry.unregisterService(
      ethers.keccak256(Buffer.from("FlashLender"))
    );
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("FlashLender")),
      owner.address
    );
    const { proxy: proxyStrategy } = await deployAAVEv3StrategyAny(
      owner.address,
      await serviceRegistry.getAddress(),
      "cbETH",
      "cbETH/ETH Oracle",
      config.swapFeeTier,
      config.AAVEEModeCategory,
      proxyAdmin
    );
    const pStrategy = await ethers.getContractAt(
      "StrategyAAVEv3",
      await proxyStrategy.getAddress()
    );

    await expect(
      pStrategy.onFlashLoan(
        await proxyStrategy.getAddress(),
        otherAccount.address,
        ethers.parseUnits("10", 18),
        0,
        "0x"
      )
    ).to.be.revertedWith("Invalid Flash Loan Asset");
  });

  it("OnFlashLoan - Attacker", async () => {
    const { weth, serviceRegistry, strategy } = await loadFixture(
      deployFunction
    );

    const BorrowerAttacker = await ethers.getContractFactory(
      "BorrowerAttacker"
    );
    const attacker = await BorrowerAttacker.deploy();
    await attacker.initialize(await serviceRegistry.getAddress());

    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });

    await expect(
      attacker.flashme(await weth.getAddress(), ethers.parseUnits("1", 18))
    ).to.be.revertedWith("Invalid Flash loan sender");
  });

  it("Rebalance - Fails with outdated prices", async () => {
    const { weth, serviceRegistry, settings, strategy, oracle, ethOracle } =
      await loadFixture(deployFunction);
    // Deposit 10 ETH
    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });
    await settings.setOraclePriceMaxAge(60);
    // advance time by one hour and mine a new block
    await time.increase(3600);
    await expect(strategy.harvest()).to.be.revertedWith(
      "Oracle Price is outdated"
    );
  });

  it("Rebalance - Success when the price is updated", async () => {
    const { weth, serviceRegistry, settings, strategy, oracle, ethOracle } =
      await loadFixture(deployFunction);
    // Deposit 10 ETH
    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });
    await settings.setOraclePriceMaxAge(4800);
    // advance time by one hour and mine a new block
    await time.increase(3600);
    await strategy.harvest();
    expect(true).to.be.equal(true);
  });
});

/**
 * Deploy Test Function
 */
async function deployFunction() {
  const networkName = network.name;
  const config = BaseConfig[networkName];
  const [owner, otherAccount] = await ethers.getSigners();
  const CBETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
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

  const { proxy: settingsProxy } = await deploySettings(
    owner.address,
    serviceRegistry,
    proxyAdmin
  );
  const pSettings = await ethers.getContractAt(
    "Settings",
    await settingsProxy.getAddress()
  );

  // 1. Deploy Flash Lender
  const flashLender = await deployFlashLender(
    serviceRegistry,
    weth,
    FLASH_LENDER_DEPOSIT
  );
  // 2. Deploy cbEBT
  const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

  // Deploy cbETH -> ETH Uniswap Router
  const UniRouter = await ethers.getContractFactory("UniV3RouterMock");
  const uniRouter = await UniRouter.deploy(
    await weth.getAddress(),
    await cbETH.getAddress()
  );

  await uniRouter.setPrice(8665 * 1e5);
  // Register Uniswap Router
  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Uniswap Router")),
    await uniRouter.getAddress()
  );

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

  // Deploy AAVEv3 Mock Pool
  const aave3Pool = await deployAaveV3(
    cbETH,
    weth,
    serviceRegistry,
    AAVE_DEPOSIT
  );

  const oracle = await deployOracleMock(serviceRegistry, "cbETH/ETH Oracle");
  const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");

  await oracle.setLatestPrice(ethers.parseUnits("2660", 18));
  await ethOracle.setLatestPrice(ethers.parseUnits("2305", 18));

  await deployQuoterV2Mock(serviceRegistry);

  const { proxy: proxyStrategy } = await deployAAVEv3StrategyAny(
    owner.address,
    serviceRegistryAddress,
    "cbETH",
    "cbETH/ETH Oracle",
    config.swapFeeTier,
    config.AAVEEModeCategory,
    proxyAdmin
  );
  const pStrategy = await ethers.getContractAt(
    "StrategyAAVEv3",
    await proxyStrategy.getAddress()
  );

  await serviceRegistry.registerService(
    ethers.keccak256(Buffer.from("Strategy")),
    await proxyStrategy.getAddress()
  );
  return {
    cbETH,
    weth,
    owner,
    otherAccount,
    serviceRegistry,
    aave3Pool,
    flashLender,
    strategy: pStrategy,
    oracle,
    ethOracle,
    settings: pSettings,
    config,
  };
}
