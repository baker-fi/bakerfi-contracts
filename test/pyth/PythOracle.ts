import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';

import { AbiCoder } from 'ethers';
import { feedIds } from '../../constants/pyth';
import { OracleNamesEnum } from '../../constants/types';

describeif(network.name === 'hardhat')('Pyth Oracle Tests', function () {
  async function deployFunction() {
    const PythMock = await ethers.getContractFactory('PythMock');
    const pythMock = await PythMock.deploy();
    await pythMock.waitForDeployment();

    const PythOracle = await ethers.getContractFactory('PythOracle');
    const pythOracle = await PythOracle.deploy(
      feedIds[OracleNamesEnum.WSTETH_USD],
      await pythMock.getAddress(),
    );
    await pythOracle.waitForDeployment();
    return { pythMock, pythOracle };
  }

  it('Pyth Oracle Tests - Decimal Price', async function () {
    const { pythMock, pythOracle } = await loadFixture(deployFunction);
    expect(await pythOracle.getPrecision()).to.equal(10n ** 18n);

    const updateData = new AbiCoder().encode(
      ['tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))'],
      [
        [
          feedIds[OracleNamesEnum.WSTETH_USD],
          [120000, 0, -2, 1706801584],
          [120000, 0, -2, 1706801584],
        ],
      ],
    );
    await pythMock.updatePriceFeeds([updateData], { value: 10 });
    const [price] = await pythOracle.getLatestPrice();
    expect(price).to.equal(ethers.parseUnits('1200', 18));
  });

  it('Pyth Oracle Tests - Fractional Price', async function () {
    const { pythMock, pythOracle } = await loadFixture(deployFunction);
    expect(await pythOracle.getPrecision()).to.equal(10n ** 18n);
    const updateData = new AbiCoder().encode(
      ['tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))'],
      [[feedIds[OracleNamesEnum.WSTETH_USD], [12, 0, 2, 1706801584], [12, 0, 2, 1706801584]]],
    );

    await pythMock.updatePriceFeeds([updateData], { value: 10 });
    const [price] = await pythOracle.getLatestPrice();
    expect(price).to.equal(ethers.parseUnits('1200', 18));
  });

  it('Pyth Oracle Tests - Update and Get the Latest Price', async function () {
    const { pythOracle } = await loadFixture(deployFunction);
    const updateData = new AbiCoder().encode(
      ['tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))'],
      [[feedIds[OracleNamesEnum.WSTETH_USD], [1200, 0, 2, 1706801584], [1200, 0, 2, 1706801584]]],
    );
    await pythOracle.getAndUpdatePrice(updateData, {
      value: 10,
    });
    const [price] = await pythOracle.getLatestPrice();
    expect(price).to.equal(ethers.parseUnits('120000', 18));
  });

  it('Pyth Oracle Tests - Test Max Confidence', async function () {
    const { pythOracle } = await loadFixture(deployFunction);
    const updateData = new AbiCoder().encode(
      ['tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))'],
      [[feedIds[OracleNamesEnum.WSTETH_USD], [1200, 10, 2, 1706801584], [1200, 10, 2, 1706801584]]],
    );
    await pythOracle.getAndUpdatePrice(updateData, {
      value: 10,
    });
    // 10% Max Confidence
    const [price] = await pythOracle.getSafeLatestPrice([180, 1 * 10 ** 8]);
    expect(price).to.equal(ethers.parseUnits('120000', 18));
  });

  it('Pyth Oracle Tests - Max Confidence fails', async function () {
    const { pythOracle } = await loadFixture(deployFunction);
    const updateData = new AbiCoder().encode(
      ['tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))'],
      [
        [
          feedIds[OracleNamesEnum.WSTETH_USD],
          [1200, 140, 2, 1706801584],
          [1200, 140, 2, 1706801584],
        ],
      ],
    );
    await pythOracle.getAndUpdatePrice(updateData, {
      value: 10,
    });
    // 10% Max Confidence
    await expect(pythOracle.getSafeLatestPrice([180, 1 * 10 ** 8])).to.be.revertedWithCustomError(
      pythOracle,
      'InvalidPriceAnswer',
    );
  });

  it('Pyth Oracle Tests - Max Exponent', async function () {
    const { pythMock, pythOracle } = await loadFixture(deployFunction);
    const updateData = new AbiCoder().encode(
      ['tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))'],
      [[feedIds[OracleNamesEnum.WSTETH_USD], [1200, 0, 30, 1706801584], [1200, 0, 30, 1706801584]]],
    );
    await pythMock.updatePriceFeeds([updateData], { value: 10 });
    await expect(pythOracle.getSafeLatestPrice([180, 1 * 10 ** 8])).to.be.revertedWithCustomError(
      pythOracle,
      'InvalidPriceAnswer',
    );
  });

  it.skip('Pyth Oracle Tests - Revert when calling getSafeLatestPrice with max age =0 ', async function () {
    const { pythOracle } = await loadFixture(deployFunction);
    await expect(pythOracle.getSafeLatestPrice([0, 1 * 10 ** 8])).to.be.revertedWithCustomError(
      pythOracle,
      'InvalidPriceOption',
    );
  });
});
