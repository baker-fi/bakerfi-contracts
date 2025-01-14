import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import { deployMockERC20 } from '../../scripts/common';

describeif(network.name === 'hardhat')('UseTokenActions', function () {
  it('test__pullToken', async function () {
    const { useTokenActions, bkr, owner } = await deployFunction();
    await bkr.approve(await useTokenActions.getAddress(), ethers.parseUnits('100', 18));
    expect(
      await useTokenActions.test__pullToken(await bkr.getAddress(), ethers.parseUnits('100', 18)),
    ).to.changeTokenBalances(
      bkr,
      [owner.address, await useTokenActions.getAddress()],
      [-ethers.parseUnits('100', 18), ethers.parseUnits('100', 18)],
    );
  });

  it('test__pullTokenFrom', async function () {
    const { useTokenActions, otherAccount, bkr } = await deployFunction();
    await bkr.transfer(otherAccount.address, ethers.parseUnits('100', 18));
    await bkr
      .connect(otherAccount)
      .approve(await useTokenActions.getAddress(), ethers.parseUnits('100', 18));
    await expect(
      useTokenActions.test__pullTokenFrom(
        await bkr.getAddress(),
        otherAccount.address,
        ethers.parseUnits('100', 18),
      ),
    ).to.changeTokenBalances(
      bkr,
      [otherAccount.address, await useTokenActions.getAddress()],
      [-ethers.parseUnits('100', 18), ethers.parseUnits('100', 18)],
    );
  });

  it('test__pushToken', async function () {
    const { useTokenActions, bkr, otherAccount } = await deployFunction();
    await bkr.transfer(await useTokenActions.getAddress(), ethers.parseUnits('100', 18));
    expect(
      await useTokenActions.test__pushToken(
        await bkr.getAddress(),
        otherAccount.address,
        ethers.parseUnits('100', 18),
      ),
    ).to.changeTokenBalances(
      bkr,
      [await useTokenActions.getAddress(), otherAccount.address],
      [ethers.parseUnits('-100', 18), ethers.parseUnits('100', 18)],
    );
  });

  it('test__pushTokenFrom', async function () {
    const { useTokenActions, bkr, owner, otherAccount } = await deployFunction();
    await bkr.approve(await useTokenActions.getAddress(), ethers.parseUnits('100', 18));

    expect(
      await useTokenActions.test__pushTokenFrom(
        await bkr.getAddress(),
        owner.address,
        otherAccount.address,
        ethers.parseUnits('100', 18),
      ),
    ).to.changeTokenBalances(
      bkr,
      [owner.address, otherAccount.address],
      [-ethers.parseUnits('100', 18), ethers.parseUnits('100', 18)],
    );
  });

  it('test__sweepTokens', async function () {
    const { useTokenActions, bkr, otherAccount } = await deployFunction();
    const useTokenActionsAddress = await useTokenActions.getAddress();
    await bkr.transfer(useTokenActionsAddress, ethers.parseUnits('100', 18));
    await useTokenActions.test__sweepTokens(await bkr.getAddress(), otherAccount.address);
    expect(await bkr.balanceOf(otherAccount.address)).to.equal(ethers.parseUnits('100', 18));
  });

  it('test__sweepNative', async function () {
    const { useTokenActions, owner, otherAccount } = await deployFunction();
    const useTokenActionsAddress = await useTokenActions.getAddress();
    // Send 10 000 ETH to the useTokenActions contract
    await owner.sendTransaction({
      to: useTokenActionsAddress,
      value: ethers.parseEther('10'),
    });
    expect(await ethers.provider.getBalance(useTokenActionsAddress)).to.equal(
      ethers.parseEther('10'),
    );
    await expect(useTokenActions.test__sweepNative(otherAccount.address)).to.changeEtherBalances(
      [useTokenActionsAddress, otherAccount.address],
      [ethers.parseEther('-10'), ethers.parseEther('10')],
    );
  });
});

async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();

  const bkr = await deployMockERC20(
    'BakerFi Token',
    'BKR',
    ethers.parseUnits('500000000', 18),
    owner.address,
  );

  const UseTokenActionsMock = await ethers.getContractFactory('UseTokenActionsMock');
  const useTokenActions = await UseTokenActionsMock.deploy();
  await useTokenActions.waitForDeployment();

  return { owner, otherAccount, bkr, useTokenActions };
}
