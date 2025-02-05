import { ethers, network } from 'hardhat';
import { VAULT_ROUTER_COMMAND_ACTIONS, VaultRouterABI, describeif } from '../../common';
import { expect } from 'chai';
import { AbiCoder } from 'ethers/abi';

describeif(network.name === 'hardhat')('Vault Router Dispatch', function () {
  it('Dispatch swap', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.V3_UNISWAP_SWAP,
        '0x' +
          iface
            .encodeFunctionData('swap', [
              [
                '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e', //underlyingIn
                '0x5Ac32814f9EB4d415779892890a216b244FcB3B5', //underlyingOut
                0, //mode
                ethers.parseUnits('1', 18), //amountIn
                0, //amountOut
                new AbiCoder().encode(['uint24'], [10]),
              ],
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();

    const [tokenIn, tokenOut, mode, amountIn, amountOut, payload] =
      ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'address', 'uint256', 'uint256', 'uint256', 'bytes'],
        callInput,
      );
    const feeTier = new AbiCoder().decode(['uint24'], payload)[0];
    expect(tokenIn).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(tokenOut).to.equal('0x5Ac32814f9EB4d415779892890a216b244FcB3B5');
    expect(mode).to.equal(0);
    expect(amountIn).to.equal(ethers.parseUnits('1', 18));
    expect(amountOut).to.equal(0);
    expect(feeTier).to.equal(10);
  });

  it('Dispatch pullToken', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PULL_TOKEN,
        '0x' +
          iface
            .encodeFunctionData('pullToken', [
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [token, amount] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'uint256'],
      callInput,
    );
    expect(token).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(amount).to.equal(ethers.parseUnits('1', 18));
  });

  it('Dispatch pushToken', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PUSH_TOKEN,
        '0x' +
          iface
            .encodeFunctionData('pushToken', [
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [token, to, amount] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'address', 'uint256'],
      callInput,
    );
    expect(token).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(to).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(amount).to.equal(ethers.parseUnits('1', 18));
  });

  it('Dispatch pushTokenFrom', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const [owner, otherAccount] = await ethers.getSigners();
    const WETH = await ethers.getContractFactory('WETH');
    const wethMock = await WETH.deploy();
    await wethMock.waitForDeployment();
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PUSH_TOKEN_FROM,
        '0x' +
          iface
            .encodeFunctionData('pushTokenFrom', [
              await wethMock.getAddress(), //token
              owner.address, //from
              otherAccount.address, //to
              ethers.parseUnits('1', 18), //amount
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [token, from, to, amount] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'address', 'address', 'uint256'],
      callInput,
    );
    expect(token).to.equal(await wethMock.getAddress());
    expect(from).to.equal(owner.address);
    expect(to).to.equal(otherAccount.address);
    expect(amount).to.equal(ethers.parseUnits('1', 18));
  });

  it('Dispatch sweepTokens', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.SWEEP_TOKENS,
        '0x' +
          iface
            .encodeFunctionData('sweepTokens', [
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              '0x2cd1ca4fA7646189c87058E2C0A5d3902B4ADb43',
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [token, to] = ethers.AbiCoder.defaultAbiCoder().decode(['address', 'address'], callInput);
    expect(token).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(to).to.equal('0x2cd1ca4fA7646189c87058E2C0A5d3902B4ADb43');
  });

  it('Dispatch wrapETH', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.WRAP_ETH,
        '0x' + iface.encodeFunctionData('wrapETH', [ethers.parseUnits('1', 18)]).slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [amount] = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], callInput);
    expect(amount).to.equal(ethers.parseUnits('1', 18));
  });

  it('Dispatch unwrapETH', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.UNWRAP_ETH,
        '0x' + iface.encodeFunctionData('unwrapETH', [ethers.parseUnits('1', 18)]).slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [amount] = ethers.AbiCoder.defaultAbiCoder().decode(['uint256'], callInput);
    expect(amount).to.equal(ethers.parseUnits('1', 18));
  });

  it('Dispatch depositVault', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_DEPOSIT,
        '0x' +
          iface
            .encodeFunctionData('depositVault', [
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [vault, assets, receiver, minShares] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'uint256', 'address', 'uint256'],
      callInput,
    );
    expect(vault).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(assets).to.equal(ethers.parseUnits('1', 18));
    expect(receiver).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(minShares).to.equal(ethers.parseUnits('1', 18));
  });

  it('Dispatch mintVault', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_MINT,
        '0x' +
          iface
            .encodeFunctionData('mintVault', [
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [vault, assets, receiver, maxAssets] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'uint256', 'address', 'uint256'],
      callInput,
    );
    expect(vault).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(assets).to.equal(ethers.parseUnits('1', 18));
    expect(receiver).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(maxAssets).to.equal(ethers.parseUnits('1', 18));
  });

  it('Dispatch redeemVault', async function () {
    const [owner] = await ethers.getSigners();
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_REDEEM,
        '0x' +
          iface
            .encodeFunctionData('redeemVault', [
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [vault, assets, receiver, ownerReceived, minAssets] =
      ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'uint256', 'address', 'address', 'uint256'],
        callInput,
      );
    expect(vault).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(assets).to.equal(ethers.parseUnits('1', 18));
    expect(receiver).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(ownerReceived).to.equal(owner.address);
    expect(minAssets).to.equal(ethers.parseUnits('1', 18));
  });

  it('Dispatch withdrawVault', async function () {
    const [owner] = await ethers.getSigners();
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_WITHDRAW,
        '0x' +
          iface
            .encodeFunctionData('withdrawVault', [
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [vault, assets, receiver, ownerReceived, maxShares] =
      ethers.AbiCoder.defaultAbiCoder().decode(
        ['address', 'uint256', 'address', 'address', 'uint256'],
        callInput,
      );
    expect(vault).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(assets).to.equal(ethers.parseUnits('1', 18));
    expect(receiver).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(ownerReceived).to.equal(owner.address);
    expect(maxShares).to.equal(ethers.parseUnits('1', 18));
  });

  it('Dispatch sweepNative', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.SWEEP_NATIVE,
        '0x' +
          iface
            .encodeFunctionData('sweepNative', ['0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e'])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [to] = ethers.AbiCoder.defaultAbiCoder().decode(['address'], callInput);
    expect(to).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
  });
});

async function deployVaultRouterMockFunction() {
  const VaultRouterMock = await ethers.getContractFactory('VaultRouterMock');
  const vaultRouterMock = await VaultRouterMock.deploy();
  await vaultRouterMock.waitForDeployment();

  return vaultRouterMock;
}
