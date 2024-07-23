import DeployConfig from '../constants/contracts';
import NetworkDeployConfig from '../constants/network-deploy-config';
import hre from 'hardhat';
import { feedIds, PythFeedNameEnum } from '../constants/pyth';

async function main() {
  const networkName = hre.network.name;
  const networkConfig = DeployConfig[networkName];
  const deployConfig = NetworkDeployConfig[networkName];

  console.log('Verifying Service Registry');
  await hre.run('verify:verify', {
    address: networkConfig.serviceRegistry,
    constructorArguments: [deployConfig.owner],
  });
  console.log('Verifying Proxy Admin');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    contract: 'contracts/proxy/BakerFiProxyAdmin.sol:BakerFiProxyAdmin',
    address: networkConfig.proxyAdmin,
    constructorArguments: [deployConfig.owner],
  });
  console.log('Verifying Flash Lender');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    address: networkConfig.flashLender,
    constructorArguments: [networkConfig.serviceRegistry],
  });
  console.log('Verifying wstETH/USD Oracle ');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    address: networkConfig.wstETHUSDOracle,
    constructorArguments: [feedIds[PythFeedNameEnum.WSTETH_USD], deployConfig.pyth],
  });
  console.log('Verifying ETH/USD Oracle ');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    address: networkConfig.ethUSDOracle,
    constructorArguments: [feedIds[PythFeedNameEnum.ETH_USD], deployConfig.pyth],
  });
  console.log('Verifying Settings');
  await hre.run('verify:verify', {
    address: networkConfig.settings,
    constructorArguments: [],
  });

  console.log('Verifying Settings Proxy');
  const settingsFactory = await hre.ethers.getContractFactory('Settings');
  await hre.run('verify:verify', {
    address: networkConfig.settingsProxy,
    contract: 'contracts/proxy/BakerFiProxy.sol:BakerFiProxy',
    constructorArguments: [
      networkConfig.settings,
      networkConfig.proxyAdmin,
      settingsFactory.interface.encodeFunctionData('initialize', [
        deployConfig.owner
      ]),
    ],
  });
  console.log('Verifying Strategy');
  await hre.run('verify:verify', {
    address: networkConfig.strategy,
    constructorArguments: [],
  });
  console.log('Verifying Strategy Proxy');
  const strategyFactory = await hre.ethers.getContractFactory('StrategyAAVEv3');
  await hre.run('verify:verify', {
    address: networkConfig.strategyProxy,
    contract: 'contracts/proxy/BakerFiProxy.sol:BakerFiProxy',
    constructorArguments: [
      networkConfig.settings,
      networkConfig.proxyAdmin,
      strategyFactory.interface.encodeFunctionData('initialize', [
        deployConfig.owner,
        deployConfig.owner,
        networkConfig.serviceRegistry,
        hre.ethers.keccak256(Buffer.from('wstETH')),
        hre.ethers.keccak256(Buffer.from('wstETH/USD Oracle')),
        deployConfig.swapFeeTier,
        deployConfig.AAVEEModeCategory,
      ]),
    ],
  });
  console.log('Verifying Strategy');
  await hre.run('verify:verify', {
    address: networkConfig.vault,
    constructorArguments: [],
  });
  console.log('Verifying Vault Proxy');
  const vaultFactory = await hre.ethers.getContractFactory('Vault');
  await hre.run('verify:verify', {
    address: networkConfig.vaultProxy,
    contract: 'contracts/proxy/BakerFiProxy.sol:BakerFiProxy',
    constructorArguments: [
      networkConfig.vault,
      networkConfig.proxyAdmin,
      vaultFactory.interface.encodeFunctionData('initialize', [
        deployConfig.owner,
        'AAVEv3 Bread ETH',
        'AAVEv3brETH',
        networkConfig.serviceRegistry,
        networkConfig.strategyProxy,
      ]),
    ],
  });

  console.log('Done ✅');
  process.exit(0);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
