import "dotenv/config";
import hre from "hardhat";
import { ethers } from "hardhat";
import BaseConfig from "./config";
import ora from "ora";
import { feeds } from "./config";
import { ContractClientWallet } from "./lib/contract-client-wallet";
import { STAGING_ACCOUNTS_PKEYS } from "../constants/test-accounts";
import { ContractClient } from "./lib/contract-client";
import { ContractClientLedger } from "./lib/contract-client-ledger";

const networkName = hre.network.name;
const chainId = hre.network.config.chainId;
hre.ethers

/****************************************
 *
 * Deploy BakerFi Vaults and support Ledger Support
 *
 ****************************************/
async function main() {

  const [signerPKey] = STAGING_ACCOUNTS_PKEYS;
  let app: ContractClient | null;
  const result: any[] = [];
  const spinner = ora("Cooking ....").start();
  if (process.env.DEPLOY_WITH_LEDGER === "true") {
    app = new ContractClientLedger(
      ethers.provider,
      process.env?.BAKERFI_LEDGER_PATH ?? "");
  } else {
    app = new ContractClientWallet(
      ethers.provider,
      signerPKey
    );
  }
  await app.init();

  result.push(["Network Name", networkName]);
  result.push(["Network Id", chainId]);
  const config = BaseConfig[networkName];
  ////////////////////////////////////
  // 1. Proxy Admin
  ////////////////////////////////////
  spinner.text = "Deploying ProxyAdmin Contract ...";
  const proxyAdminReceipt = await app.deploy(
    "BakerFiProxyAdmin",
    [app.getAddress()],
    {
      chainId,
    }
  );
  result.push([
    "Proxy Admin",
    proxyAdminReceipt?.contractAddress,
    proxyAdminReceipt?.hash,
  ]);
  ////////////////////////////////////
  // 2. Math Library
  ////////////////////////////////////
  spinner.text = "Deploying Math Library";
  const mathLibraryReceipt = await app.deploy("MathLibrary", [], {
    chainId,
  });
  result.push([
    "Math Library",
    mathLibraryReceipt?.contractAddress,
    mathLibraryReceipt?.hash,
  ]);
  ////////////////////////////////////
  // 3. Service Registry
  ////////////////////////////////////
  spinner.text = "Deploying Registry";
  const registryReceipt = await app.deploy(
    "ServiceRegistry",
    // Owner
    [app.getAddress()],
    {
      chainId,
    }
  );
  result.push([
    "ServiceRegistry",
    registryReceipt?.contractAddress,
    registryReceipt?.hash,
  ]);
  ////////////////////////////////////
  // 4. Registering WETH Address
  ////////////////////////////////////
  spinner.text = "Registering WETH Address";
  const wethRegReceipt = await app.send(
    "ServiceRegistry",
    registryReceipt?.contractAddress ?? "",
    "registerService",
    [ethers.keccak256(Buffer.from("WETH")), config.weth],
    {
      chainId,
    }
  );
  result.push(["WETH", config.weth, wethRegReceipt?.hash]);
  ////////////////////////////////////
  // 5. Deploy Global Settings
  ////////////////////////////////////
  const settingsAddress = await deploySettings(
    app,
    spinner,
    proxyAdminReceipt?.contractAddress,
    registryReceipt?.contractAddress,
    app.getAddress(),
    result
  );
  ////////////////////////////////////
  // 6. Registering Uniswap Router 02
  ////////////////////////////////////
  spinner.text = `Registiring Uniswap Router Contract ${config.uniswapRouter02}`;
  const routerReceipt = await app.send(
    "ServiceRegistry",
    registryReceipt?.contractAddress ?? "",
    "registerService",
    [ethers.keccak256(Buffer.from("Uniswap Router")), config.uniswapRouter02],
    {
      chainId,
    }
  );
  result.push(["Uniswap Router", config.uniswapRouter02, routerReceipt?.hash]);
  ////////////////////////////////////
  // 7. Registering Uniswap Quoter
  ////////////////////////////////////
  spinner.text = `Registiring Uniswap Quoter Contract ${config.uniswapRouter02}`;
  const quoterReceipt = await app.send(
    "ServiceRegistry",
    registryReceipt?.contractAddress ?? "",
    "registerService",
    [ethers.keccak256(Buffer.from("Uniswap Quoter")), config.uniswapQuoter],
    {
      chainId,
    }
  );
  result.push(["Uniswap Quoter", config.uniswapQuoter, quoterReceipt?.hash]);
  ////////////////////////////////////
  //  8. AAVE Vault
  ////////////////////////////////////
  spinner.text = `Registiring AAVE v3 Contract`;
  const aaveReceipt = await app.send(
    "ServiceRegistry",
    registryReceipt?.contractAddress ?? "",
    "registerService",
    [ethers.keccak256(Buffer.from("AAVE_V3")), config.AAVEPool],
    {
      chainId,
    }
  );
  result.push(["AAVE v3 Pool", config.AAVEPool, aaveReceipt?.hash]);
  ////////////////////////////////////
  // 9. Register Balancer Vault
  ////////////////////////////////////
  spinner.text = `Registiring Balancer Vault`;
  const balancerReceipt = await app.send(
    "ServiceRegistry",
    registryReceipt?.contractAddress ?? "",
    "registerService",
    [ethers.keccak256(Buffer.from("Balancer Vault")), config.balancerVault],
    {
      chainId,
    }
  );
  result.push(["Balancer Pool", config.balancerVault, balancerReceipt?.hash]);
  ////////////////////////////////////
  // 10. Flash Lender Adapter
  ////////////////////////////////////
  spinner.text = "Deploying Flash Lender Contract ...";
  const flashLenderReceipt = await app.deploy(
    "BalancerFlashLender",
    [registryReceipt?.contractAddress ?? ""],
    {
      chainId,
      factoryOptions: {
        libraries: {
          MathLibrary: mathLibraryReceipt?.contractAddress,
        },
      },
    }
  );
  await app.send(
    "ServiceRegistry",
    registryReceipt?.contractAddress ?? "",
    "registerService",
    [
      ethers.keccak256(Buffer.from("FlashLender")),
      flashLenderReceipt?.contractAddress,
    ],
    {
      chainId,
    }
  );

  result.push([
    "Flash Lender",
    flashLenderReceipt?.contractAddress,
    flashLenderReceipt?.hash,
  ]);
  ////////////////////////////////////
  // 11. Wrapped stETH
  ////////////////////////////////////
  if (config.wstETH) {
    const wstETHReceipt = await app.send(
      "ServiceRegistry",
      registryReceipt?.contractAddress ?? "",
      "registerService",
      [ethers.keccak256(Buffer.from("wstETH")), config.wstETH],
      {
        chainId,
      }
    );
    result.push(["wstETH", config.wstETH, wstETHReceipt?.hash]);
  }
  ////////////////////////////////////
  // 12. Oracles
  ////////////////////////////////////
  await deployOracles(
    app,
    chainId ?? 0,
    config,
    registryReceipt?.contractAddress ?? "",
    spinner,
    result
  );
  ////////////////////////////////////
  // 13. Deploy Strategy
  ////////////////////////////////////
  const strategyAddress = await deployStrategy(
    app,
    chainId,
    spinner,
    proxyAdminReceipt?.contractAddress,
    app.getAddress(),
    registryReceipt?.contractAddress,
    config,
    result
  );
  ////////////////////////////////////
  // 14. Deploy Vault
  ////////////////////////////////////
  const vaultAdress = await deployVault(
    app,
    chainId ?? 0,
    spinner,
    proxyAdminReceipt?.contractAddress ?? "",
    app.getAddress(),
    config,
    registryReceipt?.contractAddress,
    strategyAddress,
    mathLibraryReceipt?.contractAddress,
    result
  );
  ////////////////////////////////////
  // 15. Update the Strategy Default Settings
  ////////////////////////////////////
  spinner.text = "Transferring Ownership ...";
  const changeOwnerReceipt = await app.send(
    "StrategyAAVEv3",
    strategyAddress ?? "",
    "transferOwnership",
    [vaultAdress],
    {
      chainId,
    }
  );
  result.push(["Strategy Owner", vaultAdress, changeOwnerReceipt?.hash]);

  spinner.text = "Changing LTV ...";
  const ltvChangeReceipt = await app.send(
    "StrategyAAVEv3",
    strategyAddress ?? "",
    "setLoanToValue",
    [ethers.parseUnits("800", 6)],
    {
      chainId,
    }
  );
  result.push([
    "Strategy LTV",
    ethers.parseUnits("800", 6),
    ltvChangeReceipt?.hash,
  ]);

  spinner.succeed("🧑‍🍳 BakerFi Served 🍰 ");
  console.table(result);
  process.exit(0);
}

