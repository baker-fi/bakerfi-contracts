import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import networkDeployConfig from '../../constants/network-deploy-config';
import { deployMockERC20 } from '../../scripts/common';

describeif(network.name === 'ethereum_devnet')('UseUnifiedSwapper - Prod', function () {
  async function deployProdFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const chainConfig = networkDeployConfig[network.name];
    const UseUnifiedSwapperMock = await ethers.getContractFactory('UseUnifiedSwapperMock');
    const useUnifiedSwapperMock = await UseUnifiedSwapperMock.deploy();
    await useUnifiedSwapperMock.waitForDeployment();
    const weth = await ethers.getContractAt('IWETH', chainConfig.weth);
    const usdc = await ethers.getContractAt('IERC20', chainConfig.usdc);

    // Deposit 10 ETH to the WETH contract
    await weth.deposit({ value: 10n * 10n ** 18n });
    return {
      owner,
      otherAccount,
      useUnifiedSwapper: useUnifiedSwapperMock,
      weth,
      usdc,
      chainConfig,
    };
  }

  it('Swap 1WETH- USDT on Uniswap V3', async function () {
    const { useUnifiedSwapper, weth, usdc, chainConfig } = await deployProdFunction();

    await weth.transfer(useUnifiedSwapper.target, 10n * 10n ** 18n);
    // Add Route
    await useUnifiedSwapper.enableRoute(await weth.getAddress(), await usdc.getAddress(), {
      provider: 1, // UNIV3
      router: chainConfig.uniswapRouter02,
      uniV3Tier: 100, // swap fee tier
      tickSpacing: 0,
    });

    const swapParams = {
      underlyingIn: await weth.getAddress(),
      underlyingOut: await usdc.getAddress(),
      mode: 0,
      amountIn: 1n * 10n ** 18n,
      amountOut: 0n,
      feeTier: 0,
      payload: '0x',
    };

    await expect(useUnifiedSwapper.test__swap(swapParams)).to.changeTokenBalance(
      weth,
      await useUnifiedSwapper.getAddress(),
      ethers.parseEther('-1'),
    );
  });

  it('Swap 1WETH - USDT on Uniswap V2', async function () {
    const { useUnifiedSwapper, weth, usdc, chainConfig } = await deployProdFunction();

    await useUnifiedSwapper.enableRoute(await weth.getAddress(), await usdc.getAddress(), {
      provider: 2, // UNIV2
      router: chainConfig.uniswapV2Router02,
      uniV3Tier: 0, // swap fee tier
      tickSpacing: 0,
    });
    const swapParams = {
      underlyingIn: await weth.getAddress(),
      underlyingOut: await usdc.getAddress(),
      mode: 0,
      amountIn: 1n * 10n ** 18n,
      amountOut: 0n,
      feeTier: 0,
      payload: '0x',
    };
    await weth.transfer(useUnifiedSwapper.target, 10n * 10n ** 18n);
    await expect(useUnifiedSwapper.test__swap(swapParams)).to.changeTokenBalance(
      weth,
      await useUnifiedSwapper.getAddress(),
      ethers.parseEther('-1'),
    );
  });
});

describeif(network.name === 'base_devnet')('UseUnifiedSwapper - Prod', function () {
  async function deployProdFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const chainConfig = networkDeployConfig[network.name];
    const UseUnifiedSwapperMock = await ethers.getContractFactory('UseUnifiedSwapperMock');
    const useUnifiedSwapperMock = await UseUnifiedSwapperMock.deploy();
    await useUnifiedSwapperMock.waitForDeployment();
    const weth = await ethers.getContractAt('IWETH', chainConfig.weth);
    const wstETH = await ethers.getContractAt('IERC20', chainConfig.wstETH);

    // Deposit 10 ETH to the WETH contract
    await weth.deposit({ value: 10n * 10n ** 18n });
    return {
      owner,
      otherAccount,
      useUnifiedSwapper: useUnifiedSwapperMock,
      weth,
      wstETH,
      chainConfig,
    };
  }

  it('Swap 1WETH- USDT on Aero Drome', async function () {
    const { useUnifiedSwapper, weth, wstETH } = await deployProdFunction();

    await weth.transfer(useUnifiedSwapper.target, 10n * 10n ** 18n);
    // Add Route
    await useUnifiedSwapper.enableRoute(await weth.getAddress(), await wstETH.getAddress(), {
      provider: 3, // AERO
      router: '0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5',
      uniV3Tier: 0, // swap fee tier
      tickSpacing: 1,
    });

    const swapParams = {
      underlyingIn: await weth.getAddress(),
      underlyingOut: await wstETH.getAddress(),
      mode: 0,
      amountIn: 1n * 10n ** 18n,
      amountOut: 0n,
      feeTier: 0,
      payload: '0x',
    };

    await expect(useUnifiedSwapper.test__swap(swapParams)).to.changeTokenBalance(
      weth,
      await useUnifiedSwapper.getAddress(),
      ethers.parseEther('-1'),
    );
  });
});

