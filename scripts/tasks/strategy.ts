import ora from 'ora';
import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import { getClient } from './common';
import NetworkDeployConfig from '../../constants/network-deploy-config';
import { AAVEv3MarketNames, StrategyImplementation } from '../../constants/types';

task('strategy:setNrLoops', 'Set number of Loopps')
  .addParam('value', 'loop coount')
  .addParam('strategy', 'loop coount', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Nr Of Loops to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'StrategyLeverageAAVEv3',
        networkConfig[strategy]?.strategyProxy ?? '',
        'setNrLoops',
        [value],
        {
          chainId: network.config.chainId,
        },
      ),
        spinner.succeed(`🧑‍🍳 Nr of Loops Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('strategy:setMaxSlippage', 'Set Strategy Max Slippage')
  .addParam('value', 'The new strategy max slippage')
  .addParam('strategy', 'loop coount', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Strategy Max Slipage to ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'StrategyLeverageAAVEv3',
        networkConfig[strategy]?.strategyProxy ?? '',
        'setMaxSlippage',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Strategy Max Slippage Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('strategy:getPosition', 'Set number of Loopps')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Rebalance Max Age ${value}`).start();

    try {
      let app = await getClient(ethers);
      const [totalCollateralInEth, totalDebtInEth, loanToValue] = await app?.call(
        'StrategyLeverageAAVEv3',
        networkConfig[strategy]?.strategyProxy ?? '',
        'getPosition',
        [[0, 0]],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(
        `🧑‍🍳 Strategy Position ${totalCollateralInEth},${totalDebtInEth}, ${loanToValue} `,
      );
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('strategy:getMaxSlippage', 'Gets the Strategy Max Slippage')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Strategy Max Slippage`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'StrategyLeverageAAVEv3',
        networkConfig[strategy]?.strategyProxy ?? '',
        'getMaxSlippage',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Getting the Max Slippage = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('strategy:getMaxLoanToValue', 'Get Max Target Loan To value')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Max Target LTV`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'StrategyLeverageAAVEv3',
        networkConfig[strategy]?.strategyProxy ?? '',
        'getMaxLoanToValue',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Max LTV = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('strategy:getLoanToValue', 'Set Target Loan To value')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Target LTV `).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'StrategyLeverageAAVEv3',
        networkConfig[strategy]?.strategyProxy ?? '',
        'getLoanToValue',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 LTV = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('strategy:setMaxLoanToValue', 'Set Max Target Loan To value')
  .addParam('value', 'The new max LTV')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Max Target LTV ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'StrategyLeverageAAVEv3',
        networkConfig[strategy]?.strategyProxy ?? '',
        'setMaxLoanToValue',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Max LTV Changed to  ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });
task('strategy:setLoanToValue', 'Set Target Loan To value')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .addParam('value', 'The new target LTV')
  .setAction(async ({ value, strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Target LTV ${value}`).start();
    try {
      let app = await getClient(ethers);
      await app?.send(
        'StrategyLeverageAAVEv3',
        networkConfig[strategy]?.strategyProxy ?? '',
        'setLoanToValue',
        [value],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Target LTV Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });
task('strategy:getNrLoops', 'Get Recursive Number of Loops')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async ({ strategy }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Nr Loop ${networkConfig[strategy]?.settings}`).start();
    try {
      let app = await getClient(ethers);
      const value = await app?.call(
        'StrategyLeverageAAVEv3',
        networkConfig[strategy]?.strategyProxy ?? '',
        'getNrLoops',
        [],
        {
          chainId: network.config.chainId,
        },
      );
      spinner.succeed(`🧑‍🍳 Nr of Loops = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail('Failed 💥');
    }
  });

task('strategy:position', 'Position Resume')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .addParam('aaveMarket', 'AAVEv3 Market', AAVEv3MarketNames.AAVE_V3)
  .setAction(async ({ strategy, aaveMarket }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const deployConfig = NetworkDeployConfig[networkName];
    try {
      const aavePool = await ethers.getContractAt('IPoolV3', deployConfig.aaveMarket[aaveMarket]);
      const vault = await ethers.getContractAt('Vault', networkConfig[strategy]?.vaultProxy ?? '');
      const ethReserveData = await aavePool.getReserveData(deployConfig.weth);
      const wstETHReserveData = await aavePool.getReserveData(deployConfig.wstETH);
      const awethToken = await ethers.getContractAt(
        'ERC20',
        ethReserveData.variableDebtTokenAddress,
      );
      const awstETH = await ethers.getContractAt('ERC20', wstETHReserveData.aTokenAddress);
      const collateralBalance = await awstETH.balanceOf(
        networkConfig[strategy]?.strategyProxy ?? '',
      );
      const debtBalance = await awethToken.balanceOf(networkConfig[strategy]?.strategyProxy ?? '');

      const collateralOracle = await ethers.getContractAt(
        'PythOracle',
        networkConfig[strategy]?.collateralOracle ?? '',
      );
      const debtOracle = await ethers.getContractAt(
        'PythOracle',
        networkConfig[strategy]?.debtOracle ?? '',
      );
      const collateralPrice = await collateralOracle.getLatestPrice();
      const ethPrice = await debtOracle.getLatestPrice();
      const totalAssets = await vault.totalAssets();
      const colleralInUSD = BigInt(collateralBalance * collateralPrice.price) / 10n ** 18n;
      const debtInUSD = BigInt(debtBalance * ethPrice.price) / 10n ** 18n;

      console.log(
        `${new Date().toLocaleString()} ` +
          `TVL = ${ethers.formatUnits(totalAssets)} USD ` +
          `Collateral=${ethers.formatUnits(colleralInUSD)} ETH ` +
          `Debt=${ethers.formatUnits(debtBalance)} ETH ` +
          `LTV=${BigInt(debtInUSD * 10000n) / BigInt(colleralInUSD)} %, ` +
          `wstETH/USD =${ethers.formatUnits(collateralPrice.price)} ` +
          `ETH/USD ${ethers.formatUnits(ethPrice.price)} `,
      );
    } catch (e) {
      console.log(e);
    }
  });
