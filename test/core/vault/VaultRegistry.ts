import '@nomicfoundation/hardhat-ethers';
import { describeif } from '../../common';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { deployVaultRegistry } from '../../../scripts/common';

/***************************************************
 *
 *  Unit Tests for Service Registry Contract
 *
 ****************************************************/

async function deployTestFunction() {
  const [owner, otherAccount] = await ethers.getSigners();
  const serviceRegistry = await deployVaultRegistry(owner.address);
  return { owner, serviceRegistry, otherAccount };
}

describeif(network.name === 'hardhat')('VaultRegistry', function () {
  it('Owner is set', async () => {
    const { serviceRegistry } = await loadFixture(deployTestFunction);
    expect(await serviceRegistry.owner()).to.equal('0xf15CC0ccBdDA041e2508B829541917823222F364');
  });

  it('Register Service', async () => {
    const helloAddress = '0xb8d0e3424cA4F308680CAd5C8AA14a9E4fCf5394';
    const { serviceRegistry } = await loadFixture(deployTestFunction);
    await expect(
      serviceRegistry.registerService(ethers.keccak256(Buffer.from('Hello')), helloAddress),
    )
      .to.emit(serviceRegistry, 'ServiceRegistered')
      .withArgs(ethers.keccak256(Buffer.from('Hello')), helloAddress);
    expect(await serviceRegistry.getService('Hello')).to.equal(helloAddress);
    expect(
      await serviceRegistry.getServiceFromHash(ethers.keccak256(Buffer.from('Hello'))),
    ).to.equal(helloAddress);
  });

  it('Failed to Register - Not Owner', async () => {
    const helloAddress = '0xb8d0e3424cA4F308680CAd5C8AA14a9E4fCf5394';
    const { serviceRegistry, otherAccount } = await loadFixture(deployTestFunction);
    await expect(
      serviceRegistry
        .connect(otherAccount)
        // @ts-expect-error
        .registerService(ethers.keccak256(Buffer.from('Hello')), helloAddress),
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('Failed Override Service', async () => {
    const { serviceRegistry } = await loadFixture(deployTestFunction);
    const helloAddress = '0xb8d0e3424cA4F308680CAd5C8AA14a9E4fCf5394';
    const helloAddress_2 = '0x720063CE70FC9b3f2eda200C83bCFfcce44897B2';

    await serviceRegistry.registerService(ethers.keccak256(Buffer.from('Hello')), helloAddress);
    await expect(
      serviceRegistry.registerService(ethers.keccak256(Buffer.from('Hello')), helloAddress_2),
    ).to.be.revertedWithCustomError(serviceRegistry, 'ServiceAlreadySet');
    expect(await serviceRegistry.getService('Hello')).to.equal(helloAddress);
  });

  it('Unregister Service', async () => {
    const helloAddress = '0xb8d0e3424cA4F308680CAd5C8AA14a9E4fCf5394';
    const { serviceRegistry } = await loadFixture(deployTestFunction);
    await serviceRegistry.registerService(ethers.keccak256(Buffer.from('Hello')), helloAddress);
    await expect(serviceRegistry.unregisterService(ethers.keccak256(Buffer.from('Hello'))))
      .to.emit(serviceRegistry, 'ServiceUnregistered')
      .withArgs(ethers.keccak256(Buffer.from('Hello')));
  });

  it('Fail Unregister Service - Service does not exist', async () => {
    const { serviceRegistry } = await loadFixture(deployTestFunction);
    await expect(
      serviceRegistry.unregisterService(ethers.keccak256(Buffer.from('Hello'))),
    ).to.be.revertedWithCustomError(serviceRegistry, 'ServiceUnknown');
  });
});
