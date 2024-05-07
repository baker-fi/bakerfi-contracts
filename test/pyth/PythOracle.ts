import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";

import {AbiCoder} from "ethers";

const WETH_USD_FEED_ID = "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace";

describeif(network.name === "hardhat")("Pyth Oracle Tests", function () {
    
    async function deployFunction() {
        const PythMock = await ethers.getContractFactory("PythMock");
        const pythMock = await PythMock.deploy();
        await pythMock.waitForDeployment();
        
        const PythOracle = await ethers.getContractFactory("PythOracle");
        const pythOracle = await PythOracle.deploy(
            WETH_USD_FEED_ID,
            await pythMock.getAddress()
        );
        await pythOracle.waitForDeployment();
        return { pythMock, pythOracle} ;
    }

    it("Pyth Oracle Tests - Decimal Price", async function () {
        const { pythMock, pythOracle } = await loadFixture(deployFunction);    
        expect(await pythOracle.getPrecision()).to.equal(18);
       
       const updateData = new AbiCoder().encode([
            "tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))"], 
            [[
                WETH_USD_FEED_ID,
                [120000,0, -2, 1706801584],
                [120000,0, -2, 1706801584]
            ]
        ]);  
       await pythMock.updatePriceFeeds([updateData], {value: 10 });
       const [price] = await pythOracle.getLatestPrice();
       expect(price).to.equal(ethers.parseUnits("1200", 18));
    });

    it("Pyth Oracle Tests - Fractional Price", async function () {
        const { pythMock, pythOracle } = await loadFixture(deployFunction);    
        expect(await pythOracle.getPrecision()).to.equal(18);
       const updateData = new AbiCoder().encode([
            "tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))"], 
            [[
                WETH_USD_FEED_ID,
                [12,0, 2, 1706801584],
                [12,0, 2, 1706801584]
            ]
        ]);  
     
       await pythMock.updatePriceFeeds([updateData], {value: 10 });
       const [price] = await pythOracle.getLatestPrice();
       expect(price).to.equal(ethers.parseUnits("1200", 18));
    });

    it("Pyth Oracle Tests - Update and Get the Latest Price", async function () {
        const { pythMock, pythOracle } = await loadFixture(deployFunction);    
        const updateData = new AbiCoder().encode([
            "tuple(bytes32, tuple(int64, uint64, int32, uint),  tuple(int64, uint64, int32, uint))"], 
            [[
                WETH_USD_FEED_ID,
                [1200,0, 2, 1706801584],
                [1200,0, 2, 1706801584]
            ]]);  
       await pythOracle.getAndUpdatePrice(updateData, {
        value: 10,
       });
       const [price] = await pythOracle.getLatestPrice();
       expect(price).to.equal(ethers.parseUnits("120000", 18));
    })
});