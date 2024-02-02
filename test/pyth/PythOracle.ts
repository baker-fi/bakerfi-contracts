import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";

import {AbiCoder} from "ethers";

describeif(network.name === "hardhat")("Pyth Oracle Tests", function () {
    
    async function deployFunction() {
        const PythMock = await ethers.getContractFactory("PythMock");
        const pythMock = await PythMock.deploy();
        await pythMock.waitForDeployment();
        
        const PythOracle = await ethers.getContractFactory("PythOracle");
        const pythOracle = await PythOracle.deploy(
            ethers.keccak256(Buffer.from("WETH/USD")),
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
                ethers.keccak256(Buffer.from("WETH/USD")),
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
                ethers.keccak256(Buffer.from("WETH/USD")),
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
                ethers.keccak256(Buffer.from("WETH/USD")),
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