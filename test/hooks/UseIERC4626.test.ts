import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import { deployVaultRegistry, deployWETH } from '../../scripts/common';

describeif(network.name === 'hardhat')('UseIERC4626', function () {
  it('Approve Token for Vault', async function () {
    const { useIERC4626, vault, weth } = await deployFunction();
    await useIERC4626.approveTokenForVault(vault, weth);
    expect(await useIERC4626.isTokenApprovedForVault(vault, weth)).to.be.true;
  });

  it('Test UnApprove Token for Vault', async function () {
    const { useIERC4626, vault, weth } = await deployFunction();
    await useIERC4626.unapproveTokenForVault(vault, weth);
    expect(await useIERC4626.isTokenApprovedForVault(vault, weth)).to.be.false;
  });

  it('Only Owner can Approve Token for Vault', async function () {
    const { useIERC4626, vault, weth, otherAccount } = await deployFunction();
    await expect(
      useIERC4626.connect(otherAccount).approveTokenForVault(vault, weth),
    ).to.be.revertedWithCustomError(useIERC4626, 'CallerNotTheGovernor');
  });

  it('Only Owner can UnApprove Token for Vault', async function () {
    const { useIERC4626, vault, weth, otherAccount } = await deployFunction();
    await useIERC4626.approveTokenForVault(vault, weth);
    await expect(
      useIERC4626.connect(otherAccount).unapproveTokenForVault(vault, weth),
    ).to.be.revertedWithCustomError(useIERC4626, 'CallerNotTheGovernor');
  });

  it('Deposit to Vault', async function () {
    const { owner, useIERC4626, vault, weth } = await deployFunction();
    await useIERC4626.approveTokenForVault(vault, weth);
    await weth.transfer(await useIERC4626.getAddress(), ethers.parseUnits('1', 18));
    await useIERC4626.test__depositVault(
      vault,
      ethers.parseUnits('1', 18),
      owner.address,
      ethers.parseUnits('1', 18),
    );
    expect(await vault.balanceOf(owner.address)).to.equal(ethers.parseUnits('1', 18));
  });

  it('Mint to Vault', async function () {
    const { owner, useIERC4626, vault, weth } = await deployFunction();
    await useIERC4626.approveTokenForVault(vault, weth);
    await weth.transfer(await useIERC4626.getAddress(), ethers.parseUnits('1', 18));
    await useIERC4626.test__mintVault(
      vault,
      ethers.parseUnits('1', 18),
      owner.address,
      ethers.parseUnits('1', 18),
    );
    expect(await vault.balanceOf(owner.address)).to.equal(ethers.parseUnits('1', 18));
  });

  it('Withdraw from Vault', async function () {
    const { owner, useIERC4626, vault, weth } = await deployFunction();
    await useIERC4626.approveTokenForVault(vault, weth);
    await weth.transfer(await useIERC4626.getAddress(), ethers.parseUnits('1', 18));
    await useIERC4626.test__depositVault(
      vault,
      ethers.parseUnits('1', 18),
      owner.address,
      ethers.parseUnits('1', 18),
    );
    await vault.approve(await useIERC4626.getAddress(), ethers.parseUnits('1000', 18));
    await useIERC4626.test__withdrawVault(
      vault,
      ethers.parseUnits('1', 18),
      owner.address,
      owner.address,
      ethers.parseUnits('1', 18),
    );
    expect(await vault.balanceOf(owner.address)).to.equal(0);
  });

  it('Redeem from Vault', async function () {
    const { owner, useIERC4626, vault, weth } = await deployFunction();
    await useIERC4626.approveTokenForVault(vault, weth);
    await weth.transfer(await useIERC4626.getAddress(), ethers.parseUnits('1', 18));
    await useIERC4626.test__depositVault(
      vault,
      ethers.parseUnits('1', 18),
      owner.address,
      ethers.parseUnits('1', 18),
    );
    await vault.approve(await useIERC4626.getAddress(), ethers.parseUnits('1000', 18));
    await useIERC4626.test__redeemVault(
      vault,
      ethers.parseUnits('1', 18),
      owner.address,
      owner.address,
      ethers.parseUnits('1', 18),
    );
    expect(await vault.balanceOf(owner.address)).to.equal(0);
  });
});

async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();

  const serviceRegistry = await deployVaultRegistry(owner.address);
  const weth = await deployWETH(serviceRegistry);

  const UseIERC4626 = await ethers.getContractFactory('UseIERC4626Mock');
  const useIERC4626 = await UseIERC4626.deploy();
  await useIERC4626.waitForDeployment();
  await useIERC4626.initialize(owner.address);

  // Deposit ETH on WETH to get WETH
  await weth.deposit?.call('', { value: ethers.parseUnits('10000', 18) });

  // Deploy ERC4626VaultMock
  const ERC4626VaultMock = await ethers.getContractFactory('ERC4626VaultMock');
  const vault = await ERC4626VaultMock.deploy(await weth.getAddress());
  await vault.waitForDeployment();

  return { owner, otherAccount, useIERC4626, vault, weth };
}