async function deployVault(
  client: ContractClient,
  chainId: number,
  spinner: ora.Ora,
  proxyAdminAddress: string | null | undefined,
  owner: string,
  config: any,
  registryAddress: string | null | undefined,
  strategyAddress: string | null | undefined,
  mathLibraryAddress: string | null | undefined,
  result: any[]
) {
  spinner.text = "Deploying Vault";
  const vaultReceipt = await client.deploy("Vault", [], {
    chainId,
    factoryOptions: {
      libraries: {
        MathLibrary: mathLibraryAddress,
      },
    },
  });

  const Vault = await ethers.getContractFactory("Vault");
  const vaultProxyReceipt = await client.deploy(
    "BakerFiProxy",
    [
      vaultReceipt?.contractAddress,
      proxyAdminAddress,
      Vault.interface.encodeFunctionData("initialize", [
        owner,
        config.vaultSharesName,
        config.vaultSharesSymbol,
        registryAddress,
        strategyAddress,
      ]),
    ],
    {
      chainId: chainId,
    }
  );
  result.push([
    "Vault",
    vaultReceipt?.contractAddress,
    vaultProxyReceipt?.hash,
  ]);
  result.push([
    "Vault Proxy",
    vaultProxyReceipt?.contractAddress,
    vaultProxyReceipt?.hash,
  ]);
  return vaultProxyReceipt?.contractAddress;
}

