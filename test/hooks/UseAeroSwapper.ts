import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import networkDeployConfig from '../../constants/network-deploy-config';
import { AbiCoder } from 'ethers';

describeif(network.name === 'base_devnet')('UseAeroSwapper', function () {
  it('Swap 1ETH - Exact Input', async function () {
    const { useAeroSwapper, weth, wstETH } = await deployFunction();
    const data = new AbiCoder().encode(
      ['uint24'],
      [
        1, // i
      ],
    );
    const swapParams = {
      underlyingIn: await weth.getAddress(),
      underlyingOut: await wstETH.getAddress(),
      mode: 0,
      amountIn: ethers.parseEther('1'),
      amountOut: 0,
      feeTier: 0,
      payload: data,
    };
    // Deposit 2 ETH
    await weth.deposit({
      value: ethers.parseEther('2'),
    });

    await weth.transfer(await useAeroSwapper.getAddress(), ethers.parseEther('2'));

    await useAeroSwapper.test_allowRouterSpend(weth, ethers.parseEther('2'));

    const balanceBefore = await wstETH.balanceOf(await useAeroSwapper.getAddress());
    await expect(useAeroSwapper.test__swap(swapParams)).to.changeTokenBalance(
      weth,
      await useAeroSwapper.getAddress(),
      ethers.parseEther('-1'),
    );

    const balanceAfter = await wstETH.balanceOf(await useAeroSwapper.getAddress());
    await expect(balanceAfter - balanceBefore).to.be.greaterThan(1000n * 10n ** 6n);
  });

  it('Swap 1WSTETH - Exact Output', async function () {
    const { useAeroSwapper, weth, wstETH } = await deployFunction();
    const data = new AbiCoder().encode(
      ['uint24'],
      [
        1, // i
      ],
    );
    const swapParams = {
      underlyingIn: await weth.getAddress(),
      underlyingOut: await wstETH.getAddress(),
      mode: 1,
      amountIn: ethers.parseEther('2'),
      amountOut: ethers.parseEther('1'),
      feeTier: 0,
      payload: data,
    };
    // Deposit 2 ETH
    await weth.deposit({
      value: ethers.parseEther('2'),
    });

    await weth.transfer(await useAeroSwapper.getAddress(), ethers.parseEther('2'));
    await useAeroSwapper.test_allowRouterSpend(weth, ethers.parseEther('2'));

    await expect(useAeroSwapper.test__swap(swapParams)).to.changeTokenBalance(
      wstETH,
      await useAeroSwapper.getAddress(),
      ethers.parseEther('1'),
    );
  });
});

async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();

  const chainConfig = networkDeployConfig[network.name];
  const UseAeroSwapperMock = await ethers.getContractFactory('UseAeroSwapperMock');
  const useAeroSwapperMock = await UseAeroSwapperMock.deploy(
    '0xBE6D8f0d05cC4be24d5167a3eF062215bE6D18a5',
  );
  await useAeroSwapperMock.waitForDeployment();

  const weth = await ethers.getContractAt('IWETH', chainConfig.weth);
  const wstETH = await ethers.getContractAt('IERC20', chainConfig.wstETH);

  return { owner, otherAccount, useAeroSwapper: useAeroSwapperMock, weth, wstETH };
}
