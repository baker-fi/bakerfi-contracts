
import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import {
    deployServiceRegistry,
    deployWETH,
    deployCbETH,
    deployQuoterV2Mock,
    deployVaultZap,
  } from '../../scripts/common';
import { AAVEv3Market, NetworkConfig, StrategyImplementation } from '../../constants/types';
import BaseConfig from '../../constants/network-deploy-config';

//describeif(network.name === 'hardhat'
describe.only('Vault Zap', function () {

    it('Can Zap in cbETH', async function () {
        const { vault, zap, cbETH } = await deployFunction();
        expect(await zap.canZap(await vault.getAddress(), await cbETH.getAddress())).to.be.true;
    });

    it('Owner can remove Zap for cbETH', async function () {
        const { zap, vault, cbETH } = await deployFunction();
        await zap.removeZap(await vault.getAddress(), await cbETH.getAddress());
        expect(await zap.canZap(await vault.getAddress(), await cbETH.getAddress())).to.be.false;
    });

    it('Only owner can add zap', async function () {
        const { zap, vault, cbETH, owner, otherAccount } = await deployFunction();
        await expect(
            zap.connect(otherAccount).addZap(await vault.getAddress(), await cbETH.getAddress(), [100])
        ).to.be.revertedWith('Ownable: caller is not the owner');
        expect(await zap.canZap(await vault.getAddress(), await cbETH.getAddress())).to.be.true;
    });

    it('Only owner can remove zap', async function () {
        const { zap, vault, cbETH, owner, otherAccount } = await deployFunction();
        await expect(
            zap.connect(otherAccount).removeZap(await vault.getAddress(), await cbETH.getAddress())
        ).to.be.revertedWith('Ownable: caller is not the owner');
        expect(await zap.canZap(await vault.getAddress(), await cbETH.getAddress())).to.be.true;
    });

    it('getZap returns correct information', async function () {
        const { zap, vault, cbETH } = await deployFunction();
        const zapInfo = await zap.getZap(await vault.getAddress(), await cbETH.getAddress());
        expect(zapInfo.univ3FeeTier).to.equal(100); // Assuming the fee tier is set to 100 for stETH
    });
});


/**
 * Deploy Test Function
 */
async function deployFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const CBETH_MAX_SUPPLY = ethers.parseUnits('1000000000', 18);

    const serviceRegistry = await deployServiceRegistry(owner.address);
    const weth = await deployWETH(serviceRegistry);
    const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

    const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
    const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
    await proxyAdmin.waitForDeployment();

    // Deploy cbETH -> ETH Uniswap Router
    const UniRouter = await ethers.getContractFactory('UniV3RouterMock');
    const router = await UniRouter.deploy(await weth.getAddress(), await cbETH.getAddress());
    await router.setPrice(8665 * 1e5);

    // Deposit ETH on Uniswap Router
    await weth.deposit?.call('', { value: ethers.parseUnits('10000', 18) });
    await weth.transfer(await router.getAddress(), ethers.parseUnits('10000', 18));

    // Deposit cbETH on Uniswap Router
    await cbETH.transfer(await router.getAddress(), ethers.parseUnits('10000', 18));

    // Deploy QuoterV2 Mock
    const quoter = await deployQuoterV2Mock();

    // Deploy ERC4626VaultMock
    const ERC4626VaultMock = await ethers.getContractFactory('ERC4626VaultMock');
    const vault = await ERC4626VaultMock.deploy(
        await weth.getAddress()
    );
    await vault.waitForDeployment();

    const { proxy: proxyZap } = await deployVaultZap(
        owner.address,
        await router.getAddress(),
        await quoter.getAddress(),
        proxyAdmin,
      );

    const pZap = await ethers.getContractAt('VaultZap', await proxyZap.getAddress());

    await pZap.addZap(await vault.getAddress(), await cbETH.getAddress(), [100]);

    return {
      cbETH,
      weth,
      owner,
      otherAccount,
      vault,
      router,
      quoter,
      zap: pZap,
    };
  }