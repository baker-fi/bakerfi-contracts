import { ethers, network } from 'hardhat';
import ora from 'ora';
import {
  deployVaultRegistry,
  deployVaultRouter,
  deployParkStrategy,
  deployWETH,
  deployBKR,
} from './common';

/**
 * @dev Deploy the Multi Strategy Vault and Vault Router
 * @author Chef Kenji <chef.kenji@bakerfi.xyz>
 * @author Chef Kal-El <chef.kal-el@bakerfi.xyz>
 *
 *  Test Scenario
 *  User -> Router -> Vault -> [StrategyPark1, StrategyPark2
 */
async function main() {
  const networkName = network.name;
  const chainId = network.config.chainId;

  console.log('  🧑‍🍳 BakerFi Cooking .... ');
  const result: any[] = [];
  const spinner = ora('Cooking ....').start();
  result.push(['Network Name', networkName]);
  result.push(['Network Id', chainId]);

  spinner.text = 'Getting Signers';
  const [owner] = await ethers.getSigners();

  // Deploy the Service Registry
  const serviceRegistry = await deployVaultRegistry(owner.address);
  spinner.text = 'Deploying Registry';
  result.push(['Service Registry', await serviceRegistry.getAddress()]);

  // Deploy Proxy Admin
  spinner.text = 'Deploying Proxy Admin';
  const BakerFiProxyAdmin = await ethers.getContractFactory('BakerFiProxyAdmin');
  const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
  await proxyAdmin.waitForDeployment();
  result.push(['Proxy Admin', await proxyAdmin.getAddress()]);

  // Deploy WETH
  spinner.text = 'Deploying WETH';
  const weth = await deployWETH(serviceRegistry);
  result.push(['WETH', await weth.getAddress()]);

  // Deploy Park 1 Strategy
  spinner.text = 'Deploying Park 1 Strategy';
  const park1Strategy = await deployParkStrategy(owner.address, await weth.getAddress());
  result.push(['Park 1 Strategy', await park1Strategy.getAddress()]);
  spinner.text = 'Deploying Park 2 Strategy';
  // Deploy Park 2 Strategy
  const park2Strategy = await deployParkStrategy(owner.address, await weth.getAddress());
  result.push(['Park 2 Strategy', await park2Strategy.getAddress()]);
  // Deploy Multi Strategy Vault
  const vaultProxy = await deployVault(
    result,
    owner,
    proxyAdmin,
    park1Strategy,
    park2Strategy,
    weth,
  );

  // Transfer Ownership to the Vault
  await park1Strategy.transferOwnership(await vaultProxy.getAddress());
  await park2Strategy.transferOwnership(await vaultProxy.getAddress());

  // Deploy the Vault Router
  const vaultRouterProxy = await deployVaultRouter(result, owner, proxyAdmin, weth);
  const vaultRouter = await ethers.getContractAt(
    'VaultRouter',
    await vaultRouterProxy.getAddress(),
  );
  await vaultRouter.approveTokenForVault(await vaultProxy.getAddress(), await weth.getAddress());

  // 2. Deploy BKR
  spinner.text = 'Deploying BKR';
  const bkr = await deployBKR(owner.address, serviceRegistry);
  result.push(['BKR', await bkr.getAddress()]);

  spinner.succeed('🧑‍🍳 BakerFi Served 🍰');
  console.table(result);
  process.exit(0);
}

async function deployVault(result, owner, proxyAdmin, park1Strategy, park2Strategy, weth) {
  const MultiStrategyVault = await ethers.getContractFactory('MultiStrategyVault');
  const vault = await MultiStrategyVault.deploy();
  await vault.waitForDeployment();
  result.push(['Multi Strategy Vault (Instance)', await vault.getAddress()]);
  const BakerFiProxy = await ethers.getContractFactory('BakerFiProxy');
  const proxy = await BakerFiProxy.deploy(
    await vault.getAddress(),
    await proxyAdmin.getAddress(),
    MultiStrategyVault.interface.encodeFunctionData('initialize', [
      owner.address,
      '50/50-Park',
      '5050Park',
      await weth.getAddress(),
      [await park1Strategy.getAddress(), await park2Strategy.getAddress()],
      [5000, 5000],
      await weth.getAddress(),
    ]),
  );
  await proxy.waitForDeployment();
  result.push(['Multi Strategy Vault (Proxy)', await proxy.getAddress()]);
  const vaultProxy = await ethers.getContractAt('MultiStrategyVault', await proxy.getAddress());
  console.log('totalAssets', await vaultProxy.totalAssets());

  return proxy;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
