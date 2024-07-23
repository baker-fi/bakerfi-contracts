import 'dotenv/config';
import hre from 'hardhat';
import { ethers } from 'hardhat';
import DeployConfig from '../constants/contracts';
import NetworkDeployConfig from '../constants/network-deploy-config';

async function main() {
  const sleepNow = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
  const networkName = hre.network.name;
  const deployConfig = NetworkDeployConfig[networkName];
  const networkConfig = DeployConfig[networkName];
  const debtPythOracle = await ethers.getContractAt('PythOracle', networkConfig.ethUSDOracle ?? '');
  const wstETHPythOracle = await ethers.getContractAt(
    'PythOracle',
    networkConfig.wstETHUSDOracle ?? '',
  );
  const aaveOracle = await ethers.getContractAt(
    'IAaveOracle',
    '0x2Cc0Fc26eD4563A5ce5e8bdcfe1A2878676Ae156',
  );
  const aavePool = await ethers.getContractAt('IPoolV3', deployConfig.AAVEPool);
  const vault = await ethers.getContractAt('Vault', networkConfig.vaultProxy ?? '');
  const ethReserveData = await aavePool.getReserveData(deployConfig.weth);
  const wstETHReserveData = await aavePool.getReserveData(deployConfig.wstETH);
  const awethToken = await ethers.getContractAt('ERC20', ethReserveData.variableDebtTokenAddress);
  const awstETH = await ethers.getContractAt('ERC20', wstETHReserveData.aTokenAddress);

  while (true) {
    const [ethPythPrice] = await debtPythOracle.getLatestPrice();
    const [wstETHPythPrice] = await wstETHPythOracle.getLatestPrice();
    const collateralBalance = await awstETH.balanceOf(networkConfig.strategyProxy);
    const debtBalance = await awethToken.balanceOf(networkConfig.strategyProxy);

    const ethAAVEPrice = await aaveOracle.getAssetPrice(deployConfig.weth);
    const wstETHAAVEPrice = await aaveOracle.getAssetPrice(deployConfig.wstETH);

    const colleralInUSD = BigInt(collateralBalance * wstETHPythPrice) / 10n ** 18n;
    const debtInUSD = BigInt(debtBalance * ethPythPrice) / 10n ** 18n;

    const colleralInUSDAAVE = BigInt(collateralBalance * wstETHAAVEPrice) / 10n ** 8n;
    const debtInUSDAAVE = BigInt(debtBalance * ethAAVEPrice) / 10n ** 8n;

    const tvl = colleralInUSD - debtInUSD;
    const tvlAAVE = colleralInUSDAAVE - debtInUSDAAVE;
    const wsthethPyth = BigInt((wstETHPythPrice * 10n ** 18n) / ethPythPrice);
    const wsthethAAVE = BigInt((wstETHAAVEPrice * 10n ** 8n) / ethAAVEPrice);

    console.log(
      `${new Date().toLocaleString()} ` +
        `ETH/USD = [${ethPythPrice / 10n ** 10n}, ${ethAAVEPrice}], ` +
        `WSETH/ [${wstETHPythPrice / 10n ** 10n}, ${wstETHAAVEPrice}] ` +
        `WSETH/ETH [${wsthethPyth / 10n ** 10n},${wsthethAAVE}] ` +
        `TVL[${tvl / 10n ** 18n}, ${tvlAAVE / 10n ** 18n}]`,
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
