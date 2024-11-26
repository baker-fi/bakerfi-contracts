import { ethers, network } from 'hardhat';
import { VAULT_ROUTER_COMMAND_ACTIONS, VaultRouterABI, describeif } from '../../common';
import { expect } from 'chai';
import {
  deployVaultRegistry,
  deployWETH,
  deployCbETH,
  deployQuoterV2Mock,
  deployVaultRouter,
} from '../../../scripts/common';
import { AbiCoder } from 'ethers/abi';

describeif(network.name === 'hardhat')('Vault Router', function () {
  it('Deposit 1 WETH to Vault', async function () {
    const { vaultRouter, weth, vault, owner } = await deployFunction();

    await weth.approve(await vaultRouter.getAddress(), ethers.parseUnits('10000', 18));
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PULL_TOKEN,
        '0x' +
          iface
            .encodeFunctionData('pullToken', [await weth.getAddress(), ethers.parseUnits('1', 18)])
            .slice(10),
      ],
      [
        VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_DEPOSIT,
        '0x' +
          iface
            .encodeFunctionData('depositVault', [
              await vault.getAddress(),
              ethers.parseUnits('1', 18),
              owner.address,
            ])
            .slice(10),
      ],
    ];
    await vaultRouter.execute(commands);
    expect(await vault.balanceOf(owner.address)).to.equal(ethers.parseUnits('1', 18));
    expect(await vault.totalAssets()).to.equal(ethers.parseUnits('1', 18));
  });

  it('Deposit 1 cbETH to Vault', async function () {
    const { vaultRouter, cbETH, weth, vault, owner } = await deployFunction();
    await cbETH.approve(await vaultRouter.getAddress(), ethers.parseUnits('100', 18));
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PULL_TOKEN,
        '0x' +
          iface
            .encodeFunctionData('pullToken', [await cbETH.getAddress(), ethers.parseUnits('1', 18)])
            .slice(10),
      ],
      [
        VAULT_ROUTER_COMMAND_ACTIONS.V3_UNISWAP_SWAP,
        '0x' +
          iface
            .encodeFunctionData('swap', [
              [
                await cbETH.getAddress(), //underlyingIn
                await weth.getAddress(), //underlyingOut
                0, //mode
                ethers.parseUnits('1', 18), //amountIn
                0, //amountOut
                new AbiCoder().encode(['uint24'], [10]),
              ],
            ])
            .slice(10),
      ],
      [
        VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_DEPOSIT,
        '0x' +
          iface
            .encodeFunctionData('depositVault', [
              await vault.getAddress(),
              ethers.parseUnits('1', 18),
              owner.address,
            ])
            .slice(10),
      ],
    ];
    await vaultRouter.execute(commands);
    expect(await vault.balanceOf(owner.address)).to.equal(ethers.parseUnits('1', 18));

    expect(await vault.balanceOf(owner.address)).to.equal(ethers.parseUnits('1', 18));
    expect(await vault.totalAssets()).to.equal(ethers.parseUnits('1', 18));
  });

  it('Withdraw 1 WETH from Vault', async function () {
    const { vaultRouter, weth, cbETH, vault, owner } = await deployFunction();
    await weth.approve(await vaultRouter.getAddress(), ethers.parseUnits('10000', 18));
    // 1. Deposit 1 WETH to Vault
    let iface = new ethers.Interface(VaultRouterABI);
    const depositCommands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PULL_TOKEN,
        '0x' +
          iface
            .encodeFunctionData('pullToken', [await weth.getAddress(), ethers.parseUnits('1', 18)])
            .slice(10),
      ],
      [
        VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_DEPOSIT,
        '0x' +
          iface
            .encodeFunctionData('depositVault', [
              await vault.getAddress(),
              ethers.parseUnits('1', 18),
              owner.address,
            ])
            .slice(10),
      ],
    ];
    await vaultRouter.execute(depositCommands);

    // Approve the VaultRouter to pull the shares from msg.sender
    await vault.approve(await vaultRouter.getAddress(), ethers.parseUnits('1000', 18));
    // 2. Withdraw 1 WETH from Vault
    const withdrawCommands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_REDEEM,
        '0x' +
          iface
            .encodeFunctionData('redeemVault', [
              await vault.getAddress(),
              ethers.parseUnits('5', 17),
              await vaultRouter.getAddress(),
              owner.address,
            ])
            .slice(10),
      ],
      [
        VAULT_ROUTER_COMMAND_ACTIONS.V3_UNISWAP_SWAP,
        '0x' +
          iface
            .encodeFunctionData('swap', [
              [
                await weth.getAddress(), //underlyingOut
                await cbETH.getAddress(), //underlyingIn
                0, //mode
                ethers.parseUnits('5', 17), //amountIn
                0, //amountOut
                new AbiCoder().encode(['uint24'], [10]),
              ],
            ])
            .slice(10),
      ],
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PUSH_TOKEN,
        '0x' +
          iface
            .encodeFunctionData('pushToken', [
              await cbETH.getAddress(),
              owner.address,
              ethers.parseUnits('5', 17),
            ])
            .slice(10),
      ],
    ];
    await vaultRouter.execute(withdrawCommands);
    expect(await vault.balanceOf(owner.address)).to.equal(ethers.parseUnits('5', 17));
  });
});

/**
 * Deploy Test Function
 */
async function deployFunction() {
  const [owner, otherAccount] = await ethers.getSigners();
  const CBETH_MAX_SUPPLY = ethers.parseUnits('1000000000', 18);

  const serviceRegistry = await deployVaultRegistry(owner.address);
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
    await weth.getAddress(),
    proxyAdmin,
  );

  const pRouter = await ethers.getContractAt('VaultRouter', await proxyRouter.getAddress());

  await pRouter.enableRoute(await weth.getAddress(), await cbETH.getAddress(), {
    router: await router.getAddress(),
    provider: 1,
    uniV3Tier: 100,
    tickSpacing: 0,
  });

  await pRouter.approveTokenForVault(await vault.getAddress(), await weth.getAddress());
  await pRouter.approveTokenForVault(await vault.getAddress(), await cbETH.getAddress());
  //  await pRouter.approveTokenToSwap(await cbETH.getAddress());
  //await pRouter.approveTokenToSwap(await weth.getAddress());

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
