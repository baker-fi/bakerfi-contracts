import { task } from 'hardhat/config';

task('balance', "Prints an account's balance")
  .addParam('account', "The account's address")
  .setAction(async (taskArgs, { ethers, network }) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);
    console.log(`🧑‍🍳 Account Balance ${taskArgs.account} = ${ethers.formatEther(balance)} ETH`);
  });
