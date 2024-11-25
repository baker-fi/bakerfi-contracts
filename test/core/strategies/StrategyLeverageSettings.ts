import '@nomicfoundation/hardhat-ethers';
import { describeif } from '../../common';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';

/**
 * StrategyLeverageSettings Contract Unit Tests
 */
describeif(network.name === 'hardhat')('StrategyLeverageSettings', function () {
  it('StrategyLeverageSettings Defaults', async function () {
    const { settings, owner, otherAccount } = await loadFixture(deployFunction);
    expect(await settings.owner()).to.equal(owner.address);
    expect(await settings.governor()).to.equal(otherAccount.address);
  });

  it('Transfer Governship', async function () {
    const { settings, owner, otherAccount } = await loadFixture(deployFunction);
    expect(await settings.governor()).to.equal(otherAccount.address);

    await settings
      .connect(otherAccount)
      // @ts-expect-error
      .transferGovernorship(owner.address);
    expect(await settings.governor()).to.equal(owner.address);
  });

  it('Fail Transfer Governship - Not Governor', async function () {
    const { settings, owner, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(owner).transferGovernorship(owner.address),
    ).to.be.revertedWithCustomError(settings, 'CallerNotTheGovernor');
  });

  it('Fail Transfer Governship - Invalid Address', async function () {
    const { settings, owner, otherAccount } = await loadFixture(deployFunction);
    await expect(
      settings
        .connect(otherAccount)
        // @ts-expect-error
        .transferGovernorship('0x0000000000000000000000000000000000000000'),
    ).to.be.revertedWithCustomError(settings, 'InvalidGovernorAddress');
  });

  it('Change Loan to Value ✅', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setLoanToValue(700 * 1e6);
    // @ts-expect-error
    expect(await settings.connect(otherAccount).getLoanToValue()).to.equal(700 * 1e6);
  });

  it('Invalid Loan to Value ❌', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setLoanToValue(1100 * 1e6),
    ).to.be.revertedWithCustomError(settings, 'InvalidValue');
  });

  it('Change Max Loan to Value ✅', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setMaxLoanToValue(820 * 1e6);
    // @ts-expect-error
    expect(await settings.connect(otherAccount).getMaxLoanToValue()).to.equal(820 * 1e6);
  });

  it('Invalid Max Loan to Value ❌', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setMaxLoanToValue(400 * 1e6),
    ).to.be.revertedWithCustomError(settings, 'InvalidMaxLoanToValue');
  });

  it('Invalid Max Loan to Value ❌', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setMaxLoanToValue(1100 * 1e6),
    ).to.be.revertedWithCustomError(settings, 'InvalidPercentage');
  });

  it('Change Max Loan To value ✅', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setMaxLoanToValue(850 * 1e6);
    expect(await settings.getMaxLoanToValue()).to.equal(850 * 1e6);
  });

  it('Change Nr Loops ✅', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setNrLoops(5);

    // @ts-expect-error
    expect(await settings.connect(otherAccount).getNrLoops()).to.equal(5);
  });

  it('Invalid Nr Loops ❌', async function () {
    const { settings, owner, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setNrLoops(30),
    ).to.be.revertedWithCustomError(settings, 'InvalidLoopCount');
  });

  it('Change Max Slippage ✅', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setMaxSlippage(1 * 1e7);
    // @ts-expect-error
    expect(await settings.connect(otherAccount).getMaxSlippage()).to.equal(1 * 1e7);
  });

  it('Change Max Slippage ❌ - Invalid Value', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(
      // @ts-expect-error
      settings.connect(otherAccount).setMaxSlippage(2 * 1e9),
    ).to.be.revertedWithCustomError(settings, 'InvalidPercentage');
  });

  it('Change Max Slippage ❌ - No Permissions', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    await expect(settings.setMaxSlippage(1 * 1e8)).to.be.revertedWithCustomError(
      settings,
      'CallerNotTheGovernor',
    );
  });

  it('Change Max Slippage ✅  Allow 0% Slippage', async function () {
    const { settings, otherAccount } = await loadFixture(deployFunction);
    // @ts-expect-error
    await settings.connect(otherAccount).setMaxSlippage(0);
    // @ts-expect-error
    expect(await settings.connect(otherAccount).getMaxSlippage()).to.equal(0);
  });
});

/**
 * Deploys the ProxyAdmin and a StrategyLeverageSettings behind a BakerFiProxy
 *
 */
async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();

  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

  const StrategyLeverageSettings = await ethers.getContractFactory('StrategyLeverageSettingsMock');
  const strategyLeverageSettings = await StrategyLeverageSettings.deploy();

  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const proxy = await BakerFiProxy.deploy(
    await strategyLeverageSettings.getAddress(),
    await proxyAdmin.getAddress(),
    StrategyLeverageSettings.interface.encodeFunctionData('initialize', [
      owner.address,
      otherAccount.address,
    ]),
  );

  const pStrategyLeverageSettings = await ethers.getContractAt(
    'StrategyLeverageSettings',
    await proxy.getAddress(),
  );

  return { owner, otherAccount, settings: pStrategyLeverageSettings };
}
