import 'dotenv/config';
import hre from 'hardhat';
import { ethers } from 'hardhat';
import DeployConfig from '../constants/contracts';
import NetworkDeployConfig from '../constants/network-deploy-config';

const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

async function main() {
  const networkName = hre.network.name;
  const deployConfig = NetworkDeployConfig[networkName];
  const networkConfig = DeployConfig[networkName];

  const aavePool = await ethers.getContractAt('IPoolV3', deployConfig.AAVEPool);
  const vault = await ethers.getContractAt('Vault', networkConfig.vaultProxy ?? '');
  const ethReserveData = await aavePool.getReserveData(deployConfig.weth);
  const wstETHReserveData = await aavePool.getReserveData(deployConfig.wstETH);
  const awethToken = await ethers.getContractAt('ERC20', ethReserveData.variableDebtTokenAddress);
  const awstETH = await ethers.getContractAt('ERC20', wstETHReserveData.aTokenAddress);

  while (true) {
    const collateralBalance = await awstETH.balanceOf(networkConfig.strategyProxy);
    const debtBalance = await awethToken.balanceOf(networkConfig.strategyProxy);

    const collateralOracle = await ethers.getContractAt(
      'PythOracle',
      networkConfig.wstETHUSDOracle ?? '',
    );
    const debtOracle = await ethers.getContractAt('PythOracle', networkConfig.ethUSDOracle ?? '');
    const collateralPrice = await collateralOracle.getLatestPrice();
    const ethPrice = await debtOracle.getLatestPrice();
    const totalAssets = await vault.totalAssets();
    const colleralInUSD = BigInt(collateralBalance * collateralPrice.price) / 10n ** 18n;
    const debtInUSD = BigInt(debtBalance * ethPrice.price) / 10n ** 18n;

    console.log(
      `${new Date().toLocaleString()} ` +
        `TVL = ${ethers.formatUnits(totalAssets)} USD ` +
        `Collateral=${ethers.formatUnits(colleralInUSD)} USD ` +
        `Debt=${ethers.formatUnits(debtInUSD)} USD ` +
        `LTV=${BigInt(debtInUSD * 10000n) / BigInt(colleralInUSD)} %, ` +
        `wstETH/USD =${ethers.formatUnits(collateralPrice.price)} ` +
        `ETH/USD ${ethers.formatUnits(ethPrice.price)} `,
    );
    await sleepNow(30000);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
