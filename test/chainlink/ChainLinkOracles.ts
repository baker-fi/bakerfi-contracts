
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";

import BaseConfig from "../../scripts/config";

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


export async function deploy() {
    const [owner] = await ethers.getSigners();
    const networkName = network.name;
    const config = BaseConfig[networkName];
    const WstETHToETHOracle = await ethers.getContractFactory("WstETHToETHOracle");
    const wstETHToETH = await WstETHToETHOracle.deploy(config.wstETHToETH);

    const EthToUSD = await ethers.getContractFactory("ETHOracle");
    const ethToUSD = await EthToUSD.deploy(config.wstETHToETH);

    const CbETHToETH = await ethers.getContractFactory("CbETHToETHOracle");
    const cbETHToETH = await CbETHToETH.deploy(config.cbETHToETH);

    return { owner, wstETHToETH, ethToUSD, cbETHToETH };
}