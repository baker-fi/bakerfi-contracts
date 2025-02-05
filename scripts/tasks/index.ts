import { task } from 'hardhat/config';
import DeployConfig from '../../constants/contracts';
import { JsonRpcProvider, Wallet } from 'ethers';
import './build';
import './deploy';
import './oracles';
import './settings';
import './strategy';
import './token';
import './vault';
import './router';
import { StrategyImplementation } from '../../constants/types';

task('vault:resume', 'Generate an artifact tree')
  .addParam('strategy', 'Strategy Type', StrategyImplementation.AAVE_V3_WSTETH_ETH)
  .setAction(async (args, { run }) => {
    console.log('🧑‍🍳 Vault Settings resume ....');

    await run('vault:assets', args);
    await run('strategy:getLoanToValue', args);
    await run('strategy:getMaxLoanToValue', args);
    await run('settings:getWithdrawalFee', args);
    await run('settings:getPerformanceFee', args);
    await run('settings:getPriceMaxAge', args);
    await run('settings:getRebalancePriceMaxAge', args);
    await run('strategy:getNrLoops', args);
    await run('settings:getFeeReceiver', args);
    await run('settings:getMaxDeposit', args);
    await run('settings:getPriceMaxConfidence', args);
    await run('strategy:getMaxSlippage', args);
  });

task('bakerfi:loop', 'Test deposit and with loop')
  .addParam('amount', 'The ETH deposited amount')
  .addParam('loops', 'The ETH deposited amount')
  .setAction(async ({ loops, amount }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    try {
      const loopsNumber = parseInt(loops);
      for (let i = 0; i < loopsNumber; i++) {
        const value = ethers.parseUnits(amount, 18);
        const vault = await ethers.getContractAt('Vault', networkConfig.vaultProxy ?? '');
        const jsonRpcProvider = new JsonRpcProvider(
          `https://rpc.ankr.com/base/${process.env.ANKR_API_KEY}`,
        );
        const wallet = new Wallet(process.env.TEST_LOOP_KEY ?? '', jsonRpcProvider);
        // @ts-ignore
        const depositTx = await vault.connect(wallet).deposit(wallet.address, {
          value,
        });
        console.log('Transaction waiting', depositTx.hash);
        await jsonRpcProvider.waitForTransaction(depositTx.hash, 3);
        const balance = await vault.balanceOf(wallet.address);
        console.log(`Withdrawing ${balance}`);
        // @ts-ignore
        const withdrawTx = await vault.connect(wallet).withdraw(balance);
        await jsonRpcProvider.waitForTransaction(withdrawTx.hash, 3);
        console.log(`Withdrawed ${withdrawTx.hash}`);
      }
    } catch (e) {
      console.log(e);
      console.log(e.stack);
      process.exit(0);
    }
  });
0;
