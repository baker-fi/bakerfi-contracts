import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { feedIds } from '../../constants/pyth';
import BaseConfig from '../../constants/network-deploy-config';
import { NetworkConfig, OracleNamesEnum } from '../../constants/types';

describeif(network.name === 'ethereum_devnet')('Custom Exchange Rate Oracle', function () {
  async function deployFunction() {
    const config: NetworkConfig = BaseConfig[network.name];
    const PythOracle = await ethers.getContractFactory('PythOracle');
    const pythOracle = await PythOracle.deploy(feedIds[OracleNamesEnum.ETH_USD], config.pyth);
    const CustomExRateOracle = await ethers.getContractFactory('CustomExRateOracle');
    const oracle = await CustomExRateOracle.deploy(
      await pythOracle.getAddress(),
      [config.wstETH, '0x035faf82'], // stEthPerToken
      18,
    );
    return { oracle };
  }

  it('Get the Ratio and the price', async function () {
    const { oracle } = await loadFixture(deployFunction);
    const ratio = await oracle.getRatio();
    // @ts-ignore
    expect(ratio.price).to.greaterThan(ethers.parseUnits('1', 18));
    const price = await oracle.getLatestPrice();
    expect(price.price)
      // @ts-ignore
      .to.greaterThan(ethers.parseUnits('1000', 18))
      // @ts-ignore
      .lessThan(ethers.parseUnits('100000', 18));
  });
});
