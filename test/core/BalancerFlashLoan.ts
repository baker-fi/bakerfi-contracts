import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import BaseConfig from "../../scripts/config";
import { describeif } from "../common";
import {
  deployServiceRegistry,
  deployBalancerFL,
  deployMockERC20,
  deployFlashBorrowerMock,
} from "../../scripts/common";

describeif(network.name === "base_devnet")("Balancer Flash Loan", function () {
  async function deployFunction() {
    // ETH Token
    const [owner, otherAccount] = await ethers.getSigners();
    const serviceRegistry = await deployServiceRegistry(owner.address);
    const networkName = network.name;
    const config = BaseConfig[networkName];

    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Balancer Vault")),
      config.balancerVault
    );

    const weth = await ethers.getContractAt("IWETH", config.weth);
    const cbETH = await ethers.getContractAt("IERC20", config.cbETH);

    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("cbETH")),
      config.cbETH
    );

    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("WETH")),
      config.weth
    );

    const fl = await deployBalancerFL(serviceRegistry);
    const borrower = await deployFlashBorrowerMock(serviceRegistry);

    // Add the ETH/CBV
    return { owner, otherAccount, weth, cbETH, config, fl, borrower };
  }

  it("Borrow from Balancer Vault", async function () {
    const { weth, owner, cbETH, fl, config, borrower } = await loadFixture(
      deployFunction
    );
    await borrower.flashme(config.weth, ethers.parseUnits("10", 18));
    expect(await borrower.borrowed(config.weth)).to.equal(
      10000000000000000000n
    );
  });
});

describeif(network.name === "hardhat")("Balancer Flash Loan", function () {
  async function deployFunction() {
    // ETH Token
    const [owner, otherAccount] = await ethers.getSigners();
    const serviceRegistry = await deployServiceRegistry(owner.address);
    const networkName = network.name;
    const config = BaseConfig[networkName];

    const WETH_SYMBOL = "WETH";
    const WETH_NAME = "Wrapped ETH";
    const WETH_MAX_SUPPLY = ethers.parseUnits("330000000", 18);

    const weth = await deployMockERC20(
      WETH_NAME,
      WETH_SYMBOL,
      WETH_MAX_SUPPLY,
      owner.address
    );
    const BalancerVault = await ethers.getContractFactory("BalancerVaultMock");
    const balancerVault = await BalancerVault.deploy(await weth.getAddress());
    await balancerVault.waitForDeployment();

    // Balancer Vault 100 ETH
    await weth.transfer(
      await balancerVault.getAddress(),
      ethers.parseUnits("100", 18)
    );

    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from("Balancer Vault")),
      await balancerVault.getAddress()
    );

    // Balancer Flash Loan Adapter
    const fl = await deployBalancerFL(serviceRegistry);

    const borrower = await deployFlashBorrowerMock(serviceRegistry);
    console.log("1");
    return { owner, otherAccount, weth, borrower, config, fl };
  }

  it("Borrow 10ETH", async () => {
    const { weth, owner, fl, config, borrower } = await loadFixture(
      deployFunction
    );
    await borrower.flashme(
      await weth.getAddress(),
      ethers.parseUnits("10", 18)
    );
    expect(await borrower.borrowed(await weth.getAddress())).to.equal(
      ethers.parseUnits("10", 18)
    );
  });

  it("Get Max Loan 10ETH", async () => {
    const { weth, owner, fl, config, borrower } = await loadFixture(
      deployFunction
    );

    expect(await fl.maxFlashLoan(weth)).to.equal(ethers.parseUnits("100", 18));
  });

  it("No Enough Balance to borrow", async () => {
    const { weth, owner, fl, config, borrower } = await loadFixture(
      deployFunction
    );
    await expect(
      borrower.flashme(await weth.getAddress(), ethers.parseUnits("10000", 18))
    ).to.be.revertedWith("Not Enough Balance");
  });

  it("Flash Fee 0", async () => {
    const { weth, owner, fl, config, borrower } = await loadFixture(
      deployFunction
    );
    expect(await fl.flashFee(await weth.getAddress(), ethers.parseUnits("10", 18))).to.equal(0n);
  })
});
