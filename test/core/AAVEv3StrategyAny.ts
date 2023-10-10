import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import {
  deployServiceRegistry,
  deployCbETH,
  deploySwapper,
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

describeif(network.name === "hardhat")("AAVEv3StrategyAny", function () {
  async function deployFunction() {
    const networkName = network.name;
    const chainId = network.config.chainId;
    const config = BaseConfig[networkName];
    const [owner, otherAccount] = await ethers.getSigners();
    const CBETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
    const FLASH_LENDER_DEPOSIT = ethers.parseUnits("10000", 18);
    const AAVE_DEPOSIT = ethers.parseUnits("10000", 18);
    const serviceRegistry = await deployServiceRegistry(owner.address);
    const serviceRegistryAddress = await serviceRegistry.getAddress();
    const settings = await deploySettings(owner.address, serviceRegistry);
    const weth = await deployWETH(serviceRegistry);
    // 1. Deploy Flash Lender
    const flashLender = await deployFlashLender(
      serviceRegistry,
      weth,
      FLASH_LENDER_DEPOSIT
    );
    // 2. Deploy cbEBT
    const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);
    // 3. Deploy WETH -> cbETH Swapper
    const swapper = await deploySwapper(
      weth,
      cbETH,
      serviceRegistry,
      CBETH_MAX_SUPPLY
    );

    await swapper.setRatio(1130 * 1e6);
    // 4. Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(
      cbETH,
      weth,
      serviceRegistry,
      AAVE_DEPOSIT
    );
    // 5. Deploy cbETH/ETH Oracle
    const oracle = await deployOracleMock(serviceRegistry, "cbETH/ETH Oracle");
    const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");
    await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));
    await deployQuoterV2Mock(serviceRegistry);
    const strategy = await deployAAVEv3StrategyAny(
      owner.address,
      serviceRegistryAddress,
      "cbETH",
      "cbETH/ETH Oracle",
      config.AAVEEModeCategory
    );
    return {
      cbETH,
      weth,
      owner,
      otherAccount,
      serviceRegistry,
      swapper,
      aave3Pool,
      flashLender,
      strategy,
      oracle,
      settings,
      config,
    };
  }

  it("Test Deploy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    // Deploy 10 ETH
    expect(
      await strategy.deploy({
        value: ethers.parseUnits("10", 18),
      })
    ).to.changeEtherBalances([owner.address], [ethers.parseUnits("10", 18)]);
    expect(await strategy.getPosition()).to.deep.equal([
      45705032700000000000n,
      35740737730000000000n,
      781986919n,
    ]);
    expect(await strategy.totalAssets()).to.equal(9964294970000000000n);
  });

  it("Test Undeploy", async function () {
    const { owner, strategy } = await loadFixture(deployFunction);
    const receiver = "0x3762eFfD0BDDDb76688eb90F5fD0301AeeC90120";
    // Deploy 10TH ETH
    await strategy.deploy({
      value: ethers.parseUnits("10", 18),
    });
    expect(await strategy.getPosition()).to.deep.equal([
      45705032700000000000n,
      35740737730000000000n,
      781986919n,
    ]);
    expect(await strategy.totalAssets()).to.equal(9964294970000000000n);
    // Receive ~=5 ETH
    await strategy.undeploy(
      ethers.parseUnits("5", 18),
      "0x3762eFfD0BDDDb76688eb90F5fD0301AeeC90120"
    );

    const provider = ethers.provider;
    expect(await provider.getBalance(receiver)).to.equal(4982065590468138080n);
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
      strategy.connect(otherAccount).deploy({
        value: ethers.parseUnits("10", 18),
      })
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Undeploy Fail - No Permissions", async () => {
    const { owner, otherAccount, strategy } = await loadFixture(deployFunction);
    await expect(
      strategy.connect(otherAccount).deploy({
        value: ethers.parseUnits("10", 18),
      })
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Harvest Fail - No Permissions", async () => {
    const { owner, otherAccount, strategy } = await loadFixture(deployFunction);
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
      strategy.undeploy(ethers.parseUnits("10", 18), otherAccount.address)
    ).to.be.revertedWith("No Collateral margin to scale");
  });

  it("onFlashLoan - Invalid Flash Loan Sender",  async () => {
    const { oracle, otherAccount, aave3Pool, strategy } = await loadFixture(
      deployFunction
    );
    await expect(strategy.onFlashLoan(
      otherAccount.address,
      otherAccount.address,
      ethers.parseUnits("10", 18),
      0,
      "0x"
    )).to.be.revertedWith(
      "Invalid Flash loan sender"
    );
  });
  
  it("onFlashLoan - Invalid Flash Loan Asset", async () => {
    const { owner, serviceRegistry, otherAccount, aave3Pool, config} = await loadFixture(
      deployFunction
    );

    await serviceRegistry.unregisterService(
      ethers.keccak256(Buffer.from("FlashLender")),
    );
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("FlashLender")),
      owner.address
    );
    const strategy = await deployAAVEv3StrategyAny(
      owner.address,
      await serviceRegistry.getAddress(),
      "cbETH",
      "cbETH/ETH Oracle",
      config.AAVEEModeCategory
    );
    
    await expect(strategy.onFlashLoan(
      await strategy.getAddress(),
      otherAccount.address,
      ethers.parseUnits("10", 18),
      0,
      "0x"
    )).to.be.revertedWith(
      "Invalid Flash Loan Asset"
    );
  });

});
