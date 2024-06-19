import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { describeif } from "../common";
import { deployServiceRegistry } from "../../scripts/common";

describeif(network.name === "hardhat")("UseQuoter", function () {

    /**
     * Deploys the UseUniQuoter with a proxy
     * @returns 
     */
    async function deployFunction() {
        const [owner] = await ethers.getSigners();

        const serviceRegistry = await deployServiceRegistry(owner.address);

        const BakerFiProxy = await ethers.getContractFactory("BakerFiProxy");
        const BakerFiProxyAdmin = await ethers.getContractFactory("BakerFiProxyAdmin");
        const proxyAdmin = await BakerFiProxyAdmin.deploy(owner.address);
        await proxyAdmin.waitForDeployment();

        const Quoter = await ethers.getContractFactory("QuoterV2Mock");

        
        const quoter = await Quoter.deploy();
        await quoter.waitForDeployment();

        await serviceRegistry.registerService(
            ethers.keccak256(Buffer.from("Uniswap Quoter")),
            await quoter.getAddress()
        );

        const UseUniQuoter = await ethers.getContractFactory("UseUniQuoterMock");
        const useUniQuoterImpl = await UseUniQuoter.deploy();
        await useUniQuoterImpl.waitForDeployment();

        const proxyDeployment = await BakerFiProxy.deploy(
            await useUniQuoterImpl.getAddress(),
            await proxyAdmin.getAddress(),
            UseUniQuoter.interface.encodeFunctionData("initialize", [
                await serviceRegistry.getAddress()
            ])
          );
        
        await proxyDeployment.waitForDeployment();    

        const useUniQuoter = await UseUniQuoter.attach(await proxyDeployment.getAddress());

        return {quoter, useUniQuoter, serviceRegistry};
    }

    it("test singleInput - min Output", async function () {      
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        const txRes = await useUniQuoter.getExactInputMinimumOutput.staticCall(
            await quoter.getAddress(), 
            await quoter.getAddress(), 
            1n*(10n**18n),
            10,
            1n*(10n**7n) // 1%
        );
        expect(txRes[0]).equal(100n*(10n**16n));
        expect(txRes[1]).equal(99n*(10n**16n));
    })

    it("test singleOut - max Output", async function () {
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        const txRes = await useUniQuoter.getExactOutputMaxInput.staticCall(
            await quoter.getAddress(), 
            await quoter.getAddress(), 
            1n*(10n**18n),
            10,
            1n*(10n**7n) // 1%
        );
        expect(txRes[0]).equal(100n*(10n**16n));
        expect(txRes[1]).equal(101n*(10n**16n));
    })


    it("test singleInput - Price Rate double", async function () {
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        await quoter.setRatio(2n*(10n**9n));
        const txRes = await useUniQuoter.getExactInputMinimumOutput.staticCall(
            await quoter.getAddress(), 
            await quoter.getAddress(), 
            1n*(10n**18n),
            10,
            1n*(10n**7n) // 1%
        );
        expect(txRes[0]).equal(50n*(10n**16n));
        expect(txRes[1]).equal(495n*(10n**15n));
    });


    it("test getExactOutputMaxInput - Price Rate double", async function () {
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        await quoter.setRatio(2n*(10n**9n));
        const txRes = await useUniQuoter.getExactOutputMaxInput.staticCall(
            await quoter.getAddress(), 
            await quoter.getAddress(), 
            1n*(10n**18n),
            10,
            1n*(10n**7n) // 1%
        );
        expect(txRes[0]).equal(200n*(10n**16n));
        expect(txRes[1]).equal(202n*(10n**16n));
    });

    it("test singleInput - Slippage 0", async function () {
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        await quoter.setRatio(2n*(10n**9n));
        const txRes = await useUniQuoter.getExactInputMinimumOutput.staticCall(
            await quoter.getAddress(), 
            await quoter.getAddress(), 
            1n*(10n**18n),
            10,
            0// 1%
        );
        expect(txRes[0]).equal(50n*(10n**16n));
        expect(txRes[1]).equal(50n*(10n**16n));
    });


    it("test singleOutput - Slippage 0", async function () {
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        await quoter.setRatio(2n*(10n**9n));
        const txRes = await useUniQuoter.getExactOutputMaxInput.staticCall(
            await quoter.getAddress(), 
            await quoter.getAddress(), 
            1n*(10n**18n),
            10,
            0 // 1%
        );
        expect(txRes[0]).equal(200n*(10n**16n));
        expect(txRes[1]).equal(200n*(10n**16n));
    });
    it("test singleInput - Slippage 100%", async function () {
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        await quoter.setRatio(2n*(10n**9n));
        const txRes = await useUniQuoter.getExactInputMinimumOutput.staticCall(
            await quoter.getAddress(), 
            await quoter.getAddress(), 
            1n*(10n**18n),
            10,
            1n*(10n**9n)// 1%
        );
        expect(txRes[0]).equal(50n*(10n**16n));
        expect(txRes[1]).equal(0);
    });


    it("test singleOutput - Slippage 100%", async function () {
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        await quoter.setRatio(2n*(10n**9n));
        const txRes = await useUniQuoter.getExactOutputMaxInput.staticCall(
            await quoter.getAddress(), 
            await quoter.getAddress(), 
            1n*(10n**18n),
            10,
            1n*(10n**9n) // 1%
        );
        expect(txRes[0]).equal(200n*(10n**16n));
        expect(txRes[1]).equal(400n*(10n**16n));
    });

    it("test singleOutput - Slippage 400%", async function () {
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        await quoter.setRatio(2n*(10n**9n));
        const txRes = await useUniQuoter.getExactOutputMaxInput.staticCall(
            await quoter.getAddress(), 
            await quoter.getAddress(), 
            1n*(10n**18n),
            10,
            4n*(10n**9n) // 1%
        );
        expect(txRes[0]).equal(200n*(10n**16n));
        expect(txRes[1]).equal(1000n*(10n**16n));
    });


    it("Revert singleInput for 200% ❌", async function () {
        const { quoter, useUniQuoter, serviceRegistry} = await loadFixture(deployFunction);
        expect(await useUniQuoter.uniQuoterA()).equal(
            await quoter.getAddress(),
        );
        await quoter.setRatio(2n*(10n**9n));
        await expect(
            useUniQuoter.getExactInputMinimumOutput.staticCall(
                await quoter.getAddress(), 
                await quoter.getAddress(), 
                1n*(10n**18n),
                10,
                2n*(10n**9n) // 200%
            )
          ).to.be.revertedWithCustomError(useUniQuoter, "InvalidSlippageInput");
    });

    
})