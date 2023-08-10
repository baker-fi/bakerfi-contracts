import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  deployBaseServices,
  deployVault,
} from "../common";


describe.only("Vault", function () {

    async function deployFunction() {

        const [owner, otherAccount] = await ethers.getSigners();
        const { erc20, weth, serviceRegistry } = await deployBaseServices(owner.address);
    
        const serviceRegistryAddress = await serviceRegistry.getAddress();

        const Leverage = await ethers.getContractFactory("Leverage");
        const levarage = await Leverage.deploy();
        await levarage.waitForDeployment();
        const vault = await deployVault(owner.address, serviceRegistryAddress,await levarage.getAddress() );

        // 1. Deploy Flash Lender 
        const flashLender = await deployFlashLender(serviceRegistry, weth);
        
        // 2. Deploy stETH 
        const { stETH, STETH_MAX_SUPPLY } = await deployStEth(serviceRegistry, owner);

        // 3. Deploy wstETH
        const wstETH  = await deployWStEth(serviceRegistry, await stETH.getAddress());
   
        // 4. Deploy WETH -> stETH Swapper
        const { swapperAddress, swapper } = await deploySwapper(weth, stETH, serviceRegistry, STETH_MAX_SUPPLY);

        // 5. Deploy AAVEv3 Mock Pool
        const aaveV3PoolMock = await deployAaveV3(wstETH, weth, serviceRegistry, swapperAddress);
        
        // 6. Deploy wstETH/ETH Oracle 
        await deployWSETHToETHOracle(serviceRegistry);

        return {
          erc20,
          stETH,
          weth,
          owner,
          otherAccount,
          serviceRegistry,
          vault,
          swapper,
          aave3Pool: aaveV3PoolMock, 
          flashLender,
          wstETH,
        };
      }
    
      it.skip("Test Deposit", async function (){ 
        
        const {
            owner,
            vault,
        } = await loadFixture(deployFunction);
        
        const depositAmount =  ethers.parseUnits("10", 18);

        await vault.deposit(owner.address, {
            value: depositAmount,
        });

        expect(await vault.symbol()).to.equal("mateETH");
        expect(await vault.name()).to.equal("laundromat ETH");        
        expect(await vault.totalAssets()).to.equal(9124061032737616160n);
        expect(await vault.balanceOf(owner.address)).to.equal(9124061032737616160n);
        expect(await vault.totalSupply()).to.equal(9124061032737616160n);
        expect(await vault.tokenPerETh()).to.equal(ethers.parseUnits("1", 18));
      });

    it("Test Withdraw", async function (){ 
        
        const {
            owner,
            vault,
        } = await loadFixture(deployFunction);

        const depositAmount =  ethers.parseUnits("10", 18);

        await vault.deposit(owner.address, {
            value: depositAmount,
        });

        await vault.withdraw( ethers.parseUnits("1", 18), owner.address);
        expect(await vault.balanceOf(owner.address)).to.equal(9124061032737616160n);
        expect(await vault.totalSupply()).to.equal(9124061032737616160n);
        expect(await vault.totalAssets()).to.equal(9124061032737616160n);
    })

})


async function deployAaveV3(stETH, weth, serviceRegistry, swapperAddress: string) {
    const AaveV3PoolMock = await ethers.getContractFactory("AaveV3PoolMock");
    const aaveV3PoolMock = await AaveV3PoolMock.deploy(
        await stETH.getAddress(),
        await weth.getAddress()
    );
    await aaveV3PoolMock.waitForDeployment();
    const aaveV3PoolAddress = await aaveV3PoolMock.getAddress();
    serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("AAVE_V3")),
        aaveV3PoolAddress
    );
    // Deposit 10000 ETH on the pool to be borrowed
    await weth.deposit?.call("", { value: ethers.parseUnits("10000", 18) });
    weth.transfer(aaveV3PoolAddress, ethers.parseUnits("10000", 18));
    return aaveV3PoolMock;
}

async function deploySwapper(weth, stETH, serviceRegistry, STETH_MAX_SUPPLY: bigint) {
    const SwapHandlerMock = await ethers.getContractFactory("SwapHandlerMock");
    const swapper = await SwapHandlerMock.deploy(
        await weth.getAddress(),
        await stETH.getAddress()
    );
    await swapper.waitForDeployment();
    const swapperAddress = await swapper.getAddress();
    serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("SwapHandler")),
        swapperAddress
    );
    await stETH.transfer(swapperAddress, STETH_MAX_SUPPLY);
    return { swapperAddress, swapper };
}

async function deployStEth(serviceRegistry, owner) {
    const STETHMock = await ethers.getContractFactory("ERC20Mock");
    const STETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
    const STETH_TOKEN_NAME = "Staked ETH";
    const STETH_TOKEN_SYMBOL = "stETH";

    const stETH = await STETHMock.deploy(
        STETH_TOKEN_NAME,
        STETH_TOKEN_SYMBOL,
        STETH_MAX_SUPPLY,
        owner
    );
    serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("stETH")),
        stETH.getAddress()
    );
    await stETH.waitForDeployment();
    return { stETH, STETH_MAX_SUPPLY };
}

async function deployWStEth(serviceRegistry, stETHAddress) {
    const WSTETHMock = await ethers.getContractFactory("WstETHMock");

    const wstETH = await WSTETHMock.deploy(
        stETHAddress,
    );
    serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("wstETH")),
        wstETH.getAddress()
    );
    await wstETH.waitForDeployment();
    return wstETH;
}



async function deployWSETHToETHOracle(serviceRegistry) {
    const WSETHToETH = await ethers.getContractFactory("WstETHToETHOracleMock");
    const oracle = await WSETHToETH.deploy();
    await oracle.waitForDeployment();
    serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("wstETH/ETH Oracle")),
        oracle.getAddress()
    );
    return oracle;
}


async function deployFlashLender(serviceRegistry, weth) {
    const MockFlashLender = await ethers.getContractFactory("MockFlashLender");
    const flashLender = await MockFlashLender.deploy(await weth.getAddress());
    await flashLender.waitForDeployment();
    const flashLenderAddress = await flashLender.getAddress();
    serviceRegistry.registerService(
        ethers.keccak256(Buffer.from("FlashLender")),
        flashLenderAddress
    );
    
    // Deposit on Flash Lender 10000 WETH 
    await weth.deposit?.call("", { value: ethers.parseUnits("100000", 18) });
    weth.transfer(flashLender, ethers.parseUnits("100000", 18));
    return flashLender;
}
