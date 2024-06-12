
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";

import BaseConfig from "../../scripts/config";

export async function deploy() {
    const [owner] = await ethers.getSigners();
    const networkName = network.name;
    const config = BaseConfig[networkName];
    const WstETHToETHOracle = await ethers.getContractFactory("ChainLinkOracle");
    const wstETHToETH = await WstETHToETHOracle.deploy(config.wstETHToETH);
    const EthToUSD = await ethers.getContractFactory("ChainLinkOracle");
    const ethToUSD = await EthToUSD.deploy(config.wstETHToETH);
    const CbETHToETH = await ethers.getContractFactory("ChainLinkOracle");
    const cbETHToETH = await CbETHToETH.deploy(config.cbETHToETH);
    return { owner, wstETHToETH, ethToUSD, cbETHToETH };
}


describeif(
    network.name === "arbitrum_devnet"
)("Testing ChainLink Oracles on Devnet" , function () {

   it("Testing wstETH/ETH Oracle",async () => {
    const { owner, wstETHToETH, ethToUSD } = await loadFixture(deploy);

    const [price, updatedAt] = await wstETHToETH.getLatestPrice();
    // @ts-expect-error
    expect(price).to.greaterThan(1000269654884159300n);
    // @ts-expect-error
    expect(updatedAt).to.greaterThan(1700000000n);
   });

   it("Testing ETH/USD Oracle",async () => {
    const { ethToUSD } = await loadFixture(deploy);

    const [price, updatedAt] = await ethToUSD.getLatestPrice();
    // @ts-expect-error
    expect(price).to.greaterThan(1000269654884159300n);
    // @ts-expect-error
    expect(updatedAt).to.greaterThan(1700000000n);
   });

   
   it("Testing cbETH/USD Oracle",async () => {
    const { cbETHToETH } = await loadFixture(deploy);
    const [price, updatedAt] = await cbETHToETH.getLatestPrice();
    // @ts-expect-error
    expect(price).to.greaterThan(1000269654884159300n);
    // @ts-expect-error
    expect(updatedAt).to.greaterThan(1700000000n);
   });

})


describeif(network.name === "hardhat")
    ("Testing ChainLink Oracles with Aggregator Mocks" , function () {

    async function deployFunction() {
        const ChainLinkAggregator = await ethers.getContractFactory("ChainLinkAggregatorMock")
        const aggregator = await ChainLinkAggregator.deploy();
        await aggregator.waitForDeployment();

        const ChainLinkOracle = await ethers.getContractFactory("ChainLinkOracle");        
        const oracle = await ChainLinkOracle.deploy(
            await aggregator.getAddress()
        );
        await oracle.waitForDeployment();
        return {oracle, aggregator};
    }   

    it("Check Default Price and Decimals", async function () {    
        const { oracle,  aggregator} = await loadFixture(deployFunction);
        const [price, updatedAt] = await oracle.getLatestPrice();
        const block = await ethers.provider.getBlock(0);
        expect(price).to.equal(3500n*(10n**18n));
        expect(await aggregator.decimals()).to.equal(6);
        expect(updatedAt).to.greaterThan(block?.timestamp);
    });


    it("Check Price after changing prices", async function () {    
        const { oracle,  aggregator} = await loadFixture(deployFunction);
        
        await aggregator.setLatestPrice(3600n*(10n**6n));    
        
        const blockNumber = await ethers.provider.getBlockNumber();
        const block = await ethers.provider.getBlock(blockNumber);        
        
        const [price, updatedAt] = await oracle.getLatestPrice();
        
        expect(price).to.equal(3600n*(10n**18n));
        expect(updatedAt).to.equal(block?.timestamp);
    });


    it("Check Min Price", async function () {    
        const { oracle,  aggregator} = await loadFixture(deployFunction);        
        await aggregator.setLatestPrice(1);         
        const [price] = await oracle.getLatestPrice();        
        expect(price).to.equal(1n*(10n**12n));
    });
    

})