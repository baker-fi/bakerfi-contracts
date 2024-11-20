import { network } from 'hardhat';
import { describeif } from '../../common';
import { ethers } from 'hardhat';
import { expect } from 'chai';
import '@nomicfoundation/hardhat-ethers';

describeif(network.name === 'hardhat')('Command', function () {
  it('Pull Input Param', async () => {
    const { command } = await deployFunction();
    const callStack = [10n, 20n, 30n, 40n, 50n, 60n, 70n, 80n];
    const value = 100n;
    expect(await command.pullInputParam(callStack, value, 0x0000000000000000n, 1)).to.equal(value);
    expect(await command.pullInputParam(callStack, value, 0x0000000000000001n, 1)).to.equal(10n);
    expect(await command.pullInputParam(callStack, value, 0x0000000000000002n, 1)).to.equal(20n);
    expect(await command.pullInputParam(callStack, value, 0x0000000000000003n, 1)).to.equal(30n);
    expect(await command.pullInputParam(callStack, value, 0x0000000000000004n, 1)).to.equal(40n);
    expect(await command.pullInputParam(callStack, value, 0x0000000000000005n, 1)).to.equal(50n);
    expect(await command.pullInputParam(callStack, value, 0x0000000000000006n, 1)).to.equal(60n);
    expect(await command.pullInputParam(callStack, value, 0x0000000000000007n, 1)).to.equal(70n);
    expect(await command.pullInputParam(callStack, value, 0x0000000000000008n, 1)).to.equal(80n);
    expect(await command.pullInputParam(callStack, value, 0x0000000000000100n, 2)).to.equal(10n);
    expect(await command.pullInputParam(callStack, value, 0x0100000000000000n, 8)).to.equal(10n);
    expect(await command.pullInputParam(callStack, value, 0x0800000000000000n, 8)).to.equal(80n);
  });

  it('Push output Param - No change to callStack', async () => {
    const { command } = await deployFunction();
    let callStack = [10n, 20n, 30n, 40n, 50n, 60n, 70n, 80n];
    const value = 100n;
    callStack = await command.pushOutputParam(callStack, value, 0x0000000000000000n, 1);
    expect(callStack).to.deep.equal([10n, 20n, 30n, 40n, 50n, 60n, 70n, 80n]);
  });

  it('Push output Param - Change callStack[0] to value', async () => {
    const { command } = await deployFunction();
    let callStack = [10n, 20n, 30n, 40n, 50n, 60n, 70n, 80n];
    const value = 100n;
    callStack = await command.pushOutputParam(callStack, value, 0x0000000000000001n, 1);
    expect(callStack).to.deep.equal([value, 20n, 30n, 40n, 50n, 60n, 70n, 80n]);
  });

  it('Push output Param - Change callStack[7] to value', async () => {
    const { command } = await deployFunction();
    let callStack = [10n, 20n, 30n, 40n, 50n, 60n, 70n, 80n];
    const value = 100n;
    callStack = await command.pushOutputParam(callStack, value, 0x0000000000000008n, 1);
    expect(callStack).to.deep.equal([10n, 20n, 30n, 40n, 50n, 60n, 70n, value]);
  });

  it('Push output Param - Change callStack[0] to value', async () => {
    const { command } = await deployFunction();
    let callStack = [10n, 20n, 30n, 40n, 50n, 60n, 70n, 80n];
    const value = 100n;
    callStack = await command.pushOutputParam(callStack, value, 0x0100000000000000n, 8);
    expect(callStack).to.deep.equal([value, 20n, 30n, 40n, 50n, 60n, 70n, 80n]);
  });

  it('Push output Param - Change callStack[7] to value', async () => {
    const { command } = await deployFunction();
    let callStack = [10n, 20n, 30n, 40n, 50n, 60n, 70n, 80n];
    const value = 100n;
    callStack = await command.pushOutputParam(callStack, value, 0x0800000000000000n, 8);
    expect(callStack).to.deep.equal([10n, 20n, 30n, 40n, 50n, 60n, 70n, value]);
  });

  it('Push output Param - Invalid position', async () => {
    const { command } = await deployFunction();
    let callStack = [10n, 20n, 30n, 40n, 50n, 60n, 70n, 80n];
    const value = 100n;
    await expect(
      command.pushOutputParam(callStack, value, 0x0000000000000000n, 9),
    ).to.be.revertedWithCustomError(command, 'InvalidPosition');
  });

  it('Push output Param - Invalid mapping index', async () => {
    const { command } = await deployFunction();
    let callStack = [10n, 20n, 30n, 40n, 50n, 60n, 70n, 80n];
    const value = 100n;
    await expect(
      command.pushOutputParam(callStack, value, 0x0000000000000009n, 1),
    ).to.be.revertedWithCustomError(command, 'InvalidMappingIndex');
  });
});

async function deployFunction() {
  const [owner] = await ethers.getSigners();
  const Command = await ethers.getContractFactory('CommandMock');
  const command = await Command.deploy();
  await command.waitForDeployment();
  return { command, owner };
}
