import "@nomicfoundation/hardhat-ethers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";
import {
  deployServiceRegistry,
  deployVault,
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
import { time } from "@nomicfoundation/hardhat-network-helpers";

/**
 * Unit Tests for BakerFi Vault with a regular AAVEv3Strategy
 */

describeif(network.name === "hardhat")("BakerFi Vault For L2s", function () {

  it("Deposit with no Flash Loan Fees", async function () {
    const { owner, vault, weth, aave3Pool, strategy, cbETH, flashLender } =
      await loadFixture(deployFunction);
    await flashLender.setFlashLoanFee(0);
    const tx = await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });
    await expect(tx).to.changeEtherBalances(
      [owner.address],
      [ethers.parseUnits("-10", 18)]
    );
    await expect(tx)
      .to.emit(aave3Pool, "Supply")
      .withArgs(
        await cbETH.getAddress(),
        await strategy.getAddress(),
        await strategy.getAddress(),
        39603410838016000000n,
        0
      );
    await expect(tx)
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
      .withArgs(9962113816060668112n);

    await expect(
      vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    )
      .to.emit(strategy, "StrategyAmountUpdate")
      .withArgs(19924227632121336224n);
    await expect(
      vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    )
      .to.emit(strategy, "StrategyAmountUpdate")
      .withArgs(29886341448182004336n);
  });

  it("convertToShares - 1ETH", async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    expect(await vault.convertToShares(ethers.parseUnits("1", 18))).to.equal(
      1000000000000000000n
    );
  });

  it("convertToAssets - 1e18 brETH", async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });
    expect(await vault.convertToAssets(ethers.parseUnits("1", 18))).to.equal(
      1000000000000000000n
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

  it("tokenPerETH - No Balance", async function () {
    const { owner, vault, strategy } = await loadFixture(deployFunction);
    expect(await vault.tokenPerETH()).to.equal(ethers.parseUnits("1", 18));
  });



  it("Deposit Fails when the prices are outdated",async ()=> { 

    const { settings, vault, owner, strategy} = await loadFixture(deployFunction);

    // Price Max Age 6 Min
    await settings.setPriceMaxAge(360);
    
    // advance time by one hour and mine a new block
    await time.increase(3600);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    await expect(
      vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    ).to.be.revertedWithCustomError(strategy, "OraclePriceOutdated");
  
  });

  it("Deposit Fails when the prices are outdated",async ()=> { 

    const { settings, vault, owner, strategy} = await loadFixture(deployFunction);

    // Price Max Age 6 Min
    await settings.setPriceMaxAge(360);
    
    // advance time by one hour and mine a new block
    await time.increase(3600);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    await expect(
      vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    ).to.be.revertedWithCustomError(strategy, "OraclePriceOutdated");
  
  });
  
  it("Deposit Success with old prices",async ()=> { 

    const { settings, vault, owner} = await loadFixture(deployFunction);

    // Price Max Age 10 Hours
    await settings.setPriceMaxAge(360);
    const tx =  await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });


    // advance time by one hour and mine a new block
    await time.increase(3600);


    await expect(tx)
      .to.changeEtherBalances([owner.address], [ethers.parseUnits("-10", 18)]);   
  })



  it("convertToShares should return with outdated prices",async ()=> { 

    const { settings, vault, owner} = await loadFixture(deployFunction);

    await settings.setPriceMaxAge(360);
    
    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    // advance time by one hour and mine a new block
    await time.increase(3600);

    expect(await vault.convertToShares(ethers.parseUnits("1", 18))).to.equal(
      1000000000000000000n
    );
  })

  it("convertToAssets should return with outdated prices",async ()=> { 

    const { settings, vault, owner} = await loadFixture(deployFunction);

    // Price Max Age 10 Hours
    await settings.setPriceMaxAge(360);
   
    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });

    // advance time by one hour and mine a new block
    await time.increase(3600);

    expect(await vault.convertToAssets(ethers.parseUnits("1", 18))).to.equal(
      1000000000000000000n
    );
  })

  it("tokenPerETH should return with outdated prices",async ()=> { 

    const { settings, vault, owner} = await loadFixture(deployFunction);
  
    // Price Max Age 10 Hours
    await settings.setPriceMaxAge(360);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });
   
    // advance time by one hour and mine a new block
    await time.increase(3600);
    
    expect(await vault.tokenPerETH()).to.equal(
      1000000000000000000n
    );
  })

  it("totalAssets should return with outdated prices",async ()=> { 

    const { settings, vault, owner} = await loadFixture(deployFunction);
  
    // Price Max Age 10 Hours
    await settings.setPriceMaxAge(360);

    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });
   
    // advance time by one hour and mine a new block
    await time.increase(3600);
    
    expect(await vault.totalAssets()).to.equal(
      9962113816060668112n
    );
  })


  it("Pause and Unpause",async ()=> { 
    const { vault, owner} = await loadFixture(deployFunction);
    expect(await vault.paused()).to.equal(
      false
    );;
    await vault.pause();
    expect(await vault.paused()).to.equal(
      true
    );;
    await vault.unpause();    
    expect(await vault.paused()).to.equal(
      false
    );;
    
    await vault.deposit(owner.address, {
      value: ethers.parseUnits("10", 18),
    });
    expect(await vault.totalAssets()).to.greaterThan(
      0
    );

  });

  it("Withdraw Fails when vault is paused",async ()=> { 
    const { vault, owner} = await loadFixture(deployFunction);

    await vault.pause();
    await expect(
      vault.withdraw(1)
    ).to.be.revertedWith("Pausable: paused");
  })

  it("Deposit Fails when vault is paused",async ()=> { 
    const { vault, owner} = await loadFixture(deployFunction);
    await vault.pause();
    await expect(
      vault.deposit(owner.address, {
        value: ethers.parseUnits("10", 18),
      })
    ).to.be.revertedWith("Pausable: paused");
  })

  it("Rebalance Fails when vault is paused",async ()=> { 
    const { vault, owner} = await loadFixture(deployFunction);
    await vault.pause();
    await expect(
        vault.rebalance()
    ).to.be.revertedWith("Pausable: paused");
  })



  it("Transfer ETH to contract should fail",async ()=> { 
    const { vault, owner} = await loadFixture(deployFunction);
    // Create a transaction object
    let tx = {
      to: await vault.getAddress(),
      // Convert currency unit from ether to wei
      value: ethers.parseUnits("10", 18),
    }
    await expect(
      owner.sendTransaction(tx)
    ).to.be.revertedWithCustomError(vault, "ETHTransferNotAllowed");
  })
});

