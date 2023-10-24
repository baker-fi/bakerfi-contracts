import ora from "ora";
import { task } from "hardhat/config";
import Config from "./config";

task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, { ethers }) => {
    const balance = await ethers.provider.getBalance(taskArgs.account);
    console.log(
      `🧑‍🍳 Account Balance ${taskArgs.account} = ${ethers.formatEther(
        balance
      )} ETH`
    );
  });

task("vault:deposit", "Deposit ETH on the vault")
  .addParam("account", "The account's address")
  .addParam("amount", "The ETH deposited amount")
  .setAction(async ({ account, amount }, { ethers }) => {
    const spinner = ora(`Depositing ${account} ${amount}`).start();      
    try {     
        const vault = await ethers.getContractAt(
        "BakerFiVault",
        Config.local.vault
      );
      const signer = await getSignerOrThrow(ethers, account);      
      await vault.connect(signer).deposit(signer.address, {
        value: ethers.parseUnits(amount, 18),
      });
      spinner.succeed(`Deposited ${account} ${amount} ETH 🧑‍🍳`);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
  });

task("vault:withdraw", "Burn brETH shares and receive ETH")
  .addParam("account", "The account's address")
  .addParam("amount", "The brETH deposited amount")
  .setAction(async ({ account, amount }, { ethers }) => {
    const spinner = ora(`Withdrawing ${account} ${amount}`).start();
    try {
      const signer = await getSignerOrThrow(ethers, account);
      const vault = await ethers.getContractAt(
        "BakerFiVault",
        Config.local.vault
      );
      await vault.connect(signer).withdraw(ethers.parseUnits(amount, 18));
      spinner.succeed(`Withdrawed ${account} ${amount} ETH 🧑‍🍳`);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
  });

task("vault:rebalance", "Burn brETH shares and receive ETH")
  .addParam("account", "The account's address")
  .setAction(async ({ account }, { ethers }) => {

    const spinner = ora(`Rebalancing Vault ${account} `).start();
    try {
        const signer = await getSignerOrThrow(ethers, account);
        const vault = await ethers.getContractAt(
          "BakerFiVault",
          Config.local.vault
        );
        await vault.connect(signer).rebalance();
        spinner.succeed(`🧑‍🍳 Vault Rebalanced 🍰`);
      } catch (e) {
        console.log(e);
        spinner.fail("Failed 💥");
      }
});

task("vault:balance", "Prints an account's share balance")
  .addParam("account", "The account's address")
  .setAction(async ({ account }, { ethers }) => {
    const spinner = ora(`Geeting ${account} balance`).start();
    const signers = await ethers.getSigners();
    try {
        const vault = await ethers.getContractAt(
          "BakerFiVault",
          Config.local.vault
        );

        const balance = await vault.balanceOf(account);
        console.log(account);
        spinner.succeed(`🧑‍🍳 Account Balance ${account} = ${ethers.formatEther(balance)} brETH`);
      } catch (e) {
        console.log(e);
        spinner.fail("Failed 💥");
      }
});

task("vault:assets", "Prints an account's share balance")
  .setAction(async ({}, { ethers }) => {

    const spinner = ora(`Geeting Vault Assets`).start();
    try {
        const vault = await ethers.getContractAt(
          "BakerFiVault",
          Config.local.vault
        );
        const balance = await vault.totalAssets();
        spinner.succeed(`🧑‍🍳 Vault Total Assets ${ethers.formatEther(balance)} brETH`);
      } catch (e) {
        console.log(e);
        spinner.fail("Failed 💥");
      }

  });


  task("vault:tokenPerETH", "Prints an tokenPerETH")
  .setAction(async ({}, { ethers }) => {

    const spinner = ora(`Geeting Vault Assets`).start();
    try {
        const vault = await ethers.getContractAt(
          "BakerFiVault",
          Config.local.vault
        );
        const balance = await vault.tokenPerETH();
        spinner.succeed(`🧑‍🍳 Vault tokenPerETH ${ethers.formatEther(balance)}`);
      } catch (e) {
        console.log(e);
        spinner.fail("Failed 💥");
      }

  });

async function getSignerOrThrow(ethers, address) {
  const signers = await ethers.getSigners();
  const [signer] = signers.filter(
    (signer) => signer.address.toLowerCase() === address.toLowerCase()
  );
  if (!signer) {
    throw Error("Account not found ");
  }
  return signer;
}
