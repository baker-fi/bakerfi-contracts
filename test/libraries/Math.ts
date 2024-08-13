import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';

describeif(network.name === 'hardhat')('Math Library', function () {
  async function deployFunction() {
    const Math = await ethers.getContractFactory('MathLibraryWrapper');
    const math = await Math.deploy();
    await math.waitForDeployment();
    return math;
  }
  it('Very Small Fee', async function () {
    const math = await loadFixture(deployFunction);
    expect(await math.mulDivUp(1n, 1n * 10n ** 7n, 1n * 10n ** 9n)).to.equal(1n);
  });

  it('Small Fee - 1%', async function () {
    const math = await loadFixture(deployFunction);
    expect(
      await math.mulDivUp(
        1000,
        1n * 10n ** 7n, // 1%
        1n * 10n ** 9n,
      ),
    ).to.equal(10n);
  });

  it('Small Fee-  0.1%', async function () {
    const math = await loadFixture(deployFunction);
    expect(
      await math.mulDivUp(
        10000,
        1n * 10n ** 6n, // 0.1%
        1n * 10n ** 9n,
      ),
    ).to.equal(10n);
  });

  it('Small Fee - 0.01%', async function () {
    const math = await loadFixture(deployFunction);
    expect(
      await math.mulDivUp(
        10000000,
        1n * 10n ** 5n, // 0.01%
        1n * 10n ** 9n,
      ),
    ).to.equal(1000n);
  });

  it('10% on 100', async function () {
    const math = await loadFixture(deployFunction);
    expect(
      await math.mulDivUp(
        100,
        1n * 10n ** 8n, // 0.01%
        1n * 10n ** 9n,
      ),
    ).to.equal(10n);
  });

  it('x = 0 ', async function () {
    const math = await loadFixture(deployFunction);
    expect(
      await math.mulDivUp(
        0n,
        1n * 10n ** 5n, // 0.01%
        1000n,
      ),
    ).to.equal(0n);
  });
  it('y = 0 ', async function () {
    const math = await loadFixture(deployFunction);
    expect(
      await math.mulDivUp(
        10n,
        0n, // 0.01%
        1000n,
      ),
    ).to.equal(0n);
  });

  it('mulDivDown - Revert when division by 0 ', async function () {
    const math = await loadFixture(deployFunction);
    await expect(
      math.mulDivDown(
        1000n,
        500n, // 0.01%
        0n,
      ),
    ).to.be.revertedWithCustomError(math, 'InvalidDivDenominator');
  });

  it('mulDivDown - Modulo 0', async function () {
    const math = await loadFixture(deployFunction);
    expect(
      await math.mulDivDown(
        1000n,
        2n, // 0.01%
        500n,
      ),
    ).to.equal(4n);
  });

  it('mulDivDown - Modulo Not Zero', async function () {
    const math = await loadFixture(deployFunction);
    expect(
      await math.mulDivDown(
        1050n,
        2n, // 0.01%
        500n,
      ),
    ).to.equal(4n);
  });

  it('mulDivUp - Modulo Not Zero', async function () {
    const math = await loadFixture(deployFunction);
    expect(
      await math.mulDivUp(
        1050n,
        2n, // 0.01%
        500n,
      ),
    ).to.equal(5n);
  });
});
