import hre from 'hardhat';
import '@nomicfoundation/hardhat-ethers';
import { program } from 'commander';

async function main() {
  await hre.run('compile');
  program
    .description('CLI to interact with Smart Contracts Infrastructure')
    .version('0.1.0')
    .command('contracts')
    .argument('<serviceRegistry>', 'Service Registry Contract Address')
    .description('Print the addresses of all the contracts')
    .action(contracts);

  program
    .command('price')
    .argument('<serviceRegistry>', 'Service Registry Contract Address')
    .description('Get the price of the collateral in ETH')
    .action(price);

  program.parse();
  const networkName = hre.network.name;
  console.log('Network = ', networkName);
}

async function contracts(registerAddress: any) {
  const registry = await hre.ethers.getContractAt('VaultRegistry', registerAddress);
  const constractKeys = [
    'FlashLender',
    'WETH',
    'stETH',
    'wstETH',
    'cbETH',
    'AAVEv3',
    'stETH/ETH Oracle',
    'cbETH/ETH Oracle',
    'Uniswap Router',
    'Swapper Handler',
    'Balancer Vault',
  ];
  for (const contractKey of constractKeys) {
    const address = await registry.getService(contractKey);
    console.log(`${contractKey} = ${address}`);
  }
}

async function price(registerAddress: any) {
  const registry = await hre.ethers.getContractAt('VaultRegistry', registerAddress);
  const oracleAddress = await registry.getService('cbETH/ETH Oracle');
  console.log('bETH/ETH Oracle =', oracleAddress);
  const oracle = await hre.ethers.getContractAt('ChainLinkOracle', oracleAddress);
  console.log('cbETH/ETH =', await oracle.getLatestPrice());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
