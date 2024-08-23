import DeployConfig from '../constants/contracts';
import NetworkDeployConfig from '../constants/network-deploy-config';
import hre from 'hardhat';
import { feedIds } from '../constants/pyth';
import { OracleNamesEnum, StrategyImplementation } from '../constants/types';

async function main() {
  const networkName = hre.network.name;
  const deployConfig = DeployConfig[networkName];
  const networkConfig = NetworkDeployConfig[networkName];

  console.log('Verifying Service Registry');
  await hre.run('verify:verify', {
    address: deployConfig.serviceRegistry,
    constructorArguments: [networkConfig.owner],
  });
  console.log('Verifying Proxy Admin');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    contract: 'contracts/proxy/BakerFiProxyAdmin.sol:BakerFiProxyAdmin',
    address: deployConfig.proxyAdmin,
    constructorArguments: [networkConfig.owner],
  });
  console.log('Verifying Flash Lender');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    address: deployConfig.flashLender,
    constructorArguments: [deployConfig.serviceRegistry],
  });
  console.log('Verifying wstETH/USD Oracle ');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    address: deployConfig.wstETHUSDOracle,
    constructorArguments: [deployConfig.ethUSDOracle, networkConfig.wstETHToETHExRatio],
  });
  console.log('Verifying ETH/USD Oracle ');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    address: deployConfig.ethUSDOracle,
    constructorArguments: [feedIds[OracleNamesEnum.ETH_USD], networkConfig.pyth],
  });
  console.log('Verifying Settings');
  await hre.run('verify:verify', {
    address: deployConfig.settings,
    constructorArguments: [],
  });

  console.log('Verifying Settings Proxy');
  const settingsFactory = await hre.ethers.getContractFactory('Settings');
  await hre.run('verify:verify', {
    address: deployConfig.settingsProxy,
    contract: 'contracts/proxy/BakerFiProxy.sol:BakerFiProxy',
    constructorArguments: [
      deployConfig.settings,
      deployConfig.proxyAdmin,
      settingsFactory.interface.encodeFunctionData('initialize', [networkConfig.owner]),
    ],
  });
  console.log('Verifying Strategy');
  await hre.run('verify:verify', {
    address: deployConfig.strategy,
    constructorArguments: [],
  });
  console.log('Verifying Strategy Proxy');
  const strategyFactory = await hre.ethers.getContractFactory('StrategyAAVEv3');
  await hre.run('verify:verify', {
    address: deployConfig.strategyProxy,
    contract: 'contracts/proxy/BakerFiProxy.sol:BakerFiProxy',
    constructorArguments: [
      deployConfig.settings,
      deployConfig.proxyAdmin,
      strategyFactory.interface.encodeFunctionData('initialize', [
        networkConfig.owner,
        networkConfig.owner,
        deployConfig.serviceRegistry,
        hre.ethers.keccak256(Buffer.from('wstETH')),
        hre.ethers.keccak256(Buffer.from('wstETH/USD Oracle')),
        deployConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH].swapFeeTier,
        deployConfig[StrategyImplementation.AAVE_V3_WSTETH_ETH].AAVEEModeCategory,
      ]),
    ],
  });
  console.log('Verifying Strategy');
  await hre.run('verify:verify', {
    address: deployConfig.vault,
    constructorArguments: [],
  });
  console.log('Verifying Vault Proxy');
  const vaultFactory = await hre.ethers.getContractFactory('Vault');
  await hre.run('verify:verify', {
    address: deployConfig.vaultProxy,
    contract: 'contracts/proxy/BakerFiProxy.sol:BakerFiProxy',
    constructorArguments: [
      deployConfig.vault,
      deployConfig.proxyAdmin,
      vaultFactory.interface.encodeFunctionData('initialize', [
        networkConfig.owner,
        'AAVEv3 Bread ETH',
        'AAVEv3brETH',
        deployConfig.serviceRegistry,
        deployConfig.strategyProxy,
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
