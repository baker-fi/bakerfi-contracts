import "@nomicfoundation/hardhat-ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";
import {
  deployServiceRegistry,
  deployCbETH,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
  deploySettings,
  deployQuoterV2Mock,
} from "../../scripts/common";

import BaseConfig from "../../scripts/config";

describeif(network.name === "hardhat")("Strategy Proxy", function () {
  async function deployFunction() {
    const networkName = network.name;
    const config = BaseConfig[networkName];
    const [owner, otherAccount] = await ethers.getSigners();
    const CBETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
    const FLASH_LENDER_DEPOSIT = ethers.parseUnits("10000", 18);
    const AAVE_DEPOSIT = ethers.parseUnits("10000", 18);
    const serviceRegistry = await deployServiceRegistry(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
    // Deploy Proxy Admin
    const BakerFiProxyAdmin = await ethers.getContractFactory(
      "BakerFiProxyAdmin"
    );
    const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
    await proxyAdmin.waitForDeployment();
    const weth = await deployWETH(serviceRegistry);

    const BakerFiProxy = await ethers.getContractFactory("BakerFiProxy");
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

    // 2. Deploy cbEBT
    const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

    // Deploy cbETH -> ETH Uniswap Router
    const UniRouter = await ethers.getContractFactory("UniV3RouterMock");
    const uniRouter = await UniRouter.deploy(
      await weth.getAddress(),
      await cbETH.getAddress()
    );

    await uniRouter.setPrice(885 * 1e6);
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
    await deployAaveV3(cbETH, weth, serviceRegistry, AAVE_DEPOSIT);
    // Deploy cbETH/ETH Oracle
    const oracle = await deployOracleMock(serviceRegistry, "cbETH/ETH Oracle");
    const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");
    await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));
    await deployQuoterV2Mock(serviceRegistry);

    const StrategyAAVEv3 = await ethers.getContractFactory("StrategyAAVEv3");
    const strategyLogic = await StrategyAAVEv3.deploy();

    const proxyDeployment = await BakerFiProxy.deploy(
      await strategyLogic.getAddress(),
      await proxyAdmin.getAddress(),
      StrategyAAVEv3.interface.encodeFunctionData("initialize", [
        owner.address,
        serviceRegistryAddress,
        ethers.keccak256(Buffer.from("cbETH")),
        ethers.keccak256(Buffer.from("cbETH/ETH Oracle")),
        config.swapFeeTier,
        config.AAVEEModeCategory,
      ])
    );
    await proxyDeployment.waitForDeployment();
    const strategyProxy = await StrategyAAVEv3.attach(
      await proxyDeployment.getAddress()
    );
    return {
      owner,
      otherAccount,
      strategyProxy,
      settings: pSettings,
    };
  }

  it("Strategy Initialization", async function () {
    const { strategyProxy } = await loadFixture(deployFunction);
    expect(await strategyProxy.getPosition()).to.deep.equal([0n, 0n, 0n]);
    expect(await strategyProxy.deployed(0)).to.equal(0);
  })

  
});
