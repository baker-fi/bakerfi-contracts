import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import { deployMockERC20 } from '../../scripts/common';

describeif(network.name === 'hardhat')('UsePermitTransfers', function () {
  it('should be able to pull tokens using permit', async () => {
    const { owner, bkr, usePermitTransfers } = await deployFunction();

    const amount = ethers.parseUnits('1', 18);
    const deadline = Math.floor(Date.now() / 1000) + 1000000;
    const permitType = {
      Permit: [
        {
          name: 'owner',
          type: 'address',
        },
        {
          name: 'spender',
          type: 'address',
        },
        {
          name: 'value',
          type: 'uint256',
        },
        {
          name: 'nonce',
          type: 'uint256',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
    };
    const [, name, version, chainId, verifyingContract] = await bkr.eip712Domain();
    const signature = await owner.signTypedData(
      { name, version, chainId, verifyingContract },
      permitType,
      {
        owner: owner.address,
        spender: await usePermitTransfers.getAddress(),
        value: amount,
        nonce: await bkr.nonces(owner.address),
        deadline: deadline,
      },
    );

    const sign = ethers.Signature.from(signature);
    await usePermitTransfers.test__pullTokensWithPermit(
      await bkr.getAddress(),
      amount,
      owner.address,
      deadline,
      sign.v,
      sign.r,
      sign.s,
    );

    const balance = await bkr.balanceOf(await usePermitTransfers.getAddress());
    expect(balance).to.equal(amount);
  });
});

async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();

  // Deploy a Token that implements ERC20Permit
  const bkr = await deployMockERC20(
    'BakerFi Token',
    'BKR',
    ethers.parseUnits('500000000', 18),
    owner.address,
  );

  // Deploy the UsePermitTransfers contract
  const UsePermitTransfersMock = await ethers.getContractFactory('UsePermitTransfersMock');
  const usePermitTransfers = await UsePermitTransfersMock.deploy();
  await usePermitTransfers.waitForDeployment();

  return { owner, otherAccount, bkr, usePermitTransfers };
}