/**
 * Deploy Test Function
 */
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
  const BakerFiProxyAdmin = await ethers.getContractFactory(
    "BakerFiProxyAdmin"
  );
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

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

  await uniRouter.setPrice(8665 * 1e5);

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

  const { proxy: settingsProxy } = await deploySettings(
    owner.address,
    serviceRegistry,
    proxyAdmin
  );
  const pSettings = await ethers.getContractAt(
    "Settings",
    await settingsProxy.getAddress()
  );

  // 5. Deploy AAVEv3 Mock Pool
  const aave3Pool = await deployAaveV3(
    cbETH,
    weth,
    serviceRegistry,
    AAVE_DEPOSIT
  );

  // 6. Deploy wstETH/ETH Oracle
  const oracle = await deployOracleMock(serviceRegistry, "cbETH/USD Oracle");
  const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");

  await oracle.setLatestPrice(ethers.parseUnits("2660", 18));
  await ethOracle.setLatestPrice(ethers.parseUnits("2305", 18));

  await deployQuoterV2Mock(serviceRegistry);

  const { proxy: proxyStrategy } = await deployAAVEv3StrategyAny(
    owner.address,
    serviceRegistryAddress,
    "cbETH",
    "cbETH/USD Oracle",
    config.swapFeeTier,
    config.AAVEEModeCategory,
    proxyAdmin
  );

  const pStrategy = await ethers.getContractAt(
    "StrategyAAVEv3",
    await proxyStrategy.getAddress()
  );

  const { proxy } = await deployVault(
    owner.address,
    "Bread ETH",
    "brETH",
    serviceRegistryAddress,
    await proxyStrategy.getAddress(),
    proxyAdmin
  );

  await pStrategy.transferOwnership(await proxy.getAddress());
  const pVault = await ethers.getContractAt("Vault", await proxy.getAddress());
  return {
    cbETH,
    weth,
    owner,
    otherAccount,
    anotherAccount,
    serviceRegistry,
    vault: pVault,
    aave3Pool,
    flashLender,
    uniRouter,
    oracle,
    strategy: pStrategy,
    settings: pSettings,
  };
}
