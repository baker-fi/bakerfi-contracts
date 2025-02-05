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
              ethers.parseUnits('1', 18),
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
              ethers.parseUnits('1', 18),
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
              ethers.parseUnits('1', 18),
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
              ethers.parseUnits('5', 17),
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

  it('Steal WETH from owner with a pull and push', async function () {
    const { vaultRouter, weth, owner, otherAccount } = await deployFunction();
    expect(await weth.balanceOf(owner.address)).to.equal(ethers.parseUnits('10000', 18));
    // Approve the VaultRouter to pull the WETH from owner 10ETH
    const amount = ethers.parseUnits('10000', 18);
    await weth.approve(await vaultRouter.getAddress(), amount);

    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PULL_TOKEN_FROM,
        '0x' +
          iface
            .encodeFunctionData('pullTokenFrom', [await weth.getAddress(), owner.address, amount])
            .slice(10),
      ],
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PUSH_TOKEN,
        '0x' +
          iface
            .encodeFunctionData('pushToken', [
              await weth.getAddress(),
              otherAccount.address,
              amount,
            ])
            .slice(10),
      ],
    ];
    //@audit-info otherAccount drains owner's WETH
    await expect(vaultRouter.connect(otherAccount).execute(commands)).to.be.revertedWithCustomError(
      vaultRouter,
      'NotAuthorized',
    );
  });

  it('Steal WETH from owner with a pushFrom', async function () {
    const { vaultRouter, weth, owner, otherAccount } = await deployFunction();
    // Approve the VaultRouter to pull the WETH from owner 10ETH
    const amount = ethers.parseUnits('10000', 18);
    await weth.approve(await vaultRouter.getAddress(), amount);

    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PUSH_TOKEN_FROM,
        '0x' +
          iface
            .encodeFunctionData('pushTokenFrom', [
              await weth.getAddress(),
              owner.address,
              otherAccount.address,
              amount,
            ])
            .slice(10),
      ],
    ];
    await expect(vaultRouter.connect(otherAccount).execute(commands)).to.be.revertedWithCustomError(
      vaultRouter,
      'NotAuthorized',
    );
  });
  it('Exploit user ERC4626 allowances should fail', async function () {
    const { vault, weth, owner, otherAccount, vaultRouter } = await deployFunction();
    // 10 ETH
    const amount = 10n * 10n ** 18n;
    // Wrap 10 ETH
    await weth.deposit?.call('', { value: amount });
    await weth.approve(await vault.getAddress(), amount);
    // Deposit 10K USDC on the Vault
    await vault.deposit(amount, owner.address);
    // Check that the owner has the shares
    expect(await vault.balanceOf(owner.address)).to.equal(amount);
    // Approve the VaultRouter to spend vault shares from owner
    await vault.approve(await vaultRouter.getAddress(), ethers.MaxUint256);
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PULL_TOKEN_FROM,
        '0x' +
          iface
            .encodeFunctionData('pullTokenFrom', [await weth.getAddress(), owner.address, amount])
            .slice(10),
      ],
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PUSH_TOKEN,
        '0x' +
          iface
            .encodeFunctionData('pushToken', [
              await weth.getAddress(),
              otherAccount.address,
              amount,
            ])
            .slice(10),
      ],
    ];
    //@audit-info otherAccount drains owner's WETH
    await expect(vaultRouter.connect(otherAccount).execute(commands)).to.be.revertedWithCustomError(
      vaultRouter,
      'NotAuthorized',
    );
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
