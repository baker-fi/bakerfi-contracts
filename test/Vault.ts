
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Vault", function () {


    async function deployVault() {
        const [owner, otherAccount, anotherAccount] = await hre.ethers.getSigners();

        const ERC20Mock = await hre.ethers.getContractFactory("ERC20Mock");
        const Vault = await hre.ethers.getContractFactory("Vault");
        // Mock Token has 10M of Supply
        const ERC20_MAX_SUPPLY = hre.ethers.parseUnits("10000000", 18);
        const MOCK_TOKEN_NAME = "Mock ERC20";
        const MOCK_TOKEN_SYMBOL = "MTOKEN";        
        const VAULT_TOKEN_NAME = "xMock ERC20";
        const VAULT_TOKEN_SYMBOL = "xMTOKEN";        
        const erc20 = await ERC20Mock.deploy(
            MOCK_TOKEN_NAME,
            MOCK_TOKEN_SYMBOL, 
            ERC20_MAX_SUPPLY, 
            owner.address 
        );        
        await erc20.waitForDeployment();
        // Transfer 100K of MTOKENS to Other Account
        await erc20.transfer(otherAccount.address, hre.ethers.parseUnits("100000", 18));
        // Transfer 100K of MTOKENS to Another Account        
        await erc20.transfer(anotherAccount.address, hre.ethers.parseUnits("100000", 18));
        
        const vault = await Vault.deploy(
            await erc20.getAddress(), 
            owner.address, 
            VAULT_TOKEN_NAME, 
            VAULT_TOKEN_SYMBOL
        );

        await vault.waitForDeployment();
     
        return { vault, owner, otherAccount, anotherAccount,  erc20 };
    }
   
    describe("Vault Initialization", function () {
        it("The owner of the contract is provided account", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.owner()).to.equal(owner.address);
        });
        it("The Token name", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.name()).to.equal("xMock ERC20");
        });

        it("The symbol name", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.symbol()).to.equal("xMTOKEN");
        });

        it("The total supply", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.totalSupply()).to.equal(0);
        });
        it("The total collateral", async function () {
            const { owner, vault} = await loadFixture(deployVault);                    
            expect(await vault.collateral()).to.equal(0);
        });
        it("When i Deposit 10000 i should get 10000 shares", async function () {
            const { owner, vault, erc20} = await loadFixture(deployVault);
            const amountToDeposit = hre.ethers.parseUnits("100000", 18);
            await erc20.approve(await vault.getAddress(), amountToDeposit);
            
            expect(await vault.putaquepariu).to.equal([1,2])     
        }) 
    });


});