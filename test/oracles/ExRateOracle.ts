import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { feedIds } from '../../constants/pyth';
import { AbiCoder } from 'ethers';
import BaseConfig from '../../constants/network-deploy-config';
import { ClExRateOracle, NetworkConfig, OracleNamesEnum } from '../../constants/types';

describeif(network.name === 'hardhat')('Ratio Oracle', function () {
  async function deployFunction() {
    const [deployer] = await ethers.getSigners();
    const ChainLinkAggregatorMock = await ethers.getContractFactory('ChainLinkAggregatorMock');
    const ratioOracleCL = await ChainLinkAggregatorMock.deploy();
    await ratioOracleCL.waitForDeployment();

    await ratioOracleCL.setLatestPrice(1174056306294661112n);
    await ratioOracleCL.setDecimals(18);

    const PythMock = await ethers.getContractFactory('PythMock');
    const pyth = await PythMock.deploy();
    await pyth.waitForDeployment();

    const PythOracle = await ethers.getContractFactory('PythOracle');
    const pythOracle = await PythOracle.deploy(
      feedIds[OracleNamesEnum.ETH_USD],
      await pyth.getAddress(),
    );
    await pythOracle.waitForDeployment();

    const ChainLinkExRateOracle = await ethers.getContractFactory('ChainLinkExRateOracle');
    const oracle = await ChainLinkExRateOracle.deploy(
      await pythOracle.getAddress(),
      await ratioOracleCL.getAddress(),
    );

    const updateData = new AbiCoder().encode(
      ['tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))'],
      [
        [
          feedIds[OracleNamesEnum.ETH_USD],
          [335300, 0, -2, 1706801584],
          [335300, 0, -2, 1706801584],
        ],
      ],
    );
    await pyth.updatePriceFeeds([updateData], { value: 10 });

    await oracle.waitForDeployment();

    return { ratioOracleCL, pyth, oracle, pythOracle };
  }

  it('Pyth Oracle Tests - Get The Latest Price', async function () {
    const now = Math.floor(new Date().getTime() / 1000);
    const { oracle } = await loadFixture(deployFunction);
    expect(await oracle.getPrecision()).to.equal(10n ** 18n);

    const [price, lastUpdate] = await oracle.getLatestPrice();
    expect(price).to.equal(3936610795005998708536n);
    expect(lastUpdate).to.greaterThan(now);
  });

  it('Pyth Oracle Tests - Get The Safe Latest Price', async function () {
    const now = Math.floor(new Date().getTime() / 1000);
    const { oracle } = await loadFixture(deployFunction);
    expect(await oracle.getPrecision()).to.equal(10n ** 18n);

    const [price, lastUpdate] = await oracle.getSafeLatestPrice([180, 0]);
    expect(price).to.equal(3936610795005998708536n);
    expect(lastUpdate).to.greaterThan(now);
  });

  it('Pyth Oracle Tests - Max Age Fails', async function () {
    const { oracle } = await loadFixture(deployFunction);
    await time.increase(3600);
    await expect(
      oracle.getSafeLatestPrice([180, 0]),
      // @ts-ignore
    ).to.be.revertedWith('Old Price');
  });

  it('Pyth Oracle Tests - Ratio Ratio 6 Decimals', async function () {
    const { ratioOracleCL, pythOracle } = await loadFixture(deployFunction);
    await ratioOracleCL.setLatestPrice(1174056n);
    await ratioOracleCL.setDecimals(6);

    const ChainLinkExRateOracle = await ethers.getContractFactory('ChainLinkExRateOracle');
    const oracle = await ChainLinkExRateOracle.deploy(
      await pythOracle.getAddress(),
      await ratioOracleCL.getAddress(),
    );
    const [price] = await oracle.getLatestPrice();
    expect(price).to.equal(3936609768000000000000n);
  });

  it('Pyth Oracle Tests - Base Ratio 9 Decimals', async function () {
    const { ratioOracleCL, pythOracle } = await loadFixture(deployFunction);

    const OracleMock = await ethers.getContractFactory('OracleMock');
    const oracleMock = await OracleMock.deploy();
    await oracleMock.waitForDeployment();

    const ChainLinkExRateOracle = await ethers.getContractFactory('ChainLinkExRateOracle');
    const oracle = await ChainLinkExRateOracle.deploy(
      await oracleMock.getAddress(),
      await ratioOracleCL.getAddress(),
    );
    const [price] = await oracle.getLatestPrice();
    expect(price).to.equal(1326683626112967056n);
  });
});

describeif(network.name === 'base_devnet')('Ratio Oracle', function () {
  async function deployFunction() {
    const config: NetworkConfig = BaseConfig[network.name];
    const PythOracle = await ethers.getContractFactory('PythOracle');
    const pythOracle = await PythOracle.deploy(feedIds[OracleNamesEnum.ETH_USD], config.pyth);
    const ChainLinkExRateOracle = await ethers.getContractFactory('ChainLinkExRateOracle');

    const oracleConfig = config.oracles?.find((pair) => pair.name == 'wstETH/USD Oracle');
    const oracle = await ChainLinkExRateOracle.deploy(
      await pythOracle.getAddress(),
      (oracleConfig as ClExRateOracle).rateAggregator,
    );
    return { oracle };
  }

  it('Pyth Oracle Tests - Get the Priece', async function () {
    const now = Math.floor(new Date().getTime() / 1000);
    const { oracle } = await loadFixture(deployFunction);

    const [price] = await oracle.getLatestPrice();
    expect(price)
      .to.greaterThan(Number(3003618594496755974593n))
      .lessThan(Number(5003618594496755974593n));
  });
});
