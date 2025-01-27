import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { network, ethers } from 'hardhat';
import { describeif } from '../../common';
import BakerFiContracts from '../../../constants/contracts';
import NetworkConfig from '../../../constants/network-deploy-config';
import { StrategyImplementation } from '../../../constants/types';
describeif(
  network.name === 'ethereum_devnet' ||
    network.name === 'optimism_devnet' ||
    network.name === 'arbitrum_devnet' ||
    network.name === 'base_devnet',
)('BakerFi - Production', function () {
  it('Vault Settings', async function () {
    const { vault, owner, strategy } = await loadFixture(deployFunction);

    expect(await vault.getFeeReceiver()).to.equal('0x5B9D9E25a00A88290F35EE726490852e4DF083e3');
    expect(await vault.getWithdrawalFee()).to.equal(0);
    expect(await vault.getMaxDeposit()).to.equal(0);
    expect(await vault.getPerformanceFee()).to.equal(100000000);
    expect(await vault.isAccountEnabled(owner.address)).to.equal(true);
    expect(await vault.paused()).to.equal(false);
    expect(await vault.totalSupply()).to.greaterThan(0);
    expect(await vault.balanceOf('0xA26bA0573fb2Ab593AD0F47Ec2b1f70887767bEa')).to.greaterThan(0);
    expect(await vault.totalAssets()).to.greaterThan(0);
    expect(await strategy.getOracle()).to.equal('0x3c08799faAfD825698317b34b50286e8d21bDe65');
    expect(await strategy.getNrLoops()).to.equal(20);
    expect(await strategy.getMaxSlippage()).to.equal(5000000);
    expect(await strategy.getLoanToValue()).to.equal(870000000);
    expect(await strategy.getMaxLoanToValue()).to.equal(900000000);
  });

  it('Deposit 1 ETH', async function () {
    const { vault, owner } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('1', 18);
    expect(await vault.totalAssets()).to.greaterThan(0);
    await vault.depositNative(owner.address, {
      value: depositAmount,
    });
    expect(await vault.balanceOf(owner.address)).to.greaterThan(0);
  });

  it('Withdraw 1 ETH', async function () {
    const { vault, owner } = await loadFixture(deployFunction);
    const depositAmount = ethers.parseUnits('1', 18);
    await vault.withdrawNative(depositAmount);
    expect(await vault.balanceOf(owner.address)).to.equal(0);
  });
});

async function deployFunction() {
  const [owner, otherAccount, anotherAccount] = await ethers.getSigners();
  const networkName = network.name;

  const contracts = BakerFiContracts[networkName][StrategyImplementation.MORPHO_BLUE_WSTETH_ETH];
  const networkConfig = NetworkConfig[networkName];

  const vault = await ethers.getContractAt('Vault', contracts.vaultProxy);
  const strategy = await ethers.getContractAt(
    'StrategyLeverageMorphoBlue',
    contracts.strategyProxy,
  );
  const weth = await ethers.getContractAt('IWETH', networkConfig.weth);
  const wstETH = await ethers.getContractAt('IERC20', networkConfig.wstETH);

  return {
    vault,
    strategy,
    weth,
    wstETH,
    owner,
  };
}
