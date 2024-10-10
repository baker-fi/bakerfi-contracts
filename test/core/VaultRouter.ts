import { ethers, network } from 'hardhat';
import { describeif } from '../common';
import { expect } from 'chai';
import {
  deployServiceRegistry,
  deployWETH,
  deployCbETH,
  deployQuoterV2Mock,
  deployVaultRouter,
} from '../../scripts/common';

//describeif(network.name === 'hardhat'
describe.only('Vault Router', function () {

  it('Deposit 1 WETH to Vault', async function () {
    const { vaultRouter, weth, vault, owner } = await deployFunction();

    await weth.approve(await vaultRouter.getAddress(), ethers.parseUnits('10000', 18));

    await vaultRouter.multicall([
      vaultRouter.interface.encodeFunctionData('pullToken', [
        await weth.getAddress(),
        ethers.parseUnits('1', 18),
      ]),
      vaultRouter.interface.encodeFunctionData('depositVault', [
        await vault.getAddress(),
        ethers.parseUnits('1', 18),
        owner.address,
      ]),
    ]);
    expect(await vault.balanceOf(owner.address)).to.equal(ethers.parseUnits('1', 18));
    expect(await vault.totalAssets()).to.equal(ethers.parseUnits('1', 18));
  });

  it('Deposit 1 cbETH to Vault', async function () {
    const { vaultRouter, cbETH, weth, vault, owner } = await deployFunction();
    await cbETH.approve(await vaultRouter.getAddress(), ethers.parseUnits('100', 18));

    await expect(vaultRouter.multicall([
      vaultRouter.interface.encodeFunctionData('pullToken', [
        await cbETH.getAddress(),
        ethers.parseUnits('1', 18),
      ]),
      vaultRouter.interface.encodeFunctionData('swap', [
        [
          await cbETH.getAddress(), //underlyingIn
          await weth.getAddress(), //underlyingOut
          0, //mode
          ethers.parseUnits('1', 18), //amountIn
          0, //amountOut
          10, //feeTier
          "0x", //payload
        ]
      ]),
      vaultRouter.interface.encodeFunctionData('depositVault', [
        await vault.getAddress(),
        ethers.parseUnits('1', 18),
        owner.address,
      ]),
    ])).to.changeTokenBalances(
        cbETH, [owner.address], [ethers.parseUnits('-1', 18)]
    );

    expect(await vault.balanceOf(owner.address)).to.equal(ethers.parseUnits('1', 18));
    expect(await vault.totalAssets()).to.equal(ethers.parseUnits('1', 18));

  });


  it.only('Withdraw 1 WETH from Vault', async function () {
    const { vaultRouter, weth, cbETH, vault, owner } = await deployFunction();
    await weth.approve(await vaultRouter.getAddress(), ethers.parseUnits('10000', 18));
    // 1. Deposit 1 WETH to Vault
    await vaultRouter.multicall([
        vaultRouter.interface.encodeFunctionData('pullToken', [
          await weth.getAddress(),
          ethers.parseUnits('1', 18),
        ]),
        vaultRouter.interface.encodeFunctionData('depositVault', [
          await vault.getAddress(),
          ethers.parseUnits('1', 18),
          owner.address,
        ]),
    ]);
    // Approve the VaultRouter to pull the shares from msg.sender
    await vault.approve(await vaultRouter.getAddress(), ethers.parseUnits('1000', 18));
    // 2. Withdraw 1 WETH from Vault
    await expect(vaultRouter.multicall([
      vaultRouter.interface.encodeFunctionData('redeemVault', [
        await vault.getAddress(),
        ethers.parseUnits('5', 17),
        await vaultRouter.getAddress(),
        owner.address,
      ]),
      vaultRouter.interface.encodeFunctionData('swap', [
        [
          await weth.getAddress(), //underlyingOut
          await cbETH.getAddress(), //underlyingIn
          0, //mode
          ethers.parseUnits('5', 17), //amountIn
          0, //amountOut
          10, //feeTier
          "0x", //payload
        ]
      ]),
      vaultRouter.interface.encodeFunctionData('pushToken', [
        await cbETH.getAddress(),
        owner.address,
        ethers.parseUnits('5', 17),
      ]),
    ],
    )).to.changeTokenBalances(
        cbETH, [owner.address], [ethers.parseUnits('5', 17)]
    );;

    expect(await vault.balanceOf(owner.address)).to.equal(ethers.parseUnits('5', 17));

  });

});

/**
 * Deploy Test Function
 */
async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();
  const CBETH_MAX_SUPPLY = ethers.parseUnits('1000000000', 18);

  const serviceRegistry = await deployServiceRegistry(owner.address);
  const weth = await deployWETH(serviceRegistry);
  const cbETH = await deployCbETH(serviceRegistry, owner, CBETH_MAX_SUPPLY);

  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();

  // Deploy cbETH -> ETH Uniswap Router
  const UniRouter = await ethers.getContractFactory('UniV3RouterMock');
  const router = await UniRouter.deploy(await weth.getAddress(), await cbETH.getAddress());
  await router.setPrice(1 * 1e9); //1:1 For cbETH/WETH

  // Deposit ETH on Uniswap Router
  await weth.deposit?.call('', { value: ethers.parseUnits('10000', 18) });
  // For Internal Balance
  await weth.deposit?.call('', { value: ethers.parseUnits('10000', 18) });
  await weth.transfer(await router.getAddress(), ethers.parseUnits('10000', 18));

  // Deposit cbETH on Uniswap Router
  await cbETH.transfer(await router.getAddress(), ethers.parseUnits('10000', 18));

  // Deploy QuoterV2 Mock
  const quoter = await deployQuoterV2Mock();

  // Deploy ERC4626VaultMock
  const ERC4626VaultMock = await ethers.getContractFactory('ERC4626VaultMock');
  const vault = await ERC4626VaultMock.deploy(await weth.getAddress());
  await vault.waitForDeployment();
  const { proxy: proxyRouter } = await deployVaultRouter(
    owner.address,
    await router.getAddress(),
    await weth.getAddress(),
    proxyAdmin,
  );

  const pRouter = await ethers.getContractAt('VaultRouter', await proxyRouter.getAddress());

  await pRouter.approveSpender(await weth.getAddress(), await vault.getAddress(), ethers.parseUnits('10000', 18));
  await pRouter.approveSpender(await cbETH.getAddress(), await vault.getAddress(), ethers.parseUnits('10000', 18));
  await pRouter.approveSpender(await cbETH.getAddress(), await router.getAddress(), ethers.parseUnits('10000', 18));
  await pRouter.approveSpender(await weth.getAddress(), await router.getAddress(), ethers.parseUnits('10000', 18));

  console.log("Deployed", await cbETH.getAddress(), await weth.getAddress());
  return {
    cbETH,
    weth,
    owner,
    otherAccount,
    vault,
    uniRouter: router,
    vaultRouter: pRouter,
  };
}
