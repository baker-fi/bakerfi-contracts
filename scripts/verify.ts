import DeployConfig from '../constants/contracts';
import NetworkDeployConfig from '../constants/network-deploy-config';
import hre from 'hardhat';
import { feedIds } from '../constants/pyth';
import { OracleNamesEnum, StrategyImplementation } from '../constants/types';

/**
 * @description This script verifies the deployed contracts on the specified network for a given strategy.
 * It uses Hardhat's built-in verification tool to verify the contracts on Etherscan or similar block explorers.
 *
 * @param {string} strategy - The strategy implementation to verify. Should be a value from the StrategyImplementation enum.
 *
 * Usage:
 * ```
 * npx hardhat run scripts/verify.ts --network <network_name> -- <strategy>
 * ```
 *
 * Example:
 * ```
 * npx hardhat run scripts/verify.ts --network base -- AAVE_V3_WSTETH_ETH
 * ```
 *
 * @note Make sure to have the correct API keys set in your environment variables for the block explorer of the network you're verifying on.
 */

import { HardhatRuntimeEnvironment } from 'hardhat/types';

// This function is not used in the current script but could be useful for future modifications
async function verifyContract(
  hre: HardhatRuntimeEnvironment,
  address: string,
  constructorArguments: any[],
) {
  try {
    await hre.run('verify:verify', {
      address,
      constructorArguments,
    });
  } catch (error) {
    console.error(`Verification failed for ${address}:`, error);
  }
}

async function main() {
  const strategyImplementation = (process.env.STRATEGY ||
    StrategyImplementation.AAVE_V3_WSTETH_ETH) as StrategyImplementation;
  const networkName = hre.network.name;
  const deployConfig = DeployConfig[networkName];
  const networkConfig = NetworkDeployConfig[networkName];

  console.log('Verifying Service Registry');
  await hre.run('verify:verify', {
    address: deployConfig[strategyImplementation]?.serviceRegistry,
    constructorArguments: [networkConfig.owner],
  });
  console.log('Verifying Proxy Admin');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    contract: 'contracts/proxy/BakerFiProxyAdmin.sol:BakerFiProxyAdmin',
    address: deployConfig[strategyImplementation]?.proxyAdmin,
    constructorArguments: [networkConfig.owner],
  });
  console.log('Verifying Flash Lender');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    address: deployConfig[strategyImplementation]?.flashLender,
    constructorArguments: [deployConfig[strategyImplementation]?.serviceRegistry],
  });
  console.log('Verifying wstETH/USD Oracle ');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    address: deployConfig[strategyImplementation]?.collateralOracle,
    constructorArguments: [
      deployConfig[strategyImplementation]?.debtOracle,
      networkConfig.chainlink.wstEthToETH,
    ],
  });
  console.log('Verifying ETH/USD Oracle ');
  // Verifying Proxy Admin
  await hre.run('verify:verify', {
    address: deployConfig[strategyImplementation]?.debtOracle,
    constructorArguments: [feedIds[OracleNamesEnum.ETH_USD], networkConfig.pyth],
  });

  console.log('Verifying Strategy');
  await hre.run('verify:verify', {
    address: deployConfig[strategyImplementation]?.strategy,
    constructorArguments: [],
  });

  console.log('Verifying Strategy Proxy');
  const strategyFactory = await hre.ethers.getContractFactory('StrategyLeverageAAVEv3');
  await hre.run('verify:verify', {
    address: deployConfig[strategyImplementation]?.strategyProxy,
    contract: 'contracts/proxy/BakerFiProxy.sol:BakerFiProxy',
    constructorArguments: [
      deployConfig[strategyImplementation]?.settings,
      deployConfig[strategyImplementation]?.proxyAdmin,
      strategyFactory.interface.encodeFunctionData('initialize', [
        networkConfig.owner,
        networkConfig.owner,
        deployConfig[strategyImplementation]?.serviceRegistry,
        networkConfig.wstETH,
        networkConfig.weth,
        networkConfig.oracles.find((o) => o.name === 'wstETH/USD Oracle')?.address,
        networkConfig.oracles.find((o) => o.name === 'ETH/USD Oracle')?.address,
        deployConfig[strategyImplementation]?.flashLender,
        networkConfig.aavev3?.[
          networkConfig.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].aavev3MarketName
        ],
        networkConfig.uniswapRouter02,
        networkConfig.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].swapFeeTier,
        networkConfig.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].AAVEEModeCategory,
      ]),
    ],
  });

  console.log('Verifying Vault');
  await hre.run('verify:verify', {
    address: deployConfig[strategyImplementation]?.vault,
    constructorArguments: [],
  });

  console.log('Verifying Vault Proxy');
  const vaultFactory = await hre.ethers.getContractFactory('Vault');
  await hre.run('verify:verify', {
    address: deployConfig[strategyImplementation]?.vaultProxy,
    contract: 'contracts/proxy/BakerFiProxy.sol:BakerFiProxy',
    constructorArguments: [
      deployConfig[strategyImplementation]?.vault,
      deployConfig[strategyImplementation]?.proxyAdmin,
      vaultFactory.interface.encodeFunctionData('initialize', [
        networkConfig.owner,
        networkConfig.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].sharesName,
        networkConfig.markets[StrategyImplementation.AAVE_V3_WSTETH_ETH].sharesSymbol,
        deployConfig[strategyImplementation]?.strategyProxy,
        networkConfig.weth,
      ]),
    ],
  });
  console.log('Done ✅');
  process.exit(0);
}

// Add strategy argument to the main function
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
