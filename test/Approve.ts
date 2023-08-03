import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Approve", function () {

    async function deployBaseFunction() {
        
        const [owner, otherAccount] = await ethers.getSigners();

        const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
        const ERC20_MAX_SUPPLY = ethers.parseUnits("10000000", 18);
        const MOCK_TOKEN_NAME = "Mock ERC20";
        const MOCK_TOKEN_SYMBOL = "MTOKEN";        

        const erc20 = await ERC20Mock.deploy(
            MOCK_TOKEN_NAME,
            MOCK_TOKEN_SYMBOL, 
            ERC20_MAX_SUPPLY, 
            owner.address 
        );       
        await erc20.waitForDeployment();

        const DSProxyFactory = await ethers.getContractFactory("DSProxyFactory");
        const proxyFactory = await DSProxyFactory.deploy();        
        await proxyFactory.waitForDeployment();
        const proxyFactoryAddress = await proxyFactory.getAddress();

        const DSProxyRegistry = await ethers.getContractFactory("DSProxyRegistry");
        const proxyRegistry = await DSProxyRegistry.deploy(proxyFactoryAddress);
        await proxyRegistry.waitForDeployment();
        const proxyRegistryAddress = await proxyRegistry.getAddress();

        // Create a DSPRoxy for this owner
        await proxyRegistry.build();

        const ServiceRegistry = await ethers.getContractFactory("ServiceRegistry");
        const serviceRegistry = await ServiceRegistry.deploy(
            owner.address
        );        
        await serviceRegistry.waitForDeployment();

        const serviceAddress = await serviceRegistry.getAddress();

        const Stack = await ethers.getContractFactory("Stack");
        const stack = await Stack.deploy(
            serviceAddress
        );     
        await stack.waitForDeployment();

        await serviceRegistry.registerService(
            ethers.keccak256(Buffer.from("StackService")),
            await stack.getAddress()
        );
        const SetApproval = await ethers.getContractFactory("SetApproval");
        const setApproval = await SetApproval.deploy(
            serviceAddress
        );     

        await setApproval.waitForDeployment();

        return { owner, otherAccount,  erc20, proxyRegistry, serviceRegistry, setApproval };
    }


    describe("Approve", async function () {
        it("The owner of the contract is provided account", async function () {
            const { owner, erc20, proxyRegistry, serviceRegistry, setApproval, otherAccount} = await loadFixture(deployBaseFunction);
            const proxyAddress = await proxyRegistry.proxies(owner.address);
            const ownerProxy = await ethers.getContractAt("DSProxy", proxyAddress);
            const encodeData = ethers.AbiCoder.defaultAbiCoder().encode([ "address", "address", "uint256" ], 
                [ await erc20.getAddress(), otherAccount.address ,  ethers.parseUnits("10", 18)]);
            const encodedCall = setApproval.interface.encodeFunctionData("run", [
                encodeData,
                [0,0,0]
            ]);
            await ownerProxy.executeTarget(
                await setApproval.getAddress(),
                encodedCall
            );
            expect(await erc20.allowance(proxyAddress,  otherAccount.address)).to.equal(ethers.parseUnits("10", 18));  
        })
    });

})