async function deployStrategy(
  client: ContractClient,
  chainId: number | null | undefined,
  spinner: ora.Ora,
  proxyAdminAddress: string | null | undefined,
  ownerAddress: string | null | undefined,
  registryAddress: string | null | undefined,
  config: any,
  result: any[]
) {
  spinner.text = "Deploying Strategy";
  const strategyReceipt = await client.deploy("StrategyAAVEv3", [], {
    chainId,
  });
  const Strategy = await ethers.getContractFactory("StrategyAAVEv3");
  spinner.text = "Deploying Strategy Proxy";
  const strategyProxyReceipt = await client.deploy(
    "BakerFiProxy",
    [
      strategyReceipt?.contractAddress,
      proxyAdminAddress,
      Strategy.interface.encodeFunctionData("initialize", [
        ownerAddress,
        ownerAddress,
        registryAddress,
        ethers.keccak256(Buffer.from(config.strategy.collateral)),
        ethers.keccak256(Buffer.from(config.strategy.oracle)),
        config.swapFeeTier,
        config.AAVEEModeCategory,
      ]),
    ],
    {
      chainId,
    }
  );
  result.push([
    "Strategy",
    strategyReceipt?.contractAddress,
    strategyReceipt?.hash,
  ]);
  result.push([
    "Strategy Proxy",
    strategyProxyReceipt?.contractAddress,
    strategyProxyReceipt?.hash,
  ]);

  return strategyProxyReceipt?.contractAddress;
}

async function deployOracles(
  client: ContractClient,
  chainId: number,
  config,
  registryAddress: string,
  spinner,
  result
) {
  for (const oracle of config.oracles) {
    spinner.text = `Deploying ${oracle.pair} Oracle`;
    let feedId;
    let oracleName = "";
    switch (oracle.pair) {
      case "cbETH/USD":
        feedId = feeds.CBETHUSDFeedId;
        oracleName = "cbETH/USD Oracle";
        break;
      case "wstETH/USD":
        feedId = feeds.WSETHUSDFeedId;
        oracleName = "wstETH/USD Oracle";
        break;
      case "ETH/USD":
        feedId = feeds.ETHUSDFeedId;
        oracleName = "ETH/USD Oracle";
        break;
      default:
        throw Error("Unknow Oracle type");
    }
    const oracleReceipt = await client.deploy(
      "PythOracle",
      [feedId, config.pyth],
      {
        chainId,
      }
    );
    spinner.text = `Registering ${oracle.pair} Oracle`;
    await client.send(
      "ServiceRegistry",
      registryAddress,
      "registerService",
      [
        ethers.keccak256(Buffer.from(oracleName)),
        oracleReceipt?.contractAddress,
      ],
      {
        chainId,
      }
    );
    result.push([
      `${oracle.pair} Oracle`,
      oracleReceipt?.contractAddress,
      oracleReceipt?.hash,
    ]);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/**
 *
 * @param spinner
 * @param ethApp
 * @param ledgerPath
 * @param proxyAdminAddress
 * @param owner
 * @param result
 * @returns
 */
async function deploySettings(
  client: ContractClient,
  spinner: ora.Ora,
  proxyAdminAddress: string | null | undefined,
  registryContractAddress: string | null | undefined,
  owner: string,
  result: any[]
) {
  spinner.text = "Deploying Settings";
  const settingsReceipt = await client.deploy("Settings", [], {
    chainId,
  });
  const Settings = await ethers.getContractFactory("Settings");

  spinner.text = "Deploying Settings Proxy";
  const settingsProxyReceipt = await client.deploy(
    "BakerFiProxy",
    [
      settingsReceipt?.contractAddress,
      proxyAdminAddress,
      Settings.interface.encodeFunctionData("initialize", [owner]),
    ],
    {
      chainId,
    }
  );

  spinner.text = "Registering Settings Address";
  await client.send(
    "ServiceRegistry",
    registryContractAddress ?? "",
    "registerService",
    [
      ethers.keccak256(Buffer.from("Settings")),
      settingsProxyReceipt?.contractAddress,
    ],
    {
      chainId,
    }
  );

  result.push([
    "Settings",
    settingsReceipt?.contractAddress,
    settingsReceipt?.hash,
  ]);
  result.push([
    "Settings Proxy",
    settingsProxyReceipt?.contractAddress,
    settingsReceipt?.hash,
  ]);

  return settingsProxyReceipt?.contractAddress;
}
