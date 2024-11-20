import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import networkDeployConfig from '../../constants/network-deploy-config';

describeif(network.name === 'ethereum_devnet')('UseUniV2Swapper', function () {
  it('Swap 1ETH - Exact Input', async function () {
    const { owner, useUniV2Swapper, weth, usdt } = await deployFunction();

    const swapParams = {
      underlyingIn: await weth.getAddress(),
      underlyingOut: await usdt.getAddress(),
      mode: 0,
      amountIn: ethers.parseEther('1'),
      amountOut: 0,
      feeTier: 0,
      payload: '0x',
    };
    // Deposit 2 ETH
    await weth.deposit({
      value: ethers.parseEther('2'),
    });

    await weth.transfer(await useUniV2Swapper.getAddress(), ethers.parseEther('2'));

    const balanceBefore = await usdt.balanceOf(await useUniV2Swapper.getAddress());
    await expect(useUniV2Swapper.test__swap(swapParams)).to.changeTokenBalance(
      weth,
      await useUniV2Swapper.getAddress(),
      ethers.parseEther('-1'),
    );

    const balanceAfter = await usdt.balanceOf(await useUniV2Swapper.getAddress());
    await expect(balanceAfter - balanceBefore).to.be.greaterThan(1000n * 10n ** 6n);
  });

  it('Swap 1000USDT - Exact Output', async function () {
    const { useUniV2Swapper, weth, usdt } = await deployFunction();

    const swapParams = {
      underlyingIn: await weth.getAddress(),
      underlyingOut: await usdt.getAddress(),
      mode: 1,
      amountIn: 0,
      amountOut: 1000n * 10n ** 6n,
      feeTier: 0,
      payload: '0x',
    };
    // Deposit 2 ETH
    await weth.deposit({
      value: ethers.parseEther('2'),
    });

    await weth.transfer(await useUniV2Swapper.getAddress(), ethers.parseEther('2'));

    await expect(useUniV2Swapper.test__swap(swapParams)).to.changeTokenBalance(
      usdt,
      await useUniV2Swapper.getAddress(),
      1000n * 10n ** 6n,
    );

    const balanceAfter = await weth.balanceOf(await useUniV2Swapper.getAddress());
    await expect(2n * 10n ** 18n - balanceAfter)
      .to.be.lessThan(1n * 10n ** 18n)
      .greaterThan(0n);
  });
});

async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();

  const chainConfig = networkDeployConfig[network.name];
  const UseUniV2SwapperMock = await ethers.getContractFactory('UseUniV2SwapperMock');
  const useUniV2SwapperMock = await UseUniV2SwapperMock.deploy(chainConfig.uniswapV2Router02);
  await useUniV2SwapperMock.waitForDeployment();

  const weth = await ethers.getContractAt('IWETH', chainConfig.weth);
  const usdt = await ethers.getContractAt('IERC20', chainConfig.usdt);

  return { owner, otherAccount, useUniV2Swapper: useUniV2SwapperMock, weth, usdt };
}