/**
 *
 *  Hardhat Tests
 *
 */
describeif(network.name === 'hardhat')('UseUnifiedSwapper', function () {
  async function deployProdFunction() {
    const [owner, otherAccount] = await ethers.getSigners();
    const UseUnifiedSwapperMock = await ethers.getContractFactory('UseUnifiedSwapperMock');
    const useUnifiedSwapperMock = await UseUnifiedSwapperMock.deploy();
    await useUnifiedSwapperMock.waitForDeployment();
    const usdc = await deployMockERC20(
      'USDC',
      'USDC',
      // 10M USDC
      10000000n * 10n ** 18n,
      owner.address,
    );
    const weth = await deployMockERC20(
      'WETH',
      'WETH',
      // 10M ETH
      10000000n * 10n ** 18n,
      owner.address,
    );

    return { owner, otherAccount, useUnifiedSwapper: useUnifiedSwapperMock, weth, usdc };
  }

  it('Add Route', async function () {
    const { useUnifiedSwapper, weth, usdc } = await deployProdFunction();

    await useUnifiedSwapper.enableRoute(await weth.getAddress(), await usdc.getAddress(), {
      provider: 1, // UNIV3
      router: await useUnifiedSwapper.getAddress(),
      uniV3Tier: 100, // swap fee tier
      tickSpacing: 0,
    });

    expect(
      await useUnifiedSwapper.isRouteEnabled(await weth.getAddress(), await usdc.getAddress()),
    ).to.be.true;

    expect(
      await useUnifiedSwapper.isRouteEnabled(await usdc.getAddress(), await weth.getAddress()),
    ).to.be.true;
  });

  it('Remove Route', async function () {
    const { useUnifiedSwapper, weth, usdc } = await deployProdFunction();

    await useUnifiedSwapper.enableRoute(await weth.getAddress(), await usdc.getAddress(), {
      provider: 1, // UNIV3
      router: await useUnifiedSwapper.getAddress(),
      uniV3Tier: 100, // swap fee tier
      tickSpacing: 0,
    });
    expect(
      await useUnifiedSwapper.isRouteEnabled(await weth.getAddress(), await usdc.getAddress()),
    ).to.be.true;

    await useUnifiedSwapper.disableRoute(await weth.getAddress(), await usdc.getAddress());

    expect(
      await useUnifiedSwapper.isRouteEnabled(await weth.getAddress(), await usdc.getAddress()),
    ).to.be.false;
  });

  it('Only owner can add/remove routes', async function () {
    const { useUnifiedSwapper, otherAccount, weth, usdc } = await deployProdFunction();
    await expect(
      useUnifiedSwapper
        .connect(otherAccount)
        .enableRoute(await weth.getAddress(), await usdc.getAddress(), {
          provider: 1, // UNIV3
          router: await useUnifiedSwapper.getAddress(),
          uniV3Tier: 100, // swap fee tier
          tickSpacing: 0,
        }),
    ).to.be.reverted;

    await expect(
      useUnifiedSwapper
        .connect(otherAccount)
        .disableRoute(await weth.getAddress(), await usdc.getAddress()),
    ).to.be.reverted;
  });

  it('No Route', async function () {
    const { useUnifiedSwapper, weth, usdc } = await deployProdFunction();
    const swapParams = {
      underlyingIn: await weth.getAddress(),
      underlyingOut: await usdc.getAddress(),
      mode: 0,
      amountIn: 1n * 10n ** 18n,
      amountOut: 0n,
      feeTier: 0,
      payload: '0x',
    };
    await weth.transfer(useUnifiedSwapper.target, 10n * 10n ** 18n);
    await expect(useUnifiedSwapper.test__swap(swapParams)).to.be.revertedWithCustomError(
      useUnifiedSwapper,
      'RouteNotAuthorized',
    );
  });
});
