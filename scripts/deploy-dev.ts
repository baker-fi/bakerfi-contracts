import { ethers, network } from "hardhat";
import {
  deployAaveV3,
  deployFlashLender,
  deployServiceRegistry,
  deployStEth,
  deploySwapper,
  deployQuoterV2Mock,
  deployVault,
  deployWETH,
  deployOracleMock,
  deployWStEth,
  deployAAVEv3StrategyWstETH,
  deploySettings,
} from "./common";
import os from "os";
import Handlebars  from 'handlebars';
import fs from 'fs';
import BaseConfig from "./config";
const CHAIN_CAST_API = process.env.CHAIN_CAST_API || 'http://localhost:55000/api/graphql';
import { request, gql } from 'graphql-request'

/**
 * Deploy the Basic System for testing 
 */
async function main() {

  const networkName = network.name;
  const chainId = network.config.chainId;
  console.log("Network name = ", networkName);
  console.log("Network chain id =", chainId);
  const config = BaseConfig[networkName];

  // Max Staked ETH available
  console.log("---------------------------------------------------------------------------");
  console.log("💥 BakerFi Deploying ....");
  const STETH_MAX_SUPPLY = ethers.parseUnits("1000000000", 18);
  const FLASH_LENDER_DEPOSIT = ethers.parseUnits("10000", 18);
  const AAVE_DEPOSIT = ethers.parseUnits("10000", 18);

  const [owner] = await ethers.getSigners();
  // 1. Deploy the Service Registry
  const serviceRegistry = await deployServiceRegistry(owner.address);
  console.log("Service Registry =", await serviceRegistry.getAddress());
  // 3. Deploy the WETH 
  const weth = await deployWETH(serviceRegistry);
  console.log("WETH =", await weth.getAddress());
  // 4. Deploy the Vault attached to Leverage Lib
  const flashLender = await deployFlashLender(serviceRegistry, weth, FLASH_LENDER_DEPOSIT);
  console.log("FlashLender Mock =", await flashLender.getAddress());
  // 5. Deploy stETH ERC-20
  const stETH = await deployStEth(serviceRegistry, owner, STETH_MAX_SUPPLY);
  console.log("stETH =", await stETH.getAddress());
  // 6. Deploy wstETH ERC-20
  const wstETH  = await deployWStEth(serviceRegistry, await stETH.getAddress());
  console.log("wstETH =", await wstETH.getAddress());
  const settings  = await deploySettings(owner.address, serviceRegistry);
  console.log("feeSettings =", await settings.getAddress());
  // 7. Deploy wETH/stETH Swapper
  const swapper = await deploySwapper(weth, stETH, serviceRegistry, STETH_MAX_SUPPLY);
  // 7. Addd Pair
  await swapper.addPair(
    await weth.getAddress(),
    await wstETH.getAddress()
  );

  console.log("Swap Router Mock =", await swapper.getAddress());
  // 8. Deploy AAVE Mock Service
  const aaveV3PoolMock = await deployAaveV3(wstETH, weth, serviceRegistry, AAVE_DEPOSIT); 
  console.log("AAVE v3 Mock =", await aaveV3PoolMock.getAddress());
  // 9. Deploy wstETH/ETH Oracle 
  const uniQuoter = await deployQuoterV2Mock(serviceRegistry);
  console.log("Uniswap Quoter =", await uniQuoter.getAddress() );  
  const oracle = await deployOracleMock(serviceRegistry, "wstETH/ETH Oracle");
  console.log("wstETH/ETH Oracle =", await oracle.getAddress() );  
  const ethOracle = await deployOracleMock(serviceRegistry, "ETH/USD Oracle");    
  console.log("ETH/USD Oracle =", await ethOracle.getAddress() );  
  await ethOracle.setLatestPrice(ethers.parseUnits("1", 18));
  const strategy = await deployAAVEv3StrategyWstETH( 
    owner.address,
    await serviceRegistry.getAddress(), 
    config.swapFeeTier,
    config.AAVEEModeCategory,
  );
  // 10. Deploy the Vault attached to Leverage Lib
  const vault = await deployVault(
      owner.address, 
      await serviceRegistry.getAddress(),
      await strategy.getAddress() 
  );
  
  const vaultAddress = await vault.getAddress();
  console.log("BakerFi Vault =", vaultAddress);  
  console.log("BakerFi Vault AAVEv3 Strategy =", await strategy.getAddress());
  console.log("WSETH/ETH Oracle =", await oracle.getAddress());
  
  const Vault = await ethers.getContractFactory("BakerFiVault");
  const AAVEv3StrategyWstETH = await ethers.getContractFactory("AAVEv3StrategyWstETH");
  
  const vaultABI = JSON.stringify(Vault.interface.formatJson());
  const AAVEv3StrategyWstETHABI = JSON.stringify(Vault.interface.formatJson());


  const latestBlock = await ethers.provider.getBlock("latest");
  await strategy.transferOwnership(await vault.getAddress());

  // Start Chain Cast Listeners
  await createContractCast(
    vaultAddress,
    latestBlock?.number ?? 0,
    Buffer.from(vaultABI).toString('base64'),
    1337,
    "CUSTOM",
    "bakerfi-chain-events"
  );

  console.log("---------------------------------------------------------------------------");
  console.log("💥 BakerFi Deployment Done 👏");
}


/**
 * Function to setup a Contract Cast 
 * @param address 
 * @param blockNumber 
 * @param abi 
 * @param chainId 
 * @param type 
 * @param queue 
 */
async function createContractCast(
  address: string,
  blockNumber: number,  
  abi: string,
  chainId: number,
  type: string,
  queue: string
) {
  const pogramTemplate = fs.readFileSync(
    'scripts/chain-cast-program.json.hs', 'utf8');
  const template = Handlebars.compile(pogramTemplate);   
  const program = template({
    queue,
  });
  const encodedProgram = Buffer.from(program).toString('base64');
  const variables = {
    address,
    chainId,
    blockNumber,
    type,
    program: encodedProgram,
  };
  const data: { id: string }  = await request(CHAIN_CAST_API, CREATE_CONTRACT_CAST, variables);
  console.log(`Created the stream id ${data.id}`);
}


const CREATE_CONTRACT_CAST = gql`
  mutation createStream(
    $address: String!
    $chainId: Int!
    $abi: String!
    $type: ContractCastType!
    $blockNumber: Int!
    $program: String!
  ) {
    createContractCast(
      data: {
        address: $address
        chainId: $chainId
        startFrom: $blockNumber
        abi: $abi
        type: $type
        program: $program
      }
    ) {
      id
    }
  }
`;


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
