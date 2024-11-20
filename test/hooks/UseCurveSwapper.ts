import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import networkDeployConfig from '../../constants/network-deploy-config';
import { AbiCoder } from 'ethers';

describeif(network.name === 'ethereum_devnet')('UseCurveSwapper', function () {
  it('Swap 1ETH - Exact Input for 1.0 stETH', async function () {
    const { useCurveSwapperMock, ethAddress, stEth } = await deployFunction();

    const data = new AbiCoder().encode(
      ['uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
      [
        0, // i
        1, // j
        1, // swap_type
        1, // pool_type
        '0xdc24316b9ae028f1497c275eb9192a3ea0f67022', // pool
      ],
    );
    const depositAmount = ethers.parseEther('1');
    const swapParams = {
      underlyingIn: ethAddress,
      underlyingOut: await stEth.getAddress(),
      mode: 0,
      amountIn: depositAmount,
      amountOut: 0,
      feeTier: 0,
      payload: data,
    };

    await useCurveSwapperMock.test__swap(swapParams, {
      value: depositAmount,
    });
    const balanceAfter = await stEth.balanceOf(await useCurveSwapperMock.getAddress());
    expect(BigInt(balanceAfter)).to.be.greaterThan(9n * 10n ** 17n);
  });

  it('Swap 1ETH - Exact Output  for 1.0 stETH', async function () {
    const { useCurveSwapperMock, ethAddress, stEth } = await deployFunction();
    const data = new AbiCoder().encode(
      ['uint256', 'uint256', 'uint256', 'uint256', 'uint256'],
      [
        0, // i
        1, // j
        1, // swap_type
        1, // pool_type
        '0xdc24316b9ae028f1497c275eb9192a3ea0f67022', // pool
      ],
    );

    const swapParams = {
      underlyingIn: ethAddress,
      underlyingOut: await stEth.getAddress(),
      mode: 1,
      amountIn: 0,
      amountOut: ethers.parseEther('1'),
      feeTier: 0,
      payload: data,
    };
    await useCurveSwapperMock.test__swap(swapParams, {
      value: ethers.parseEther('1'),
    });
    const balanceAfter = await stEth.balanceOf(await useCurveSwapperMock.getAddress());
    expect(BigInt(balanceAfter)).to.be.greaterThan(1n * 10n ** 18n);
  });
});

async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();

  const chainConfig = networkDeployConfig[network.name];
  const UseCurveSwapperMock = await ethers.getContractFactory('UseCurveSwapperMock');

  const useCurveSwapperMock = await UseCurveSwapperMock.deploy(chainConfig.curveRouterNG);
  await useCurveSwapperMock.waitForDeployment();
  const ethAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
  const stEth = await ethers.getContractAt('IERC20', chainConfig.stETH);

  return { owner, otherAccount, useCurveSwapperMock, ethAddress, stEth };
}
