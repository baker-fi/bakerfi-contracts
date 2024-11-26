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
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PUSH_TOKEN_FROM,
        '0x' +
          iface
            .encodeFunctionData('pushTokenFrom', [
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e', //token
              '0x263DB851A4de374488F90fa07c0ab9BDDaFF1F0E', //from
              '0x2cd1ca4fA7646189c87058E2C0A5d3902B4ADb43', //to
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
    expect(token).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(from).to.equal('0x263DB851A4de374488F90fa07c0ab9BDDaFF1F0E');
    expect(to).to.equal('0x2cd1ca4fA7646189c87058E2C0A5d3902B4ADb43');
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

  it('Dispatch permit', async function () {
    const vaultRouterMock = await deployVaultRouterMockFunction();
    let iface = new ethers.Interface(VaultRouterABI);
    const commands = [
      [
        VAULT_ROUTER_COMMAND_ACTIONS.PULL_TOKEN_WITH_PERMIT,
        '0x' +
          iface
            .encodeFunctionData('pullTokenWithPermit', [
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              ethers.parseUnits('1', 18),
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
              168000000,
              1,
              '0x0000000000000000000000000000000000000000000000000000000000000003',
              '0x0000000000000000000000000000000000000000000000000000000000000003',
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [token, amount, owner, deadline, v, r, s] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'uint256', 'address', 'uint256', 'uint8', 'bytes32', 'bytes32'],
      callInput,
    );
    expect(token).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(amount).to.equal(ethers.parseUnits('1', 18));
    expect(owner).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(deadline).to.equal(168000000);
    expect(v).to.equal(1);
    expect(r).to.equal('0x0000000000000000000000000000000000000000000000000000000000000003');
    expect(s).to.equal('0x0000000000000000000000000000000000000000000000000000000000000003');
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
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [vault, assets, receiver] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'uint256', 'address'],
      callInput,
    );
    expect(vault).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(assets).to.equal(ethers.parseUnits('1', 18));
    expect(receiver).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
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
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [vault, assets, receiver] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'uint256', 'address'],
      callInput,
    );
    expect(vault).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(assets).to.equal(ethers.parseUnits('1', 18));
    expect(receiver).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
  });

  it('Dispatch redeemVault', async function () {
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
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [vault, assets, receiver, owner] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'uint256', 'address', 'address'],
      callInput,
    );
    expect(vault).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(assets).to.equal(ethers.parseUnits('1', 18));
    expect(receiver).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(owner).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
  });

  it('Dispatch withdrawVault', async function () {
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
              '0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e',
            ])
            .slice(10),
      ],
    ];
    await vaultRouterMock.execute(commands);
    const callInput = await vaultRouterMock.callInput();
    const [vault, assets, receiver, owner] = ethers.AbiCoder.defaultAbiCoder().decode(
      ['address', 'uint256', 'address', 'address'],
      callInput,
    );
    expect(vault).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(assets).to.equal(ethers.parseUnits('1', 18));
    expect(receiver).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
    expect(owner).to.equal('0x37ebdd9B2adC5f8af3993256859c1Ea3BFE1465e');
  });
});

async function deployVaultRouterMockFunction() {
  const VaultRouterMock = await ethers.getContractFactory('VaultRouterMock');
  const vaultRouterMock = await VaultRouterMock.deploy();
  await vaultRouterMock.waitForDeployment();
  return vaultRouterMock;
}
