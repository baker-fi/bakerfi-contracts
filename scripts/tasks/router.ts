import DeployConfig from '../../constants/contracts';
import ora from 'ora';
import { task } from 'hardhat/config';
import { VAULT_ROUTER_COMMAND_ACTIONS, VaultRouterABI } from '../../test/common';

task('router:deposit', 'Deposit')
  .addParam('amount', 'Amount')
  .addParam('vault', 'Vault')
  .setAction(async ({ amount, vault }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const vaultAddress = networkConfig[vault].vaultProxy;
    const vaultProxy = await ethers.getContractAt('MultiStrategyVault', vaultAddress);

    const spinner = ora(`Depositing ${amount} into ${vaultAddress}`).start();
    try {
      const [owner] = await ethers.getSigners();
      let iface = new ethers.Interface(VaultRouterABI);
      const commands = [
        [
          VAULT_ROUTER_COMMAND_ACTIONS.WRAP_ETH,
          '0x' + iface.encodeFunctionData('wrapETH', [amount]).slice(10),
        ],
        [
          VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_DEPOSIT,
          '0x' +
            iface
              .encodeFunctionData('depositVault', [
                vaultAddress,
                amount,
                owner.address,
                amount * (1 + 0.1),
              ])
              .slice(10),
        ],
      ];
      const vaultRouterAddress = networkConfig[vault].vaultRouterProxy;
      const vaultRouter = await ethers.getContractAt('VaultRouter', vaultRouterAddress);
      await vaultRouter.execute(commands, {
        value: amount,
      });
      spinner.succeed(`🧑‍🍳 Deposited ${vault} has ${await vaultProxy.totalAssets()}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('router:withdraw', 'Deposit')
  .addParam('amount', 'Amount')
  .addParam('vault', 'Vault')
  .setAction(async ({ amount, vault }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const vaultAddress = networkConfig[vault].vaultProxy;
    const vaultProxy = await ethers.getContractAt('MultiStrategyVault', vaultAddress);
    const vaultRouterAddress = networkConfig[vault].vaultRouterProxy;
    await vaultProxy.approve(vaultRouterAddress, amount);
    const spinner = ora(`Withdrawing ${amount} from ${vaultAddress}`).start();
    try {
      const [owner] = await ethers.getSigners();
      let iface = new ethers.Interface(VaultRouterABI);

      const commands = [
        [
          VAULT_ROUTER_COMMAND_ACTIONS.ERC4626_VAULT_WITHDRAW,
          '0x' +
            iface
              .encodeFunctionData('withdrawVault', [
                vaultAddress,
                amount,
                vaultRouterAddress,
                owner.address,
                amount * (1 + 0.1),
              ])
              .slice(10),
        ],
        [
          VAULT_ROUTER_COMMAND_ACTIONS.UNWRAP_ETH,
          '0x' + iface.encodeFunctionData('unwrapETH', [amount]).slice(10),
        ],
        [
          VAULT_ROUTER_COMMAND_ACTIONS.SEND_NATIVE,
          '0x' + iface.encodeFunctionData('sendNative', [owner.address, amount]).slice(10),
        ],
      ];

      const vaultRouter = await ethers.getContractAt('VaultRouter', vaultRouterAddress);
      await vaultRouter.execute(commands, {
        value: amount,
      });
      spinner.succeed(`🧑‍🍳 Deposited ${vault} has ${await vaultProxy.totalAssets()}`);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });
