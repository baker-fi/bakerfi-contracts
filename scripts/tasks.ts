import ora from "ora";
import { ErrorDecoder } from 'ethers-decode-error'
import { task } from "hardhat/config";
import DeployConfig from "../constants/contracts";
import {pythFeedIds} from "../constants/contracts";
import {PriceServiceConnection} from "@pythnetwork/price-service-client";



task("balance", "Prints an account's balance")
  .addParam("account", "The account's address")
  .setAction(async (taskArgs, { ethers, network }) => {

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
  .setAction(async ({ account, amount }, { ethers, network}) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Depositing ${account} ${amount}`).start();      
    try {     
        const vault = await ethers.getContractAt(
        "Vault",
        networkConfig.vaultProxy?? ""
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
  .setAction(async ({ account, amount }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Withdrawing ${account} ${amount}`).start();
    try {
      const signer = await getSignerOrThrow(ethers, account);
      const vault = await ethers.getContractAt(
        "Vault",
        networkConfig.vaultProxy?? ""
      );
      await vault.connect(signer).withdraw(ethers.parseUnits(amount, 18));
      spinner.succeed(`Withdrawed ${account} ${amount} ETH 🧑‍🍳`);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
  });

task("vault:rebalance", "Burn brETH shares and receive ETH")
  .setAction(async ({ account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Rebalancing Vault ${account} `).start();
    try {
        const vault = await ethers.getContractAt(
          "Vault",
          networkConfig.vaultProxy?? ""
        );
        await vault.rebalance();
        spinner.succeed(`🧑‍🍳 Vault Rebalanced 🍰`);
      } catch (e) {
        console.log(e);
        spinner.fail("Failed 💥");
      }
});

task("vault:balance", "Prints an account's share balance")
  .addParam("account", "The account's address")
  .setAction(async ({ account }, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Geeting ${account} balance`).start();
    const signers = await ethers.getSigners();
    try {
        const vault = await ethers.getContractAt(
          "Vault",
          networkConfig.vaultProxy?? ""
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
  .setAction(async ({}, { ethers, network}) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Geeting Vault Assets`).start();
    try {
        const vault = await ethers.getContractAt(
          "Vault",
          networkConfig.vaultProxy?? ""
        );
        const balance = await vault.totalAssets();
        spinner.succeed(`🧑‍🍳 Vault Total Assets ${ethers.formatEther(balance)} ETH`);
      } catch (e) {
        console.log(e);
        spinner.fail("Failed 💥");
      }

  });


  task("vault:tokenPerETH", "Prints an tokenPerETH")
  .setAction(async ({}, { ethers, network}) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Geeting Vault Assets`).start();
    try {
        const vault = await ethers.getContractAt(
          "Vault",
          networkConfig.vaultProxy?? ""
        );
        const balance = await vault.tokenPerETH();
        spinner.succeed(`🧑‍🍳 Vault tokenPerETH ${ethers.formatEther(balance)}`);
      } catch (e) {
        console.log(e);
        spinner.fail("Failed 💥");
      }

  });


task("strategy:setLoanToValue", "Set Target Loan To value")
  .addParam("value", "The new target LTV")
  .setAction(async ({value}, { ethers, network}) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Target LTV ${value}`).start();
    try {
      const strategy = await ethers.getContractAt(
        "StrategyAAVEv3",
        networkConfig.strategyProxy?? ""
      );
      await strategy.setLoanToValue(value);
      spinner.succeed(`🧑‍🍳 Target LTV Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});

task("strategy:getLoanToValue", "Set Target Loan To value")
  .setAction(async ({value}, { ethers, network}) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Target LTV `).start();
    try {
      const strategy = await ethers.getContractAt(
        "StrategyAAVEv3",
        networkConfig.strategyProxy?? ""
      );
      const value = await strategy.getLoanToValue();
      spinner.succeed(`🧑‍🍳 LTV = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("strategy:setMaxLoanToValue", "Set Max Target Loan To value")
  .addParam("value", "The new max LTV")
  .setAction(async ({value}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Max Target LTV ${value}`).start();
    try {
      const strategy = await ethers.getContractAt(
        "StrategyAAVEv3",
        networkConfig.strategyProxy?? ""
      );
      await strategy.setMaxLoanToValue(value);
      spinner.succeed(`🧑‍🍳 Max LTV Changed to  ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("strategy:getMaxLoanToValue", "Get Max Target Loan To value")
  .setAction(async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Max Target LTV`).start();
    try {
      const strategy = await ethers.getContractAt(
        "StrategyAAVEv3",
        networkConfig.strategyProxy?? ""
      );
      const value = await strategy.getMaxLoanToValue();
      spinner.succeed(`🧑‍🍳 Max LTV ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("settings:setWithdrawalFee", "Set Withdrawal Fee")
  .addParam("value", "Withdrawal Fee")
  .setAction(async ({value}, { ethers, network}) => {    
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Withdrawal Fee to ${value}`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      await settings.setWithdrawalFee(value);
      spinner.succeed(`🧑‍🍳 Withdrawal Fee Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});

task("settings:getWithdrawalFee", "get Withdrawal Fee")
  .setAction(async ({}, { ethers, network}) => {    
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting Withdrawal Fee`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      const value = await settings.getWithdrawalFee();
      spinner.succeed(`🧑‍🍳 Withdrawal Fee = ${value}`);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("settings:setPerformanceFee", "Set Performance Fee")
  .addParam("value", "The new performance fee")
  .setAction(async ({value}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Performance Fee to ${value}`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      await settings.setPerformanceFee(value);
      spinner.succeed(`🧑‍🍳 Performance Fee Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});

task("settings:getPerformanceFee", "Get Performance Fee")  
  .setAction(async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Performance Fee`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      const value = await settings.getPerformanceFee();
      spinner.succeed(`🧑‍🍳 Performance Fee = ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("settings:setFeeReceiver", "Set Fee Receiver Accoutn")
  .addParam("account", "The new max LTV")
  .setAction(async ({account}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Fee Revceiver to ${account}`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      await settings.setFeeReceiver(account);
      spinner.succeed(`🧑‍🍳 Fee Receiver Account Changed to ${account} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("strategy:getNrLoops", "Get Recursive Number of Loops")
  .setAction(async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Nr Loop ${networkConfig.settings}`).start();
    try {
      const strategy = await ethers.getContractAt(
        "StrategyAAVEv3",
        networkConfig.strategyProxy?? ""
      );
      const value = await strategy.getNrLoops();
      spinner.succeed(`🧑‍🍳 Nr of Loops ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("strategy:setNrLoops", "Set number of Loopps")
  .addParam("value", "loop coount")
  .setAction(async ({value}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Nr Of Loops to ${value}`).start();
    try {
      const strategy = await ethers.getContractAt(
        "StrategyAAVEv3",
        networkConfig.strategyProxy?? ""
      );
      await strategy.setNrLoops(value);
      spinner.succeed(`🧑‍🍳 Nr of Loops Changed to ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("settings:getFeeReceiver", "Get Fee Receiver Account")
  .setAction(async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Fee Revceiver`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      const value = await settings.getFeeReceiver();
      spinner.succeed(`🧑‍🍳 Fee Receiver Account ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("settings:enableAccount", "Enable an account on the whitelist")
  .addParam("account", "Accoun to enable")
  .addParam("enabled", "enabled")  
  .setAction(async ({account, enabled}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Setting ${account} has ${enabled}`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      const owner = await settings.owner();
      console.log(`owner = ${owner}`);
      await settings.enableAccount(account, enabled=="true");
      spinner.succeed(`🧑‍🍳 Account ${account} now is enabled=${enabled} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});



task("settings:isAccountEnabled", "Enable an account on the whitelist")
  .addParam("account", "Accoun to enable")
  .setAction(async ({account}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Checking Whitelist for ${account}`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      const res = await settings.isAccountEnabled(account);
      spinner.succeed(`🧑‍🍳 Account ${account} is enabled? ${res} `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});

task("oracle:collateral", "Get the wstETH/ETH Price from Oracle") 
  .setAction(async ({account}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Getting On Chain Price ${account}`).start();
    try {
      const oracle = await ethers.getContractAt(
        "WstETHToETHOracle",
        networkConfig.wstETHETHOracle
      );
      const price = await oracle.getLatestPrice();
      const precision = await oracle.getPrecision();
      spinner.succeed(`🧑‍🍳 Price is ${price} - ${precision}`);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});

task("deploy:upgrade:settings", "Upgrade the settings Contract") 
  .setAction(async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Upgrading Settings Contract`).start();
    try {
      const Settings = await ethers.getContractFactory("Settings");   
      const settings = await Settings.deploy();
      await settings.waitForDeployment();
      const proxyAdmin = await ethers.getContractAt("ProxyAdmin", networkConfig?.proxyAdmin?? "");
      await proxyAdmin.upgrade(
        networkConfig.settingsProxy,
        await settings.getAddress(),
      )
      spinner.succeed(`New Settings Contract is ${await settings.getAddress()}`);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});

task("deploy:upgrade:strategy", "Upgrade the settings Contract") 
  .setAction(async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Upgrading strategy Contract`).start();
    try {
      const StrategyAAVEv3 = await ethers.getContractFactory("StrategyAAVEv3");   
      const strategy = await StrategyAAVEv3.deploy();
      await strategy.waitForDeployment();
      const proxyAdmin = await ethers.getContractAt("ProxyAdmin", networkConfig?.proxyAdmin?? "");
      await proxyAdmin.upgrade(
        networkConfig.strategyProxy,
        await strategy.getAddress(),
      )
      spinner.succeed(`New Strategy Contract is ${await strategy.getAddress()}`);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("deploy:upgrade:vault", "Upgrade the settings Contract") 
  .setAction(async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Upgrading Vault Contract`).start();
    try {
      const Vault = await ethers.getContractFactory("Vault");   
      const vault = await Vault.deploy();
      await vault.waitForDeployment();
      const proxyAdmin = await ethers.getContractAt("ProxyAdmin", networkConfig?.proxyAdmin?? "");
      await proxyAdmin.upgrade(
        networkConfig.vaultProxy,
        await vault.getAddress(),
      )
      spinner.succeed(`New Vault Contract is ${await vault.getAddress()}`);
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



task("settings:setMaxDeposit", "Set Max Deposit")
  .addParam("value", "Max Deposit")
  .setAction(async ({value}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Settting Max Deposit in ETH ${value}`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      await settings.setMaxDepositInETH(value);
      spinner.succeed(`🧑‍🍳 Max Deposit In ETH is ${value} ✅ `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("settings:getMaxDeposit", "Get Fee Receiver Account")
  .setAction(async ({}, { ethers, network }) => {
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    const spinner = ora(`Gettting Max Deposit in ETH`).start();
    try {
      const settings = await ethers.getContractAt(
        "Settings",
        networkConfig.settingsProxy?? ""
      );
      const value = await settings.getMaxDepositInETH();
      spinner.succeed(`🧑‍🍳 Max Deposit in ETH ${value} `);
    } catch (e) {
      console.log(e);
      spinner.fail("Failed 💥");
    }
});


task("pyth:priceUpdate", "Update Required Prices")
.setAction(async ({}, { ethers, network }) => {
  const networkName = network.name;
  const networkConfig = DeployConfig[networkName];
  const spinner = ora(`Pyth Price Updates`).start();
  try {

    const connection = new PriceServiceConnection(
      "https://hermes.pyth.network", {
      priceFeedRequestConfig: {
        // Provide this option to retrieve signed price updates for on-chain contracts.
        // Ignore this option for off-chain use.
        binary: true,
      },
    }); // See Hermes endpoints section below for other endpoints

    const priceIds = [
      // You can find the ids of prices at https://pyth.network/developers/price-feed-ids
      pythFeedIds.CBETH_USD_FEED_ID, // BTC/USD price id
      pythFeedIds.ETH_USD_FEED_ID,
      pythFeedIds.WSETH_USD_FEED_ID, // ETH/USD price id
    ];
    // Get the latest values of the price feeds as json objects.
    // If you set `binary: true` above, then this method also returns signed price updates for the on-chain Pyth contract.
    const currentPrices = await connection.getLatestPriceFeeds(priceIds);
    const networkName = network.name;
    const networkConfig = DeployConfig[networkName];
    // You can also call this function to get price updates for the on-chain contract directly.   
    const pyth = await ethers.getContractAt(
      "IPyth",
      networkConfig.pyth?? ""
    );
   
    const vaas = currentPrices?.map(feed=>Buffer.from(feed.vaa, 'base64'));

    console.log("Updating Prices...");
    const fee = await pyth.getUpdateFee(vaas);

    console.log("Feee", fee);
    await pyth.updatePriceFeeds(vaas, { value: fee});

    spinner.succeed(`🧑‍🍳 Pyth Price Updates`);
  } catch (e) {
    console.log(`${e.reason} - ${e.code}`);
    spinner.fail("Failed 💥");
  }
});