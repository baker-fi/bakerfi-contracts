import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../../common';

describeif(network.name === 'hardhat')('Rebase Library', function () {
  async function deployFunction() {
    const RebaseLib = await ethers.getContractFactory('RebaseLibrary');
    const rebaseLib = await RebaseLib.deploy();
    await rebaseLib.waitForDeployment();
    const TestRebaseLibrary = await ethers.getContractFactory('RebaseLibraryTest');
    const testRebaseLib = await TestRebaseLibrary.deploy();
    await testRebaseLib.waitForDeployment();
    return testRebaseLib;
  }

  it('toBase - Add 10K Value - with uninitialized rebase - Emits 10K Shares', async () => {
    const rebaseLib = await loadFixture(deployFunction);
    expect(await rebaseLib.toBase([0n, 0n], 10000n, false)).to.equal(10000n);
  });

  it('toBase - Add 2500 Value With 20000$/10000 Shares', async () => {
    const rebaseLib = await loadFixture(deployFunction);
    expect(await rebaseLib.toBase([20000n, 10000n], 10000n, false)).to.equal(5000n);
  });

  it('toBase - Add 0 Value With 20000$/10000 Shares', async () => {
    const rebaseLib = await loadFixture(deployFunction);
    expect(await rebaseLib.toBase([20000n, 10000n], 0, false)).to.equal(0n);
  });

  it('toElastic - Add 1000 Shares Value With 0/0 Shares', async () => {
    const rebaseLib = await loadFixture(deployFunction);
    expect(await rebaseLib.toElastic([0n, 0n], 1000n, false)).to.equal(1000n);
  });

  it('toElastic - Add 10000 Shares Value With 20000$/10000 Shares', async () => {
    const rebaseLib = await loadFixture(deployFunction);
    expect(await rebaseLib.toElastic([20000n, 10000n], 10000n, false)).to.equal(20000n);
  });

  it('toElastic - Add 10000 Shares Value With 0/0 Shares', async () => {
    const rebaseLib = await loadFixture(deployFunction);
    expect(await rebaseLib.toElastic([20000n, 10000n], 100000n, false)).to.equal(200000n);
  });

  it('toElastic - Add 1Wei', async () => {
    const rebaseLib = await loadFixture(deployFunction);
    expect(await rebaseLib.toBase([0n, 0n], 1n, true)).to.equal(1n);
  });
});
