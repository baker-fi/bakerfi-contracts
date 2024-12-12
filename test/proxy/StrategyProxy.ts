import '@nomicfoundation/hardhat-ethers';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import {
  deployVaultRegistry,
  deployCbETH,
  deployAaveV3,
  deployFlashLender,
  deployOracleMock,
  deployWETH,
} from '../../scripts/common';

import BaseConfig from '../../constants/network-deploy-config';
import { AAVEv3Market, NetworkConfig, StrategyImplementation } from '../../constants/types';

describeif(network.name === 'hardhat')('Strategy Proxy', function () {
  async function deployFunction() {
    const networkName = network.name;
    const config: NetworkConfig = BaseConfig[networkName];
    const [owner, otherAccount] = await ethers.getSigners();
    const CBETH_MAX_SUPPLY = ethers.parseUnits('1000000000', 18);
    const FLASH_LENDER_DEPOSIT = ethers.parseUnits('10000', 18);
    const AAVE_DEPOSIT = ethers.parseUnits('10000', 18);
    const serviceRegistry = await deployVaultRegistry(owner.address);
    // Deploy Proxy Admin
    const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
    const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
    await proxyAdmin.waitForDeployment();
    const weth = await deployWETH(serviceRegistry);

    const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
    // 1. Deploy Flash Lender
    const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
    // 2. Deploy cbEBT
    const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

    // Deploy cbETH -> ETH Uniswap Router
    const UniRouter = await ethers.getContractFactory('UniV3RouterMock');
    const uniRouter = await UniRouter.deploy(await weth.getAddress(), await cbETH.getAddress());

    await uniRouter.setPrice(885 * 1e6);
    // Register Uniswap Router
    await serviceRegistry.registerService(
      ethers.keccak256(Buffer.from('Uniswap Router')),
      await uniRouter.getAddress(),
    );

    // Deposit ETH on Uniswap Mock Router
    await weth.deposit?.call('', { value: ethers.parseUnits('10000', 18) });
    await weth.transfer(await uniRouter.getAddress(), ethers.parseUnits('10000', 18));

    // Deposit cbETH on Uniswap Mock Router
    await cbETH.transfer(await uniRouter.getAddress(), ethers.parseUnits('10000', 18));

    // Deploy AAVEv3 Mock Pool
    const aave3Pool = await deployAaveV3(cbETH, weth, serviceRegistry, AAVE_DEPOSIT);
    // Deploy cbETH/ETH Oracle
    const oracle = await deployOracleMock();

    const StrategyLeverageAAVEv3 = await ethers.getContractFactory('StrategyLeverageAAVEv3');
    const strategyLogic = await StrategyLeverageAAVEv3.deploy();

    const proxyDeployment = await BakerFiProxy.deploy(
      await strategyLogic.getAddress(),
      await proxyAdmin.getAddress(),
      StrategyLeverageAAVEv3.interface.encodeFunctionData('initialize', [
        owner.address,
        owner.address,
        await cbETH.getAddress(),
        await weth.getAddress(),
        await oracle.getAddress(),
        await flashLender.getAddress(),
        await aave3Pool.getAddress(),
        (config.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH] as AAVEv3Market)
          .AAVEEModeCategory,
      ]),
    );
    await proxyDeployment.waitForDeployment();
    const strategyProxy = await StrategyLeverageAAVEv3.attach(await proxyDeployment.getAddress());
    return {
      owner,
      otherAccount,
      strategyProxy,
    };
  }

  it('Strategy Initialization', async function () {
    const { strategyProxy } = await loadFixture(deployFunction);
    expect(await strategyProxy.getPosition([0, 0])).to.deep.equal([0n, 0n, 0n]);
    expect(await strategyProxy.totalAssets()).to.equal(0);
  });
});
