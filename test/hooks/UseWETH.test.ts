import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import { deployVaultRegistry, deployWETH } from '../../scripts/common';

describeif(network.name === 'hardhat')('UseWETH', function () {
  it('should unwrap ETH', async () => {
    const { useWETHMock, owner, weth } = await deployFunction();
    await owner.sendTransaction({
      to: await useWETHMock.getAddress(),
      value: ethers.parseUnits('1', 18),
    });
    await useWETHMock.test__wrapETH(ethers.parseUnits('1', 18));
    await useWETHMock.test__unwrapETH(ethers.parseUnits('1', 18));
    expect(await ethers.provider.getBalance(await useWETHMock.getAddress())).to.equal(
      ethers.parseUnits('1', 18),
    );
    expect(await weth.balanceOf(await useWETHMock.getAddress())).to.equal(0);
  });

  it('Should wrap ETH', async () => {
    const { useWETHMock, owner, weth } = await deployFunction();

    await owner.sendTransaction({
      to: await useWETHMock.getAddress(),
      value: ethers.parseUnits('1', 18),
    });
    expect(await ethers.provider.getBalance(await useWETHMock.getAddress())).to.equal(
      ethers.parseUnits('1', 18),
    );

    await useWETHMock.test__wrapETH(ethers.parseUnits('1', 18));
    expect(await ethers.provider.getBalance(await useWETHMock.getAddress())).to.equal(0);
    expect(await weth.balanceOf(await useWETHMock.getAddress())).to.equal(
      ethers.parseUnits('1', 18),
    );
  });
});

async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();

  const serviceRegistry = await deployVaultRegistry(owner.address);
  const weth = await deployWETH(serviceRegistry);

  const UseWETHMock = await ethers.getContractFactory('UseWETHMock');
  const useWETHMock = await UseWETHMock.deploy();
  await useWETHMock.waitForDeployment();
  await useWETHMock.initialize(await weth.getAddress());

  // Deposit ETH on WETH to get WETH
  await weth.deposit?.call('', { value: ethers.parseUnits('10000', 18) });

  return { owner, otherAccount, useWETHMock, weth };
}
